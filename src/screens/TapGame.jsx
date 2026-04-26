import { useState, useRef, useEffect } from 'react';
import { TAP_REWARD } from '../data/gameRules';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useSoundEnabled } from '../hooks/useSoundEnabled';
import { sfx } from '../utils/sound';
import SoundToggle from '../components/SoundToggle';

// ===== 게임 밸런스 =====
const COMBO_WINDOW_MS = 1500;           // 콤보 유지 시간
const CRITICAL_CHANCE_BASE = 0.05;      // 기본 크리 확률 5%
const CRITICAL_CHANCE_HIGH = 0.10;      // 10+ 콤보 시 10%
const CRITICAL_MULTIPLIER = 3;          // 크리 배율
const COMBO_BONUS_STEPS = [              // 콤보 기준 배율
  { threshold:  0, mult: 1.0 },
  { threshold: 10, mult: 1.5 },
  { threshold: 25, mult: 2.0 },
  { threshold: 50, mult: 3.0 },
];
const getComboMult = (c) =>
  [...COMBO_BONUS_STEPS].reverse().find(s => c >= s.threshold).mult;

export default function TapGame({ points, setPoints, onBack }) {
  const [poppers, setPoppers] = useState([]);      // +pt 플로터
  const [hearts, setHearts] = useState([]);        // 하이 콤보 하트 파티클
  const [flash, setFlash] = useState(false);       // 크리티컬 플래시
  const [shake, setShake] = useState(false);       // 버튼 쉐이크
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useLocalStorage('casoshi:bestCombo', 0);
  const [sessionStats, setSessionStats] = useState({ taps: 0, points: 0, maxCombo: 0 });
  const [soundEnabled, setSoundEnabled] = useSoundEnabled();

  const lastTapAtRef = useRef(0);
  const comboTimerRef = useRef(null);

  // 콤보 끊기는 타이머 (마지막 탭 후 COMBO_WINDOW_MS 경과 시 리셋)
  useEffect(() => {
    return () => clearTimeout(comboTimerRef.current);
  }, []);

  const handleTap = () => {
    const now = Date.now();
    const withinWindow = now - lastTapAtRef.current < COMBO_WINDOW_MS;
    const newCombo = withinWindow ? combo + 1 : 1;
    lastTapAtRef.current = now;

    // 크리티컬 판정
    const critChance = newCombo >= 10 ? CRITICAL_CHANCE_HIGH : CRITICAL_CHANCE_BASE;
    const isCrit = Math.random() < critChance;
    const comboMult = getComboMult(newCombo);
    const baseReward = TAP_REWARD * comboMult;
    const reward = Math.round(isCrit ? baseReward * CRITICAL_MULTIPLIER : baseReward);

    setPoints(p => p + reward);
    setCombo(newCombo);
    setSessionStats(s => ({
      taps: s.taps + 1,
      points: s.points + reward,
      maxCombo: Math.max(s.maxCombo, newCombo),
    }));
    if (newCombo > bestCombo) setBestCombo(newCombo);

    // ===== 효과음 =====
    // 크리: 화려 사운드 / 마일스톤(10/25/50): 상승 아르페지오 / 평소: 짧은 click
    if (isCrit) {
      sfx.perfect();
    } else if (newCombo === 10 || newCombo === 25 || newCombo === 50) {
      sfx.comboMilestone();
    } else {
      sfx.click();
    }

    // 플로팅 +pt
    const id = now + Math.random();
    const x = Math.random() * 60 - 30;
    setPoppers(prev => [...prev, { id, x, reward, isCrit, combo: newCombo }]);
    setTimeout(() => setPoppers(prev => prev.filter(p => p.id !== id)), 800);

    // 하이 콤보 하트 파티클 (10+)
    if (newCombo >= 10) {
      const hearts = Array.from({ length: 3 }, (_, i) => ({
        id: now + i + Math.random(),
        x: Math.random() * 200 - 100,
        delay: i * 60,
      }));
      setHearts(prev => [...prev, ...hearts]);
      setTimeout(() => {
        setHearts(prev => prev.filter(h => !hearts.find(nh => nh.id === h.id)));
      }, 1400);
    }

    // 크리티컬 연출
    if (isCrit) {
      setFlash(true);
      setTimeout(() => setFlash(false), 200);
      setShake(true);
      setTimeout(() => setShake(false), 300);
    }

    // 콤보 끊기 타이머 리셋
    clearTimeout(comboTimerRef.current);
    comboTimerRef.current = setTimeout(() => {
      setCombo(0);
    }, COMBO_WINDOW_MS);
  };

  const comboMult = getComboMult(combo);
  const nextStep = COMBO_BONUS_STEPS.find(s => s.threshold > combo);
  const comboProgressLabel = nextStep
    ? `次の×${nextStep.mult} まで ${nextStep.threshold - combo}`
    : 'MAX!';

  return (
    <div className="max-w-md mx-auto px-4 py-4 min-h-[calc(100vh-64px)] flex flex-col">
      {/* 크리티컬 전체 화면 플래시 */}
      {flash && (
        <div className="fixed inset-0 bg-oshi-main/20 pointer-events-none z-40 animate-pulse" />
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-sm text-oshi-dark/70 hover:text-oshi-dark"
        >
          <img src="/icons/back.png" alt="戻る" className="w-10 h-10 object-contain" style={{ imageRendering: "pixelated" }} draggable={false} />
        </button>
        <SoundToggle enabled={soundEnabled} onToggle={setSoundEnabled} />
      </div>

      {/* 통계 헤더 */}
      <div className="mt-3 bg-white/60 rounded-2xl p-3 border border-oshi-sub">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-[10px] text-oshi-dark/60">タップ</div>
            <div className="text-sm font-bold text-oshi-dark">{sessionStats.taps}</div>
          </div>
          <div>
            <div className="text-[10px] text-oshi-dark/60">獲得</div>
            <div className="text-sm font-bold text-oshi-main">+{sessionStats.points}pt</div>
          </div>
          <div>
            <div className="text-[10px] text-oshi-dark/60">最高コンボ</div>
            <div className="text-sm font-bold text-oshi-dark">{bestCombo}</div>
          </div>
        </div>
      </div>

      {/* 콤보 배지 */}
      <div className="mt-3 text-center min-h-[52px]">
        {combo > 0 ? (
          <div>
            <div
              className={`inline-block font-black transition-all ${
                combo >= 50 ? 'text-4xl text-oshi-accent drop-shadow-lg' :
                combo >= 25 ? 'text-3xl text-oshi-main' :
                combo >= 10 ? 'text-2xl text-oshi-main' :
                'text-xl text-oshi-dark'
              }`}
              style={combo >= 25 ? { animation: 'comboPulse 0.4s ease-out' } : undefined}
              key={combo}
            >
              {combo} COMBO!
            </div>
            <div className="text-[10px] font-bold text-oshi-dark/60 mt-0.5">
              ×{comboMult.toFixed(1)} 倍 ・ {comboProgressLabel}
            </div>
          </div>
        ) : (
          <div className="text-xs text-oshi-dark/50 pt-2">
            連打でコンボ！ 10+ でクリ率UP / 25+ で爆発
          </div>
        )}
      </div>

      {/* 중앙 탭 버튼 */}
      <div className="flex-1 flex items-center justify-center relative">
        <button
          onClick={handleTap}
          className={`w-56 h-56 rounded-full bg-gradient-to-br from-oshi-main to-oshi-accent text-white shadow-2xl active:scale-95 transition-transform select-none ${
            shake ? 'animate-shake' : ''
          }`}
          style={{
            boxShadow: combo >= 25
              ? '0 0 40px rgba(255, 107, 157, 0.6), 0 0 80px rgba(255, 107, 157, 0.3)'
              : combo >= 10
              ? '0 0 20px rgba(255, 107, 157, 0.4)'
              : undefined,
          }}
        >
          <img
            src="/icons/heart.png"
            alt=""
            className="w-28 h-28 mx-auto"
            style={{ imageRendering: 'pixelated' }}
          />
          <div className="text-sm font-bold mt-1">TAP!</div>
        </button>

        {/* 플로팅 +pt */}
        {poppers.map(p => (
          <div
            key={p.id}
            className={`absolute font-black pointer-events-none ${
              p.isCrit ? 'text-3xl text-oshi-accent' : 'text-2xl text-oshi-main'
            }`}
            style={{
              left: `calc(50% + ${p.x}px)`,
              top: '50%',
              animation: p.isCrit
                ? 'floatUpBig 0.9s ease-out forwards'
                : 'floatUp 0.8s ease-out forwards',
            }}
          >
            {p.isCrit && <span className="text-[10px] block leading-none">💥CRIT</span>}
            +{p.reward}
          </div>
        ))}

        {/* 하이 콤보 하트 파티클 */}
        {hearts.map(h => (
          <div
            key={h.id}
            className="absolute text-2xl pointer-events-none"
            style={{
              left: `calc(50% + ${h.x}px)`,
              top: '50%',
              animation: `heartFloat 1.4s ease-out ${h.delay}ms forwards`,
            }}
          >
            💖
          </div>
        ))}
      </div>

      <div className="text-center text-[10px] text-oshi-dark/40 pb-2">
        {combo >= 10 ? '🔥 クリティカル率UP中！' : '連打してコンボ × ポイントを稼ごう'}
      </div>

      <style>{`
        @keyframes floatUp {
          0%   { opacity: 1; transform: translate(-50%, 0) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -80px) scale(1.4); }
        }
        @keyframes floatUpBig {
          0%   { opacity: 1; transform: translate(-50%, 0) scale(1.3) rotate(-8deg); }
          100% { opacity: 0; transform: translate(-50%, -120px) scale(2) rotate(8deg); }
        }
        @keyframes heartFloat {
          0%   { opacity: 0; transform: translate(-50%, 0) scale(0.3); }
          30%  { opacity: 1; transform: translate(-50%, -30px) scale(1.2); }
          100% { opacity: 0; transform: translate(-50%, -140px) scale(0.8); }
        }
        @keyframes comboPulse {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.2); }
        }
        @keyframes shake {
          0%, 100% { transform: translate(0, 0); }
          25%      { transform: translate(-4px, 2px); }
          50%      { transform: translate(4px, -2px); }
          75%      { transform: translate(-2px, 4px); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </div>
  );
}
