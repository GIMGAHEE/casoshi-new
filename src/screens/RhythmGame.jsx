import { useState, useRef, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { sfx } from '../utils/sound';
import {
  generateTimeline,
  RARITY_INFO,
  JUDGMENT,
  JUDGMENT_SCORE,
  NOTE_TRAVEL_MS,
  SESSION_DURATION_MS,
} from '../data/rhythm';

// ===== 페버 조건 =====
const FEVER_TRIGGER_COMBO = 10;       // 10 PERFECT 연쇄 → 페버 진입
const FEVER_DURATION_MS = 8_000;

// 콤보 마일스톤 (사운드 cue)
const COMBO_MILESTONES = new Set([10, 25, 50, 100]);

// 레인(방향)별 화면 시작 위치 (%)
const LANE_ORIGIN = {
  top:   { x: 50, y: -12 },
  left:  { x: -12, y: 50 },
  right: { x: 112, y: 50 },
};

// 히트 존 중심 (%)
const HIT_CENTER = { x: 50, y: 55 };

export default function RhythmGame({ points, setPoints, onBack }) {
  const [state, setState] = useState('title');          // title | countdown | playing | result
  const [countdown, setCountdown] = useState(3);
  const [timeline, setTimeline] = useState(null);
  const [elapsed, setElapsed] = useState(0);             // 세션 경과 시간 (ms)
  const [activeNotes, setActiveNotes] = useState([]);    // 현재 날아오는 노트
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [perfectStreak, setPerfectStreak] = useState(0);
  const [stats, setStats] = useState({ perfect: 0, good: 0, miss: 0 });
  const [bestScore, setBestScore] = useLocalStorage('casoshi:rhythm:best', 0);
  const [fever, setFever] = useState(false);
  const [feverEndsAt, setFeverEndsAt] = useState(0);
  const [judgmentFx, setJudgmentFx] = useState(null);    // 최근 판정 이펙트
  const [hearts, setHearts] = useState([]);              // 성공 시 터지는 하트 파티클

  const startTimeRef = useRef(0);
  const notesIndexRef = useRef(0);                       // 다음 스폰할 노트 인덱스
  const rafRef = useRef(null);
  const judgmentFxTimerRef = useRef(null);

  // 타임라인 생성 (게임 시작 시)
  const startGame = () => {
    sfx.click();
    const tl = generateTimeline();
    setTimeline(tl);
    notesIndexRef.current = 0;
    setActiveNotes([]);
    setScore(0);
    setCombo(0);
    setPerfectStreak(0);
    setStats({ perfect: 0, good: 0, miss: 0 });
    setFever(false);
    setState('countdown');
    setCountdown(3);
  };

  // 카운트다운
  useEffect(() => {
    if (state !== 'countdown') return;
    if (countdown === 0) {
      startTimeRef.current = performance.now();
      setState('playing');
      return;
    }
    sfx.click();
    const t = setTimeout(() => setCountdown(c => c - 1), 800);
    return () => clearTimeout(t);
  }, [state, countdown]);

  // 메인 게임 루프 (60fps)
  useEffect(() => {
    if (state !== 'playing') return;

    const loop = () => {
      const now = performance.now();
      const t = now - startTimeRef.current;
      setElapsed(t);

      // 1. 스폰할 노트 체크
      const tl = timeline || [];
      while (
        notesIndexRef.current < tl.length &&
        tl[notesIndexRef.current].spawnTime <= t
      ) {
        const n = tl[notesIndexRef.current];
        setActiveNotes(prev => [...prev, { ...n, spawnedAt: now }]);
        notesIndexRef.current += 1;
      }

      // 2. 놓친 노트(hit time + GOOD window 초과) 정리 → MISS 처리
      setActiveNotes(prev => {
        const missed = [];
        const remain = prev.filter(n => {
          const deltaFromHit = t - n.hitTime;
          if (deltaFromHit > JUDGMENT.GOOD) {
            missed.push(n);
            return false;
          }
          return true;
        });
        if (missed.length > 0) {
          missed.forEach(() => {
            setCombo(0);
            setPerfectStreak(0);
            setStats(s => ({ ...s, miss: s.miss + 1 }));
          });
          showJudgment('MISS');
        }
        return remain;
      });

      // 3. 페버 종료 체크
      if (fever && now > feverEndsAt) {
        setFever(false);
      }

      // 4. 세션 종료
      if (t >= SESSION_DURATION_MS + 2000) {
        endGame();
        return;
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, fever, feverEndsAt, timeline]);

  const showJudgment = (label, rarity = 'N') => {
    clearTimeout(judgmentFxTimerRef.current);
    setJudgmentFx({ label, rarity, id: Date.now() + Math.random() });
    judgmentFxTimerRef.current = setTimeout(() => setJudgmentFx(null), 500);
  };

  // ★ 핵심: 히트 존 탭 처리
  const handleHit = () => {
    if (state !== 'playing') return;

    const t = performance.now() - startTimeRef.current;

    // 가장 가까운 활성 노트 찾기
    setActiveNotes(prev => {
      if (prev.length === 0) return prev;
      let bestIdx = -1;
      let bestDelta = Infinity;
      prev.forEach((n, i) => {
        const delta = Math.abs(t - n.hitTime);
        if (delta < bestDelta) {
          bestDelta = delta;
          bestIdx = i;
        }
      });
      if (bestIdx === -1) return prev;

      const n = prev[bestIdx];
      const deltaMs = bestDelta;

      // 판정
      let judgment = null;
      if (deltaMs <= JUDGMENT.PERFECT) judgment = 'PERFECT';
      else if (deltaMs <= JUDGMENT.GOOD) judgment = 'GOOD';

      if (!judgment) {
        // 너무 빠르거나 늦음 — 빈 탭 (무반응 or 약한 fx)
        // 노트는 제거하지 않음
        return prev;
      }

      // ✅ 판정 적중 — 노트 제거 + 점수 처리
      const rarityMult = RARITY_INFO[n.rarity]?.scoreMult || 1;
      const base = JUDGMENT_SCORE[judgment];
      const feverMult = fever ? 2 : 1;
      const gained = Math.round(base * rarityMult * feverMult);

      setScore(s => s + gained);
      setPoints(p => p + gained);

      if (judgment === 'PERFECT') {
        sfx.perfect();
        setStats(s => ({ ...s, perfect: s.perfect + 1 }));
        setCombo(c => {
          const nc = c + 1;
          if (COMBO_MILESTONES.has(nc)) sfx.comboMilestone();
          return nc;
        });
        setPerfectStreak(ps => {
          const next = ps + 1;
          if (next >= FEVER_TRIGGER_COMBO && !fever) {
            // 페버 진입!
            sfx.fever();
            setFever(true);
            setFeverEndsAt(performance.now() + FEVER_DURATION_MS);
          }
          return next;
        });
        // 하트 파티클
        spawnHearts(n.direction, 3);
      } else {
        sfx.good();
        setStats(s => ({ ...s, good: s.good + 1 }));
        setCombo(c => c + 1);
        setPerfectStreak(0);
      }

      showJudgment(judgment, n.rarity);

      // 노트 제거
      return prev.filter((_, i) => i !== bestIdx);
    });
  };

  const spawnHearts = (direction, count) => {
    const now = Date.now();
    const origin = LANE_ORIGIN[direction] || LANE_ORIGIN.top;
    const arr = Array.from({ length: count }, (_, i) => ({
      id: now + i + Math.random(),
      x: HIT_CENTER.x + (Math.random() - 0.5) * 14,
      y: HIT_CENTER.y + (Math.random() - 0.5) * 10,
      dx: (Math.random() - 0.5) * 120,
      dy: -60 - Math.random() * 80,
      delay: i * 40,
    }));
    setHearts(prev => [...prev, ...arr]);
    setTimeout(() => {
      setHearts(prev => prev.filter(h => !arr.find(a => a.id === h.id)));
    }, 1200);
  };

  const endGame = () => {
    cancelAnimationFrame(rafRef.current);
    if (score > bestScore) setBestScore(score);
    sfx.encore();
    setState('result');
  };

  const restart = () => {
    setState('title');
    setElapsed(0);
    setActiveNotes([]);
  };

  // ===== 렌더링 =====
  return (
    <div className="max-w-md mx-auto px-4 py-4 min-h-[calc(100vh-64px)] flex flex-col relative">
      {/* 상단 바 */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="active:scale-95">
          <img
            src="/icons/back.png"
            alt="戻る"
            className="w-10 h-10 object-contain"
            style={{ imageRendering: 'pixelated' }}
            draggable={false}
          />
        </button>
        <div className="text-center">
          <div className="text-sm font-black text-oshi-dark">🎤 推しコール</div>
          {state === 'playing' && (
            <div className="text-[10px] text-oshi-dark/60">リズム合わせてタップ！</div>
          )}
        </div>
        <div className="w-10" />
      </div>

      {/* ===== TITLE ===== */}
      {state === 'title' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="text-5xl">🎤</div>
          <div className="text-3xl font-black text-oshi-main tracking-wide">
            推しコール
          </div>
          <div className="text-xs text-oshi-dark/70 text-center max-w-[14rem]">
            中央に飛んでくるコールに<br />
            タイミングを合わせてタップ！<br />
            <span className="text-oshi-main font-bold">PERFECT × 10</span> でフィーバー突入
          </div>
          <div className="mt-3 bg-white/70 rounded-2xl px-4 py-2 text-[11px] text-oshi-dark/70 space-y-0.5 border border-oshi-sub">
            <div>🔴 PERFECT: +30pt × 희귀도</div>
            <div>🟡 GOOD: +10pt</div>
            <div>❌ MISS: コンボリセット</div>
          </div>
          {bestScore > 0 && (
            <div className="text-xs text-oshi-dark/60">
              最高スコア: <span className="font-black text-oshi-main">{bestScore}</span>
            </div>
          )}
          <button
            onClick={startGame}
            className="mt-4 px-8 py-3 rounded-full bg-oshi-main text-white font-black text-base shadow-lg active:scale-95 transition-transform"
          >
            ▶ START
          </button>
        </div>
      )}

      {/* ===== COUNTDOWN ===== */}
      {state === 'countdown' && (
        <div className="flex-1 flex items-center justify-center">
          <div
            key={countdown}
            className="text-9xl font-black text-oshi-main"
            style={{ animation: 'cdPulse 0.8s ease-out' }}
          >
            {countdown > 0 ? countdown : 'GO!'}
          </div>
        </div>
      )}

      {/* ===== PLAYING ===== */}
      {state === 'playing' && (
        <PlayField
          elapsed={elapsed}
          activeNotes={activeNotes}
          score={score}
          combo={combo}
          fever={fever}
          feverEndsAt={feverEndsAt}
          stats={stats}
          judgmentFx={judgmentFx}
          hearts={hearts}
          onHit={handleHit}
        />
      )}

      {/* ===== RESULT ===== */}
      {state === 'result' && (
        <ResultScreen
          score={score}
          stats={stats}
          bestScore={bestScore}
          isNewBest={score === bestScore && score > 0}
          onRestart={startGame}
          onHome={onBack}
        />
      )}

      <style>{`
        @keyframes cdPulse {
          0%   { transform: scale(0.4); opacity: 0; }
          50%  { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes noteFlyIn {
          0%   { opacity: 0; }
          10%  { opacity: 1; }
          100% { opacity: 1; }
        }
        @keyframes judgmentPop {
          0%   { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
          20%  { transform: translate(-50%, -50%) scale(1.3); opacity: 1; }
          80%  { transform: translate(-50%, -70%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -90%) scale(0.9); opacity: 0; }
        }
        @keyframes heartBurst {
          0%   { transform: translate(0, 0) scale(0.5); opacity: 1; }
          100% { transform: translate(var(--dx, 0), var(--dy, -80px)) scale(1.2); opacity: 0; }
        }
        @keyframes feverPulse {
          0%, 100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        @keyframes ringPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
          50%      { transform: translate(-50%, -50%) scale(1.08); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ===== PlayField (게임 중) =====
function PlayField({
  elapsed, activeNotes, score, combo, fever, feverEndsAt,
  stats, judgmentFx, hearts, onHit,
}) {
  const timeLeft = Math.max(0, SESSION_DURATION_MS - elapsed);
  const progress = Math.min(1, elapsed / SESSION_DURATION_MS);
  const feverLeft = fever ? Math.max(0, feverEndsAt - performance.now()) / FEVER_DURATION_MS : 0;

  return (
    <div className="flex-1 flex flex-col mt-2">
      {/* HUD 상단 */}
      <div className="grid grid-cols-3 gap-2 text-center bg-white/70 rounded-2xl p-2 border border-oshi-sub">
        <div>
          <div className="text-[10px] text-oshi-dark/60">SCORE</div>
          <div className="text-sm font-black text-oshi-dark">{score}</div>
        </div>
        <div>
          <div className="text-[10px] text-oshi-dark/60">COMBO</div>
          <div className={`text-sm font-black ${combo >= 10 ? 'text-oshi-main' : 'text-oshi-dark'}`}>
            {combo}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-oshi-dark/60">残り</div>
          <div className="text-sm font-black text-oshi-dark">{(timeLeft / 1000).toFixed(1)}s</div>
        </div>
      </div>

      {/* 진행 바 */}
      <div className="mt-1 h-1 bg-oshi-sub/30 rounded-full overflow-hidden">
        <div
          className="h-full bg-oshi-main transition-[width]"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* 페버 배너 */}
      {fever && (
        <div
          className="mt-2 py-1.5 rounded-xl text-white font-black text-center text-sm shadow"
          style={{
            background:
              'linear-gradient(90deg, #FF6B9D, #FFB800, #B77EE0, #5BA4E0, #FF6B9D)',
            backgroundSize: '200% 100%',
            animation: 'feverPulse 1.2s ease infinite',
          }}
        >
          🔥 FEVER TIME! × 2 배점 ({(feverLeft * (FEVER_DURATION_MS / 1000)).toFixed(1)}s)
        </div>
      )}

      {/* 플레이 스테이지 (노트 비행 영역) */}
      <div
        className="relative flex-1 mt-3 rounded-3xl overflow-hidden border-2 border-oshi-sub"
        style={{
          background:
            fever
              ? 'linear-gradient(135deg, #FFE5EC, #FFF3D0, #E5D4F5, #D4EBFB, #FFE5EC)'
              : 'linear-gradient(180deg, #FFE5EC 0%, #FFD5E3 55%, #F0B8D0 100%)',
          backgroundSize: fever ? '200% 100%' : undefined,
          animation: fever ? 'feverPulse 2s ease infinite' : undefined,
        }}
        onClick={onHit}
        onTouchStart={(e) => { e.preventDefault(); onHit(); }}
      >
        {/* 캐릭터 플레이스홀더 (에셋 교체 예정) */}
        <div
          className="absolute pointer-events-none select-none"
          style={{
            left: '50%',
            top: '18%',
            transform: `translateX(-50%) scale(${fever ? 1.12 : 1})`,
            fontSize: 72,
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))',
            transition: 'transform 0.3s ease',
          }}
        >
          {combo >= 50 ? '🌟' : combo >= 20 ? '💖' : '🎤'}
        </div>

        {/* 관객 실루엣 (플레이스홀더) */}
        <div
          className="absolute left-0 right-0 bottom-0 pointer-events-none"
          style={{
            height: '18%',
            background:
              'linear-gradient(180deg, transparent, rgba(50,30,60,0.55) 40%, rgba(30,15,40,0.85))',
          }}
        />
        {/* 관객 머리 실루엣 도트들 */}
        <div className="absolute left-0 right-0 bottom-3 flex justify-around pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#2a1a3a] rounded-full"
              style={{
                width: 14 + (i % 3) * 4,
                height: 18 + (i % 2) * 4,
                transform: fever
                  ? `translateY(${Math.sin(Date.now() / 200 + i) * 4}px)`
                  : undefined,
              }}
            />
          ))}
        </div>

        {/* 히트 존 링 */}
        <div
          className="absolute rounded-full border-4"
          style={{
            left: `${HIT_CENTER.x}%`,
            top: `${HIT_CENTER.y}%`,
            width: 100,
            height: 100,
            borderColor: fever ? '#FFB800' : '#FF6B9D',
            background: 'rgba(255,255,255,0.3)',
            transform: 'translate(-50%, -50%)',
            animation: 'ringPulse 1s ease-in-out infinite',
            boxShadow: fever
              ? '0 0 24px rgba(255,184,0,0.7), inset 0 0 20px rgba(255,255,255,0.5)'
              : '0 0 16px rgba(255,107,157,0.5), inset 0 0 20px rgba(255,255,255,0.5)',
          }}
        />
        <div
          className="absolute text-xs font-black text-oshi-dark/70 pointer-events-none"
          style={{
            left: `${HIT_CENTER.x}%`,
            top: `${HIT_CENTER.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          HIT!
        </div>

        {/* 활성 노트들 */}
        {activeNotes.map(n => (
          <FlyingNote key={n.id} note={n} elapsed={elapsed} />
        ))}

        {/* 판정 피드백 */}
        {judgmentFx && (
          <div
            key={judgmentFx.id}
            className="absolute font-black pointer-events-none"
            style={{
              left: `${HIT_CENTER.x}%`,
              top: `${HIT_CENTER.y}%`,
              fontSize: judgmentFx.label === 'PERFECT' ? 36 : 28,
              color:
                judgmentFx.label === 'PERFECT'
                  ? RARITY_INFO[judgmentFx.rarity]?.color || '#FF6B9D'
                  : judgmentFx.label === 'GOOD'
                    ? '#FFB800'
                    : '#888',
              textShadow: '0 2px 6px rgba(0,0,0,0.3)',
              animation: 'judgmentPop 0.5s ease-out forwards',
              zIndex: 20,
            }}
          >
            {judgmentFx.label}
          </div>
        )}

        {/* 하트 파티클 */}
        {hearts.map(h => (
          <div
            key={h.id}
            className="absolute text-2xl pointer-events-none"
            style={{
              left: `${h.x}%`,
              top: `${h.y}%`,
              animation: `heartBurst 1.2s ease-out ${h.delay}ms forwards`,
              '--dx': `${h.dx}px`,
              '--dy': `${h.dy}px`,
            }}
          >
            💖
          </div>
        ))}
      </div>

      <div className="mt-2 text-center text-[10px] text-oshi-dark/50">
        画面のどこでもタップ — 中央に近づいたノートを判定
      </div>
    </div>
  );
}

// ===== 날아오는 개별 노트 =====
function FlyingNote({ note, elapsed }) {
  const t = elapsed - note.spawnTime;          // 스폰 후 경과
  const progress = Math.max(0, Math.min(1, t / NOTE_TRAVEL_MS));
  const origin = LANE_ORIGIN[note.direction] || LANE_ORIGIN.top;
  const x = origin.x + (HIT_CENTER.x - origin.x) * progress;
  const y = origin.y + (HIT_CENTER.y - origin.y) * progress;
  const info = RARITY_INFO[note.rarity] || RARITY_INFO.N;
  // 히트 시각에 가까울수록 커지는 느낌
  const scale = 0.6 + progress * 0.5;

  return (
    <div
      className="absolute pointer-events-none select-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) scale(${scale})`,
        zIndex: 10,
      }}
    >
      <div
        className="px-3 py-1.5 rounded-full font-black text-white text-sm whitespace-nowrap border-2"
        style={{
          background: info.color,
          borderColor: note.rarity === 'SSR' ? '#fff' : 'rgba(255,255,255,0.6)',
          boxShadow: info.glow !== 'none' ? info.glow : '0 2px 4px rgba(0,0,0,0.2)',
        }}
      >
        {note.phrase}
      </div>
      {note.rarity === 'SSR' && (
        <div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: '0 0 20px rgba(255,184,0,0.9), 0 0 40px rgba(255,184,0,0.5)',
            animation: 'ringPulse 0.6s ease-in-out infinite',
          }}
        />
      )}
    </div>
  );
}

// ===== 결과 화면 =====
function ResultScreen({ score, stats, bestScore, isNewBest, onRestart, onHome }) {
  const totalHits = stats.perfect + stats.good;
  const totalAttempts = totalHits + stats.miss;
  const accuracy = totalAttempts > 0 ? Math.round((stats.perfect / totalAttempts) * 100) : 0;

  // S/A/B/C 랭크
  const rank =
    accuracy >= 85 ? 'S' :
    accuracy >= 70 ? 'A' :
    accuracy >= 50 ? 'B' : 'C';

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-6">
      <div className="text-4xl font-black text-oshi-main" style={{ animation: 'cdPulse 0.6s ease-out' }}>
        アンコール！
      </div>
      <div className="text-xs text-oshi-dark/70">ありがとう、推し最高！</div>

      <div className="w-full max-w-xs bg-white rounded-3xl p-5 shadow-lg border-2 border-oshi-sub">
        <div className="text-center mb-3">
          <div className="text-[10px] text-oshi-dark/60 uppercase tracking-widest">Final Score</div>
          <div className="text-5xl font-black text-oshi-main">{score}</div>
          {isNewBest && (
            <div className="inline-block mt-1 px-2 py-0.5 rounded-full bg-oshi-main text-white text-[10px] font-bold">
              🏆 新記録！
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          <Stat label="ランク" value={rank} big color="#FF6B9D" />
          <Stat label="PERFECT" value={stats.perfect} color="#FF6B9D" />
          <Stat label="GOOD" value={stats.good} color="#FFB800" />
          <Stat label="MISS" value={stats.miss} color="#888" />
        </div>

        <div className="mt-3 text-center text-xs text-oshi-dark/70">
          正解率 <span className="font-bold text-oshi-main">{accuracy}%</span>
          {bestScore > 0 && !isNewBest && (
            <span> ・ BEST <span className="font-bold">{bestScore}</span></span>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onRestart}
          className="px-5 py-2.5 rounded-full bg-oshi-main text-white font-black text-sm shadow active:scale-95"
        >
          もう一回
        </button>
        <button
          onClick={onHome}
          className="px-5 py-2.5 rounded-full bg-white border-2 border-oshi-sub text-oshi-dark font-bold text-sm active:scale-95"
        >
          ホーム
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, big, color }) {
  return (
    <div>
      <div className="text-[9px] text-oshi-dark/60">{label}</div>
      <div
        className={`${big ? 'text-2xl' : 'text-base'} font-black`}
        style={{ color: color || '#2D1B2E' }}
      >
        {value}
      </div>
    </div>
  );
}
