import { useState } from 'react';
import { TAP_REWARD } from '../data/gameRules';

export default function TapGame({ points, setPoints, onBack }) {
  const [poppers, setPoppers] = useState([]); // 플로팅 +1 이펙트
  const [tapCount, setTapCount] = useState(0);

  const handleTap = () => {
    setPoints(p => p + TAP_REWARD);
    setTapCount(c => c + 1);
    const id = Date.now() + Math.random();
    const x = Math.random() * 60 - 30; // -30~30
    setPoppers(prev => [...prev, { id, x }]);
    setTimeout(() => {
      setPoppers(prev => prev.filter(p => p.id !== id));
    }, 800);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 min-h-[calc(100vh-64px)] flex flex-col">
      <button
        onClick={onBack}
        className="text-sm text-oshi-dark/70 hover:text-oshi-dark self-start"
      >
        ← 戻る
      </button>

      <div className="text-center mt-4">
        <div className="text-xs text-oshi-dark/60">タップでポイントゲット！</div>
        <div className="text-sm font-bold text-oshi-dark">
          今回のセッション: {tapCount} 回
        </div>
      </div>

      {/* 중앙 탭 버튼 */}
      <div className="flex-1 flex items-center justify-center relative">
        <button
          onClick={handleTap}
          className="w-56 h-56 rounded-full bg-gradient-to-br from-oshi-main to-oshi-accent text-white text-5xl font-black shadow-2xl active:scale-95 transition-transform select-none"
        >
          <img
            src="/icons/heart.png"
            alt=""
            className="w-28 h-28 mx-auto"
            style={{ imageRendering: 'pixelated' }}
          />
          <div className="text-sm font-bold mt-1">TAP!</div>
        </button>

        {/* 플로팅 +1 */}
        {poppers.map(p => (
          <div
            key={p.id}
            className="absolute text-2xl font-black text-oshi-main pointer-events-none"
            style={{
              left: `calc(50% + ${p.x}px)`,
              top: '50%',
              animation: 'floatUp 0.8s ease-out forwards',
            }}
          >
            +{TAP_REWARD}
          </div>
        ))}
      </div>

      <div className="text-center text-[10px] text-oshi-dark/40 pb-2">
        ※ Phase 1: クールダウンなし。Phase 2 でバランス調整予定
      </div>

      <style>{`
        @keyframes floatUp {
          0%   { opacity: 1; transform: translate(-50%, 0) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -80px) scale(1.4); }
        }
      `}</style>
    </div>
  );
}
