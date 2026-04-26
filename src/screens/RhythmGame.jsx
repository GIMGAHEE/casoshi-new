import { useState, useRef, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { sfx } from '../utils/sound';
import { createBgmEngine } from '../utils/rhythmBgm';
import {
  generateTimeline,
  RARITY_INFO,
  JUDGMENT,
  JUDGMENT_SCORE,
  NOTE_TRAVEL_MS,
  SESSION_DURATION_MS,
  SABI_START_MS,
  SABI_END_MS,
  SABI_BANNER_LEAD_MS,
  SABI_SCORE_MULT,
} from '../data/rhythm';

// ===== 페버 조건 =====
const FEVER_TRIGGER_COMBO = 10;       // 10 PERFECT 연쇄 → 페버 진입
const FEVER_DURATION_MS = 8_000;

// 콤보 마일스톤 (사운드 cue)
const COMBO_MILESTONES = new Set([10, 25, 50, 100]);

// ===== 💬 캐릭터 말풍선 멘트 =====
const SPEECH_MAP = {
  combo5:     ['いいよ〜！', 'うんうん〜♪', 'のってきた！'],
  combo10:    ['ノリノリ〜！', 'もっとー！', 'キタコレ〜！'],
  combo20:    ['スゴイ！！', '神！！', 'サイコー！！'],
  combo50:    ['伝説！！！', 'LEGEND！', '世界一！！'],
  ssrHit:     ['スゴイ！', 'やったー！', 'レア〜！'],
  feverStart: ['キャーーー！', 'フィーバー！！', 'アゲてこ〜！'],
  sabiStart:  ['サビ来るよ〜！', 'ここから！！', 'いくよーー！'],
  miss:       ['えっ...', 'おっと〜', 'ドンマイ！'],
};
const pickSpeech = (key) => {
  const arr = SPEECH_MAP[key] || ['💖'];
  return arr[Math.floor(Math.random() * arr.length)];
};

export default function RhythmGame({ points, setPoints, myOshi, onBack }) {
  // 4프레임 댄스 sprite — elapsed 시간에 맞춰 순환
  const DANCE_FRAMES = ['/rhythm/dance_1.png', '/rhythm/dance_2.png', '/rhythm/dance_3.png', '/rhythm/dance_4.png'];
  const FEVER_FRAMES = ['/rhythm/fever_1.png', '/rhythm/fever_2.png', '/rhythm/fever_3.png', '/rhythm/fever_4.png'];

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
  const [feverCutIn, setFeverCutIn] = useState(false);
  const [comboBadge, setComboBadge] = useState(null);
  // 일시적 리액션 컷인 (SSR 캐치 / MISS 등) — { sprite, id }
  const [reactionSprite, setReactionSprite] = useState(null);
  const [judgmentFx, setJudgmentFx] = useState(null);    // 최근 판정 이펙트
  const [hearts, setHearts] = useState([]);              // 성공 시 터지는 하트 파티클
  const [sabiActive, setSabiActive] = useState(false);   // 현재 사비 구간인지
  const [sabiBanner, setSabiBanner] = useState(false);   // 사비 배너 표시 중인지
  const [speech, setSpeech] = useState(null);            // 캐릭터 말풍선

  const startTimeRef = useRef(0);
  const notesIndexRef = useRef(0);                       // 다음 스폰할 노트 인덱스
  const rafRef = useRef(null);
  const judgmentFxTimerRef = useRef(null);
  const sabiBannerFiredRef = useRef(false);              // 배너 중복 트리거 방지
  const prevComboRef = useRef(0);                        // 콤보 마일스톤 말풍선 트리거용
  const bgmRef = useRef(null);                           // BGM 엔진

  // 말풍선 표시 (id 바뀔 때마다 useEffect 가 auto-cleanup)
  const showSpeech = (key) => {
    const text = pickSpeech(key);
    setSpeech({ text, id: Date.now() + Math.random() });
  };

  // 말풍선 자동 제거 (id 변경 시 이전 타이머 cleanup — race 없음)
  useEffect(() => {
    if (!speech) return;
    const t = setTimeout(() => setSpeech(null), 1250);
    return () => clearTimeout(t);
  }, [speech?.id]);

  // 캐릭터 리액션 컷인 (cheer / heart / sad 등 sprite 잠깐 표시)
  const showReaction = (sprite, durationMs = 800) => {
    setReactionSprite({ sprite, id: Date.now() + Math.random() });
    setTimeout(() => {
      setReactionSprite(curr => (curr?.sprite === sprite ? null : curr));
    }, durationMs);
  };

  // BGM 엔진 lazy init + unmount cleanup
  useEffect(() => {
    if (!bgmRef.current) bgmRef.current = createBgmEngine();
    return () => {
      if (bgmRef.current) bgmRef.current.stop();
    };
  }, []);

  // 콤보에 따라 BGM 레이어 레벨 조절
  useEffect(() => {
    if (!bgmRef.current) return;
    const level = combo >= 25 ? 2 : combo >= 10 ? 1 : 0;
    bgmRef.current.setLevel(level);
  }, [combo]);

  // 페버 상태 BGM에 전달
  useEffect(() => {
    if (!bgmRef.current) return;
    bgmRef.current.setFever(fever);
  }, [fever]);

  // 콤보 마일스톤 말풍선
  useEffect(() => {
    const prev = prevComboRef.current;
    if (combo === prev) return;
    if (prev < 5  && combo >= 5)  showSpeech('combo5');
    if (prev < 10 && combo >= 10) showSpeech('combo10');
    if (prev < 20 && combo >= 20) showSpeech('combo20');
    if (prev < 50 && combo >= 50) showSpeech('combo50');
    prevComboRef.current = combo;
  }, [combo]);

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
    setSabiActive(false);
    setSabiBanner(false);
    sabiBannerFiredRef.current = false;
    prevComboRef.current = 0;
    setSpeech(null);
    setState('countdown');
    setCountdown(3);
  };

  // 카운트다운
  useEffect(() => {
    if (state !== 'countdown') return;
    if (countdown === 0) {
      startTimeRef.current = performance.now();
      setState('playing');
      // BGM 시작 (카운트다운 끝난 직후)
      if (bgmRef.current) {
        bgmRef.current.setLevel(0);
        bgmRef.current.setFever(false);
        bgmRef.current.start();
      }
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

      // === 사비 트리거 ===
      // 사비 1.5s 전: 배너 + 말풍선
      if (!sabiBannerFiredRef.current && t >= SABI_START_MS - SABI_BANNER_LEAD_MS) {
        sabiBannerFiredRef.current = true;
        setSabiBanner(true);
        showSpeech('sabiStart');
        setTimeout(() => setSabiBanner(false), SABI_BANNER_LEAD_MS + 1000);
      }
      // 사비 active 상태 (점수 배수 적용용)
      const nowInSabi = t >= SABI_START_MS && t < SABI_END_MS;
      if (nowInSabi !== sabiActive) {
        setSabiActive(nowInSabi);
      }

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
          // 콤보가 5+ 였을 때만 sad 컷인 (의미있는 콤보 끊김)
          const wasComboHigh = combo >= 5;
          missed.forEach(() => {
            setCombo(0);
            setPerfectStreak(0);
            setStats(s => ({ ...s, miss: s.miss + 1 }));
          });
          showJudgment('MISS');
          // 가끔 말풍선 (15% 확률)
          if (Math.random() < 0.15) showSpeech('miss');
          if (wasComboHigh) showReaction('sad', 600);
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
  }, [state, fever, feverEndsAt, timeline, sabiActive]);

  const showJudgment = (label, rarity = 'N') => {
    clearTimeout(judgmentFxTimerRef.current);
    setJudgmentFx({ label, rarity, id: Date.now() + Math.random() });
    judgmentFxTimerRef.current = setTimeout(() => setJudgmentFx(null), 500);
  };

  // ★ 핵심: 레인 버튼 탭 처리
  const handleHit = (lane) => {
    if (state !== 'playing') return;

    const t = performance.now() - startTimeRef.current;

    // 같은 레인의 가장 가까운 활성 노트 찾기
    setActiveNotes(prev => {
      if (prev.length === 0) return prev;
      let bestIdx = -1;
      let bestDelta = Infinity;
      prev.forEach((n, i) => {
        if (lane && n.lane !== lane) return;  // 같은 레인만
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
      const sabiMult = sabiActive ? SABI_SCORE_MULT : 1;
      const gained = Math.round(base * rarityMult * feverMult * sabiMult);

      setScore(s => s + gained);
      setPoints(p => p + gained);

      if (judgment === 'PERFECT') {
        sfx.perfect();
        setStats(s => ({ ...s, perfect: s.perfect + 1 }));
        setCombo(c => {
          const nc = c + 1;
          if (COMBO_MILESTONES.has(nc)) {
            sfx.comboMilestone();
            // 콤보 배지 표시
            setComboBadge({ value: nc, id: Date.now() });
            setTimeout(() => setComboBadge(null), 1400);
            // cheer 리액션
            showReaction('cheer', 800);
          }
          return nc;
        });
        setPerfectStreak(ps => {
          const next = ps + 1;
          if (next >= FEVER_TRIGGER_COMBO && !fever) {
            // 페버 진입!
            sfx.fever();
            setFever(true);
            setFeverEndsAt(performance.now() + FEVER_DURATION_MS);
            showSpeech('feverStart');
            // FEVER! 컷인 컴인
            setFeverCutIn(true);
            setTimeout(() => setFeverCutIn(false), 1600);
          }
          return next;
        });
        // SSR PERFECT 캐치 → 말풍선 + 하트 컷인
        if (n.rarity === 'SSR') {
          showSpeech('ssrHit');
          showReaction('heart', 1000);
        }
        // 하트 파티클
        spawnHearts(n.lane, 3);
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

  const spawnHearts = (lane, count) => {
    const now = Date.now();
    // 5레인의 X 중심 (각 20% 간격, 10/30/50/70/90)
    const laneX = { pink: 10, blue: 30, purple: 50, green: 70, orange: 90 };
    const cx = laneX[lane] ?? 50;
    const arr = Array.from({ length: count }, (_, i) => ({
      id: now + i + Math.random(),
      x: cx + (Math.random() - 0.5) * 8,
      y: 80 + (Math.random() - 0.5) * 6,
      dx: (Math.random() - 0.5) * 80,
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
    if (bgmRef.current) bgmRef.current.stop();
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
        <button onClick={() => {
          if (bgmRef.current) bgmRef.current.stop();
          onBack();
        }} className="active:scale-95">
          <img
            src="/icons/back.png"
            alt="戻る"
            className="w-10 h-10 object-contain"
            style={{ imageRendering: 'pixelated' }}
            draggable={false}
          />
        </button>
        <div className="text-center">
          <div className="text-sm font-black text-oshi-dark inline-flex items-center gap-1">
            <img src="/icons/mic.png" alt="" className="w-4 h-4 object-contain" style={{ imageRendering: 'pixelated' }} />
            推しコール
          </div>
          {state === 'playing' && (
            <div className="text-[10px] text-oshi-dark/60">リズム合わせてタップ！</div>
          )}
        </div>
        <div className="w-10" />
      </div>

      {/* ===== TITLE ===== */}
      {state === 'title' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 relative">
          <img
            src="/icons/rhythm.png"
            alt=""
            className="w-24 h-24 object-contain"
            style={{
              imageRendering: 'pixelated',
              filter: 'drop-shadow(0 4px 8px rgba(255,107,157,0.4))',
              animation: 'cdPulse 0.8s ease-out',
            }}
          />
          <div className="text-3xl font-black text-oshi-main tracking-wide">
            推しコール
          </div>
          <div className="text-xs text-oshi-dark/70 text-center max-w-[14rem]">
            中央に飛んでくるコールに<br />
            タイミングを合わせてタップ！<br />
            <span className="text-oshi-main font-bold">PERFECT × 10</span> でフィーバー突入
          </div>
          <div className="mt-2 bg-white/70 rounded-2xl px-4 py-2 text-[11px] text-oshi-dark/70 space-y-1 border border-oshi-sub">
            <div className="flex items-center gap-1.5">
              <img src="/icons/perfect.png" alt="" className="w-4 h-4 object-contain" style={{ imageRendering: 'pixelated' }} />
              <span>PERFECT: +30pt × レア度</span>
            </div>
            <div className="flex items-center gap-1.5">
              <img src="/icons/good.png" alt="" className="w-4 h-4 object-contain" style={{ imageRendering: 'pixelated' }} />
              <span>GOOD: +10pt</span>
            </div>
            <div className="flex items-center gap-1.5">
              <img src="/icons/miss.png" alt="" className="w-4 h-4 object-contain" style={{ imageRendering: 'pixelated' }} />
              <span>MISS: コンボリセット</span>
            </div>
          </div>
          {bestScore > 0 && (
            <div className="text-xs text-oshi-dark/60">
              最高スコア: <span className="font-black text-oshi-main">{bestScore}</span>
            </div>
          )}
          <button
            onClick={startGame}
            className="mt-3 px-8 py-3 rounded-full bg-oshi-main text-white font-black text-base shadow-lg active:scale-95 transition-transform"
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
          charNormalFrames={DANCE_FRAMES}
          charFeverFrames={FEVER_FRAMES}
          feverCutIn={feverCutIn}
          comboBadge={comboBadge}
          reactionSprite={reactionSprite}
          sabiActive={sabiActive}
          sabiBanner={sabiBanner}
          speech={speech}
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
        @keyframes sparkleBurst {
          0%   { transform: translate(-50%, -50%) scale(0.2) rotate(0); opacity: 0; }
          30%  { transform: translate(-50%, -50%) scale(1.15) rotate(15deg); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1.8) rotate(30deg); opacity: 0; }
        }
        @keyframes sabiBannerPop {
          0%   { transform: translate(-50%, -120%) scale(0.6); opacity: 0; }
          15%  { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
          30%  { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          80%  { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -80%) scale(0.9); opacity: 0; }
        }
        @keyframes speechPop {
          0%   { transform: scale(0.3) rotate(-10deg); opacity: 0; }
          20%  { transform: scale(1.15) rotate(2deg); opacity: 1; }
          35%  { transform: scale(1) rotate(0); opacity: 1; }
          75%  { transform: scale(1) rotate(0); opacity: 1; }
          100% { transform: scale(0.85) translateY(-12px); opacity: 0; visibility: hidden; }
        }
        @keyframes feverCutIn {
          0%   { transform: translate(-50%, -50%) scale(0.3) rotate(-15deg); opacity: 0; }
          15%  { transform: translate(-50%, -50%) scale(1.2) rotate(5deg); opacity: 1; }
          25%  { transform: translate(-50%, -50%) scale(1) rotate(0); opacity: 1; }
          75%  { transform: translate(-50%, -50%) scale(1) rotate(0); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(0.85) rotate(0); opacity: 0; }
        }
        @keyframes comboBadge {
          0%   { transform: translate(-50%, -50%) scale(0.4) rotate(-8deg); opacity: 0; }
          20%  { transform: translate(-50%, -50%) scale(1.15) rotate(3deg); opacity: 1; }
          35%  { transform: translate(-50%, -50%) scale(1) rotate(0); opacity: 1; }
          75%  { transform: translate(-50%, -60%) scale(1) rotate(0); opacity: 1; }
          100% { transform: translate(-50%, -80%) scale(0.9) rotate(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ===== PlayField + FlyingNote — 5 LANES VERSION =====
import { LANES, LANE_INFO } from '../data/rhythm';

// 5레인의 X 중심 (% — 화면 가로 위치)
const LANE_X = { pink: 10, blue: 30, purple: 50, green: 70, orange: 90 };
// 노트가 떨어지는 시작 Y (위쪽) 와 도착 Y (히트라인)
const NOTE_START_Y = -5;   // % — 화면 위쪽 밖에서 시작
const HIT_LINE_Y = 88;     // % — 게임 영역 안에서 히트 가이드 위치 (캐릭터 아래)

// ===== PlayField (게임 중) =====
function PlayField({
  elapsed, activeNotes, score, combo, fever, feverEndsAt,
  stats, judgmentFx, hearts, onHit, charNormalFrames, charFeverFrames,
  sabiActive, sabiBanner, speech, feverCutIn, comboBadge, reactionSprite,
}) {
  const timeLeft = Math.max(0, SESSION_DURATION_MS - elapsed);
  const progress = Math.min(1, elapsed / SESSION_DURATION_MS);
  const feverLeft = fever ? Math.max(0, feverEndsAt - performance.now()) / FEVER_DURATION_MS : 0;

  // 캐릭터 스케일/애니메이션
  const charScale = fever ? 1.18 : sabiActive ? 1.1 : combo >= 30 ? 1.08 : combo >= 10 ? 1.04 : 1;

  // ★ 4프레임 댄스 — elapsed (ms) 기준 프레임 인덱스 결정
  const frameDuration = fever ? 150 : sabiActive ? 175 : 200;
  const frames = fever ? charFeverFrames : charNormalFrames;
  const frameIdx = Math.floor((elapsed / frameDuration)) % frames.length;
  // 우선순위: reactionSprite (일시적 sad/heart/cheer) > 페버/일반 댄스 프레임
  const charImage = reactionSprite
    ? `/rhythm/${reactionSprite.sprite}.png`
    : frames[frameIdx];

  return (
    <div className="flex-1 flex flex-col mt-2">
      {/* HUD 상단 — 핑크 픽셀 박스 톤 */}
      <div className="flex items-stretch gap-2 mb-2">
        {/* SCORE */}
        <div
          className="px-3 py-1.5 text-center"
          style={{
            background: 'linear-gradient(180deg, #FF7BB8 0%, #FF5599 100%)',
            border: '2px solid #C73B7E',
            borderRadius: '12px',
            boxShadow: '0 2px 0 #A02960, inset 0 2px 0 rgba(255,255,255,0.4)',
            minWidth: '4.5rem',
          }}
        >
          <div className="text-[8px] text-white/90 font-black tracking-wider drop-shadow">SCORE</div>
          <div className="text-sm font-black text-white tabular-nums" style={{ textShadow: '1px 1px 0 #A02960' }}>
            {String(score).padStart(8, '0')}
          </div>
        </div>
        {/* COMBO */}
        <div
          className="px-3 py-1.5 text-center"
          style={{
            background: 'linear-gradient(180deg, #FF7BB8 0%, #FF5599 100%)',
            border: '2px solid #C73B7E',
            borderRadius: '12px',
            boxShadow: '0 2px 0 #A02960, inset 0 2px 0 rgba(255,255,255,0.4)',
          }}
        >
          <div className="text-[8px] text-white/90 font-black tracking-wider drop-shadow">COMBO</div>
          <div className="text-sm font-black text-white tabular-nums" style={{ textShadow: '1px 1px 0 #A02960' }}>
            {combo}
          </div>
        </div>
        {/* FEVER 게이지 — 하트 모양 */}
        <div
          className="flex-1 relative flex items-center px-3"
          style={{
            background: 'linear-gradient(180deg, #FFB5D5 0%, #FF8FB8 100%)',
            border: '2px solid #C73B7E',
            borderRadius: '12px',
            boxShadow: '0 2px 0 #A02960, inset 0 2px 0 rgba(255,255,255,0.4)',
            overflow: 'hidden',
          }}
        >
          <div className="text-[10px] font-black text-white mr-2 flex items-center gap-0.5" style={{ textShadow: '1px 1px 0 #A02960' }}>
            <span>💖</span>
            <span>FEVER</span>
          </div>
          <div className="flex-1 h-2 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full transition-[width] duration-200"
              style={{
                width: `${(fever ? feverLeft : Math.min(1, combo / FEVER_TRIGGER_COMBO)) * 100}%`,
                background: fever
                  ? 'linear-gradient(90deg, #FFB800, #FF6B9D, #B77EE0)'
                  : 'linear-gradient(90deg, #FFFFFF, #FFE4F0)',
                animation: fever ? 'feverPulse 1s ease infinite' : undefined,
              }}
            />
          </div>
        </div>
        {/* 残り時間 */}
        <div
          className="px-2 py-1.5 text-center"
          style={{
            background: 'linear-gradient(180deg, #FF7BB8 0%, #FF5599 100%)',
            border: '2px solid #C73B7E',
            borderRadius: '12px',
            boxShadow: '0 2px 0 #A02960, inset 0 2px 0 rgba(255,255,255,0.4)',
            minWidth: '3.5rem',
          }}
        >
          <div className="text-[8px] text-white/90 font-black tracking-wider drop-shadow">残り</div>
          <div className="text-sm font-black text-white tabular-nums" style={{ textShadow: '1px 1px 0 #A02960' }}>
            {(timeLeft / 1000).toFixed(0)}s
          </div>
        </div>
      </div>

      {/* 진행 바 */}
      <div className="h-1 bg-oshi-sub/30 rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-oshi-main transition-[width]"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* 게임 영역 — 5레인 무대 */}
      <div
        className="relative flex-1 rounded-3xl overflow-hidden border-2 border-oshi-sub shadow-inner"
        style={{
          backgroundImage: 'url(/rhythm/stage_bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#251a45',
          minHeight: '55vh',
        }}
      >
        {/* fever/sabi 컬러 틴트 (배경 이미지 위에 얹음) */}
        {(fever || sabiActive) && (
          <div className="absolute inset-0 pointer-events-none mix-blend-overlay"
            style={{
              background: fever
                ? 'linear-gradient(180deg, rgba(255,184,0,0.25) 0%, rgba(255,107,157,0.2) 50%, rgba(183,126,224,0.25) 100%)'
                : 'linear-gradient(180deg, rgba(255,107,200,0.15) 0%, rgba(120,80,180,0.1) 100%)',
            }}
          />
        )}

        {/* 관객 (3프레임 애니메이션) — 게임 영역 하단 */}
        <img
          src={`/rhythm/audience_${['default','left','right'][Math.floor(elapsed / 350) % 3]}.png`}
          alt=""
          className="absolute inset-x-0 bottom-0 pointer-events-none select-none"
          style={{
            width: '100%',
            height: '20%',
            objectFit: 'cover',
            objectPosition: 'center top',
            zIndex: 2,
            opacity: fever ? 1 : 0.85,
          }}
          draggable={false}
        />

        {/* 5개 레인 컬러 빔 — 픽셀아트 라이트 빔 이미지 */}
        {LANES.map((lane) => {
          const cx = LANE_X[lane];
          return (
            <img
              key={lane}
              src={`/rhythm/lane_${lane}.png`}
              alt=""
              className="absolute pointer-events-none select-none"
              style={{
                left: `${cx}%`,
                top: 0,
                height: '100%',
                width: 'auto',
                transform: 'translateX(-50%)',
                imageRendering: 'pixelated',
                opacity: fever ? 0.85 : sabiActive ? 0.7 : 0.55,
                zIndex: 1,
              }}
              draggable={false}
            />
          );
        })}

        {/* 가운데 캐릭터 */}
        <img
          src={charImage}
          alt=""
          className="absolute pointer-events-none select-none"
          style={{
            left: '50%',
            // 캐릭터 sprite: 정사각 캔버스 + 발 위치 92%
            // top 12% + height 44% — 발이 게임영역 약 53% 부근, 관객/버튼 영역과 충분한 여유
            top: '12%',
            transform: `translateX(-50%) scale(${charScale})`,
            height: '44%',
            width: 'auto',
            imageRendering: 'pixelated',
            zIndex: 4,
            filter: fever
              ? 'drop-shadow(0 0 16px rgba(255,184,0,0.8)) drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
              : 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))',
            transition: 'transform 0.15s ease',
          }}
          draggable={false}
        />

        {/* 페버 시 배경 글로우 오버레이 */}
        {fever && (
          <div
            className="absolute inset-0 pointer-events-none mix-blend-overlay"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,107,157,0.4), rgba(255,184,0,0.3), rgba(183,126,224,0.4))',
              backgroundSize: '200% 100%',
              animation: 'feverPulse 2s ease infinite',
            }}
          />
        )}

        {/* 사비 active 시 테두리 글로우 + 상단 배지 */}
        {sabiActive && !fever && (
          <>
            <div
              className="absolute inset-0 pointer-events-none rounded-3xl"
              style={{
                boxShadow: 'inset 0 0 28px rgba(255,184,0,0.55), inset 0 0 60px rgba(255,107,157,0.3)',
                animation: 'feverPulse 1.5s ease infinite',
              }}
            />
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 text-white font-bold text-[10px] shadow z-20">
              ✨ サビ ×1.5
            </div>
          </>
        )}

        {/* 💬 캐릭터 말풍선 */}
        {speech && (
          <div
            key={speech.id}
            className="absolute z-20 pointer-events-none"
            style={{
              left: '66%',
              top: '24%',
              animation: 'speechPop 1.2s ease-out forwards',
              willChange: 'transform, opacity',
            }}
          >
            <div className="relative bg-white border-2 border-oshi-main rounded-2xl px-3 py-1.5 shadow-lg whitespace-nowrap">
              <span className="text-[13px] font-black text-oshi-main">{speech.text}</span>
              <div
                className="absolute w-0 h-0"
                style={{
                  left: '-9px', top: '50%',
                  transform: 'translateY(-50%)',
                  borderTop: '6px solid transparent',
                  borderBottom: '6px solid transparent',
                  borderRight: '9px solid #FF6B9D',
                }}
              />
            </div>
          </div>
        )}

        {/* 사비 배너 */}
        {sabiBanner && (
          <div
            className="absolute left-1/2 top-1/3 -translate-x-1/2 z-30 pointer-events-none font-black text-center"
            style={{
              fontSize: 32,
              color: '#fff',
              textShadow: '0 0 12px #FF6B9D, 0 0 24px #FFB800',
              animation: 'sabiBannerPop 1.4s ease-out forwards',
            }}
          >
            ✨ サビ来るよ〜！ ✨
          </div>
        )}

        {/* FEVER 컷인 — 페버 진입 순간 큰 배지 */}
        {feverCutIn && (
          <img
            src="/rhythm/fever_badge.png"
            alt="FEVER"
            className="absolute left-1/2 top-1/2 pointer-events-none z-40"
            style={{
              transform: 'translate(-50%, -50%)',
              width: '85%',
              height: 'auto',
              imageRendering: 'pixelated',
              animation: 'feverCutIn 1.6s ease-out forwards',
              filter: 'drop-shadow(0 4px 16px rgba(255,107,157,0.8))',
            }}
            draggable={false}
          />
        )}

        {/* COMBO 마일스톤 배지 — 10/25/50/100 도달시 */}
        {comboBadge && (() => {
          // 시트에 있는 배지: 10/50/100/200 — 가장 가까운 값으로 매핑
          const target = comboBadge.value >= 100 ? '100'
                       : comboBadge.value >= 50 ? '50'
                       : comboBadge.value >= 25 ? '50'   // 25 는 50 배지 빌려쓰기
                       : '10';
          return (
            <img
              key={comboBadge.id}
              src={`/rhythm/combo_${target}.png`}
              alt=""
              className="absolute pointer-events-none z-40"
              style={{
                left: '50%',
                top: '40%',
                transform: 'translate(-50%, -50%)',
                width: 180,
                height: 'auto',
                imageRendering: 'pixelated',
                animation: 'comboBadge 1.4s ease-out forwards',
                filter: 'drop-shadow(0 4px 12px rgba(255,107,157,0.6))',
              }}
              draggable={false}
            />
          );
        })()}

        {/* 히트 가이드 라인 (5레인 모두 표시) */}
        {LANES.map(lane => {
          const cx = LANE_X[lane];
          return (
            <div
              key={`hit-${lane}`}
              className="absolute pointer-events-none"
              style={{
                left: `${cx}%`,
                top: `${HIT_LINE_Y}%`,
                width: 56,
                height: 56,
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                border: `3px solid ${LANE_INFO[lane].color}`,
                boxShadow: `0 0 16px ${LANE_INFO[lane].glow}`,
                background: 'rgba(255,255,255,0.1)',
                animation: 'ringPulse 1s ease-in-out infinite',
                zIndex: 5,
              }}
            />
          );
        })}

        {/* 활성 노트들 */}
        {activeNotes.map(n => (
          <FlyingNote key={n.id} note={n} elapsed={elapsed} />
        ))}

        {/* 판정 피드백 — 통합 픽셀 이미지 (텍스트+하트) */}
        {judgmentFx && (
          <img
            key={judgmentFx.id}
            src={`/rhythm/hit_${judgmentFx.label.toLowerCase()}.png`}
            alt={judgmentFx.label}
            className="absolute pointer-events-none"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 200,
              height: 'auto',
              imageRendering: 'pixelated',
              filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.4))',
              animation: 'judgmentPop 0.5s ease-out forwards',
              zIndex: 20,
            }}
            draggable={false}
          />
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
              zIndex: 8,
            }}
          >
            💖
          </div>
        ))}
      </div>

      {/* 하단 5개 레인 버튼 — 픽셀아트 */}
      <div className="grid grid-cols-5 gap-2 mt-2">
        {LANES.map(lane => {
          const info = LANE_INFO[lane];
          return (
            <button
              key={lane}
              onTouchStart={(e) => { e.preventDefault(); onHit(lane); }}
              onMouseDown={(e) => { e.preventDefault(); onHit(lane); }}
              className="relative aspect-square rounded-2xl active:scale-90 transition-transform select-none flex items-center justify-center"
              style={{
                filter: `drop-shadow(0 0 12px ${info.glow})`,
              }}
            >
              <img
                src={`/rhythm/btn_${lane}.png`}
                alt=""
                className="w-full h-full object-contain pointer-events-none"
                style={{ imageRendering: 'pixelated' }}
                draggable={false}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ===== 날아오는 개별 노트 (픽셀 하트, 위→아래) =====
function FlyingNote({ note, elapsed }) {
  const t = elapsed - note.spawnTime;
  const progress = Math.max(0, Math.min(1, t / NOTE_TRAVEL_MS));
  const cx = LANE_X[note.lane] ?? 50;
  const y = NOTE_START_Y + (HIT_LINE_Y - NOTE_START_Y) * progress;
  const info = RARITY_INFO[note.rarity] || RARITY_INFO.N;
  const laneInfo = LANE_INFO[note.lane] || LANE_INFO.pink;

  const scale = 0.7 + progress * 0.4;
  const noteImage = `/rhythm/note_${note.lane}.png`;

  return (
    <div
      className="absolute pointer-events-none select-none"
      style={{
        left: `${cx}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) scale(${scale})`,
        zIndex: 10,
      }}
    >
      {/* SSR 골드 후광 */}
      {note.rarity === 'SSR' && (
        <div
          className="absolute"
          style={{
            left: '50%', top: '50%',
            width: 84, height: 84,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,184,0,0.7) 0%, transparent 70%)',
            animation: 'ringPulse 0.7s ease-in-out infinite',
          }}
        />
      )}

      {/* 하트 이미지 */}
      <img
        src={noteImage}
        alt=""
        className="block"
        style={{
          width: 88,
          height: 'auto',
          imageRendering: 'pixelated',
          filter: `drop-shadow(0 0 12px ${laneInfo.glow}) drop-shadow(0 2px 4px rgba(0,0,0,0.4))${
            note.rarity === 'SR' ? ` drop-shadow(0 0 10px ${info.color})` : ''
          }${
            note.rarity === 'SSR' ? ` drop-shadow(0 0 14px gold)` : ''
          }`,
        }}
        draggable={false}
      />
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
    <div className="flex-1 flex flex-col items-center justify-center gap-3 py-4">
      {/* 엔코어 배너 (컷인 연출) */}
      <img
        src="/rhythm/encore_banner.png"
        alt="アンコール"
        className="w-full max-w-sm object-contain"
        style={{
          imageRendering: 'pixelated',
          animation: 'cdPulse 0.7s ease-out',
          filter: 'drop-shadow(0 6px 12px rgba(255,107,157,0.3))',
        }}
        draggable={false}
      />
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
