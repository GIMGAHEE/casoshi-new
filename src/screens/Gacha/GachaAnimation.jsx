import { useEffect, useState } from 'react';
import { RARITY_CONFIG } from '../../data/badges';

/**
 * 가챠 연출 — 4단계
 * 1. 머신 흔들림 (1.2s)
 * 2. 캡슐 떨어짐 (0.8s)
 * 3. 캡슐 까지기 (0.6s)
 * 4. 캔뱃지 등장 (0.8s) → onDone
 *
 * 10연일 경우: 가장 높은 레어도 1장만 화려하게 연출하고 onDone
 *              결과 화면에서 전부 보여줌
 */
export default function GachaAnimation({ results, onDone }) {
  // 가장 레어한 1장 골라서 그걸로 연출 (UR > レア > ノーマル)
  const rarityOrder = { ur: 3, rare: 2, normal: 1 };
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
    timers.push(setTimeout(() => onDone(), 4000));
    
    return () => timers.forEach(clearTimeout);
  }, [onDone]);
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{
        background: step === 'reveal'
          ? `radial-gradient(circle, ${rarityConfig.glowColor} 0%, #FFE4F1 60%, #FFC0DC 100%)`
          : 'linear-gradient(to bottom, #FFE4F1 0%, #FFC0DC 100%)',
        transition: 'background 0.4s ease',
      }}
    >
      {/* 단계별 표시 */}
      
      {/* 1. SHAKE — 머신 흔들림 */}
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
              onError={(e) => {
                e.target.outerHTML = '<div class="w-full h-full rounded-3xl bg-pink-300 border-4 border-pink-500 flex items-center justify-center text-6xl">🎰</div>';
              }}
            />
          </div>
          <p className="mt-4 text-pink-600 font-bold animate-pulse">ガチャをまわしています...</p>
        </div>
      )}
      
      {/* 2. DROP — 캡슐 떨어짐 */}
      {step === 'drop' && (
        <div
          className="text-6xl"
          style={{ animation: 'gacha-drop 0.8s ease-in forwards' }}
        >
          🥚
        </div>
      )}
      
      {/* 3. OPEN — 캡슐 까지기 */}
      {step === 'open' && (
        <div className="relative">
          <div className="text-6xl" style={{ animation: 'gacha-open-top 0.5s ease-out forwards' }}>
            ⬆
          </div>
          <div className="text-6xl absolute top-0 left-0" style={{ animation: 'gacha-open-bot 0.5s ease-out forwards' }}>
            ⬇
          </div>
          {/* 안에서 빛 */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, ${rarityConfig.glowColor} 0%, transparent 70%)`,
              animation: 'gacha-glow 0.5s ease-out',
              transform: 'scale(3)',
            }}
          />
        </div>
      )}
      
      {/* 4. REVEAL — 캔뱃지 등장 */}
      {step === 'reveal' && (
        <div
          className="text-center"
          style={{ animation: 'gacha-reveal 0.6s ease-out forwards' }}
        >
          {/* 레어도 표시 (UR/レア만 화려하게) */}
          {featured.rarity !== 'normal' && (
            <p
              className="text-3xl font-bold mb-4 animate-pulse"
              style={{ color: rarityConfig.color }}
            >
              ✨ {rarityConfig.label} ✨
            </p>
          )}
          
          {/* 캔뱃지 본체 */}
          <div className="relative inline-block">
            {/* 글로우 */}
            <div
              className="absolute inset-0 rounded-full blur-2xl"
              style={{
                backgroundColor: rarityConfig.glowColor,
                transform: 'scale(1.5)',
                opacity: 0.6,
              }}
            />
            {/* 뱃지 이미지 */}
            <div
              className="relative w-48 h-48 rounded-full border-4 bg-white shadow-2xl flex items-center justify-center overflow-hidden"
              style={{ borderColor: rarityConfig.color }}
            >
              <img
                src={featured.image}
                alt={featured.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.outerHTML = `<div class="w-full h-full flex items-center justify-center text-5xl">🎀</div>`;
                }}
              />
            </div>
            {/* 별 장식 */}
            <div className="absolute -top-2 -right-2 text-3xl animate-bounce">
              {Array(rarityConfig.stars).fill('⭐').join('')}
            </div>
          </div>
          
          <p className="mt-4 text-xl font-bold text-pink-700">
            {featured.name}
          </p>
          
          {results.length > 1 && (
            <p className="mt-2 text-sm text-pink-500">
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
          0% { transform: translateY(-200px); opacity: 0; }
          70% { transform: translateY(20px); opacity: 1; }
          85% { transform: translateY(-10px); }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes gacha-open-top {
          to { transform: translateY(-80px) rotate(-45deg); opacity: 0; }
        }
        @keyframes gacha-open-bot {
          to { transform: translateY(80px) rotate(45deg); opacity: 0; }
        }
        @keyframes gacha-glow {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(3); }
        }
        @keyframes gacha-reveal {
          from { transform: scale(0.3); opacity: 0; }
          70% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
