import { useEffect, useState } from 'react';
import { RARITY_CONFIG } from '../../data/badges';

/**
 * 가챠 연출 — 4단계
 * 1. SHAKE — 가챠머신 흔들림 (1.2s)
 * 2. DROP  — 캡슐 떨어짐 (0.8s)
 * 3. OPEN  — 캡슐 까지기 (0.6s)
 * 4. REVEAL — 캔뱃지 등장 (1.4s) → onDone
 *
 * 10연일 경우: 가장 높은 레어도 1장만 화려하게 연출.
 *              결과 화면에서 전부 보여줌.
 */
export default function GachaAnimation({ results, onDone }) {
  // 가장 레어한 1장 골라서 그걸로 연출 (UR > SR > レア > ノーマル)
  const rarityOrder = { ur: 4, sr: 3, rare: 2, normal: 1 };
  const featured = [...results].sort(
    (a, b) => rarityOrder[b.rarity] - rarityOrder[a.rarity]
  )[0];

  const rarityConfig = RARITY_CONFIG[featured.rarity];

  // 'shake' | 'drop' | 'open' | 'reveal'
  const [step, setStep] = useState('shake');

  useEffect(() => {
    const timers = [];
    timers.push(setTimeout(() => setStep('drop'), 1200));
    timers.push(setTimeout(() => setStep('open'), 2000));
    timers.push(setTimeout(() => setStep('reveal'), 2600));
    timers.push(setTimeout(() => onDone(), 4400));

    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{
        background:
          step === 'reveal'
            ? `radial-gradient(circle, ${rarityConfig.glowColor} 0%, #FFE5EC 60%, #FFC1D8 100%)`
            : 'linear-gradient(to bottom, #FFE5EC 0%, #FFC1D8 100%)',
        transition: 'background 0.4s ease',
      }}
    >
      {/* 1. SHAKE — 가챠머신 흔들림 */}
      {step === 'shake' && (
        <div className="text-center">
          <div
            className="w-64 h-64 mx-auto"
            style={{ animation: 'gacha-shake 0.15s infinite' }}
          >
            <img
              src="/casoshi/gacha/machine.png"
              alt=""
              className="w-full h-full object-contain"
              style={{ imageRendering: 'pixelated' }}
              draggable={false}
            />
          </div>
          <p className="mt-4 text-oshi-main font-black animate-pulse">
            ガチャをまわしています...
          </p>
        </div>
      )}

      {/* 2. DROP — 캡슐 떨어짐 (전용 motion 이미지 활용) */}
      {step === 'drop' && (
        <div style={{ animation: 'gacha-drop 0.8s ease-in forwards' }}>
          <img
            src="/casoshi/gacha/capsule_drop.png"
            alt=""
            className="w-32 h-auto"
            style={{ imageRendering: 'pixelated' }}
            draggable={false}
          />
        </div>
      )}

      {/* 3. OPEN — 캡슐 까지기 */}
      {step === 'open' && (
        <div className="relative">
          <img
            src="/casoshi/gacha/capsule_open.png"
            alt=""
            className="w-40 h-auto relative z-10"
            style={{
              imageRendering: 'pixelated',
              animation: 'gacha-open-pop 0.6s ease-out',
            }}
            draggable={false}
          />
          {/* 빛 폭발 */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${rarityConfig.glowColor} 0%, transparent 70%)`,
              animation: 'gacha-glow 0.6s ease-out',
              transform: 'scale(2.5)',
            }}
          />
        </div>
      )}

      {/* 4. REVEAL — 캔뱃지 등장 */}
      {step === 'reveal' && (
        <div
          className="text-center relative"
          style={{ animation: 'gacha-reveal 0.6s ease-out forwards' }}
        >
          {/* 레어도 라벨 이미지 (UR/SR/レア만 화려하게 위에 표시) */}
          {featured.rarity !== 'normal' && (
            <div className="mb-4 flex justify-center">
              <img
                src={rarityConfig.labelImage}
                alt={rarityConfig.label}
                className="h-12 w-auto animate-pulse drop-shadow-lg"
                style={{ imageRendering: 'pixelated' }}
                draggable={false}
              />
            </div>
          )}

          {/* 캔뱃지 본체 */}
          <div className="relative inline-block">
            {/* 강한 글로우 */}
            <div
              className="absolute inset-0 rounded-full blur-2xl"
              style={{
                backgroundColor: rarityConfig.glowColor,
                transform: 'scale(1.6)',
                opacity: 0.7,
              }}
            />
            {/* 뱃지 이미지 (정사각, 자체 디자인이라 별도 테두리 X) */}
            <img
              src={featured.image}
              alt={featured.name}
              className="relative w-56 h-56 object-contain drop-shadow-2xl"
              style={{ imageRendering: 'pixelated' }}
              draggable={false}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            {/* 회전하는 빛줄기 (UR 한정) */}
            {featured.rarity === 'ur' && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'conic-gradient(from 0deg, transparent 0deg, rgba(255,215,0,0.3) 30deg, transparent 60deg, transparent 120deg, rgba(255,215,0,0.3) 150deg, transparent 180deg)',
                  animation: 'gacha-rays 3s linear infinite',
                  borderRadius: '50%',
                }}
              />
            )}
          </div>

          <p className="mt-4 text-2xl font-black text-oshi-dark drop-shadow-md">
            {featured.name}
          </p>

          {results.length > 1 && (
            <p className="mt-1 text-sm text-oshi-main font-bold">
              他 {results.length - 1} 枚
            </p>
          )}
        </div>
      )}

      {/* 인라인 keyframes */}
      <style>{`
        @keyframes gacha-shake {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-4px, 0) rotate(-3deg); }
          50% { transform: translate(0, -2px) rotate(0deg); }
          75% { transform: translate(4px, 0) rotate(3deg); }
        }
        @keyframes gacha-drop {
          0% { transform: translateY(-300px); opacity: 0; }
          70% { transform: translateY(20px); opacity: 1; }
          85% { transform: translateY(-10px); }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes gacha-open-pop {
          0% { transform: scale(0.7); opacity: 0; }
          60% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes gacha-glow {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(2.5); }
        }
        @keyframes gacha-reveal {
          from { transform: scale(0.3); opacity: 0; }
          70% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes gacha-rays {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
