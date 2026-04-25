import { useState } from 'react';
import { useGacha } from '../../hooks/useGacha';
import { GACHA_COST } from '../../data/badges';
import GachaAnimation from './GachaAnimation';
import GachaResult from './GachaResult';

export default function GachaHome({ userId, onBack }) {
  const { inventory, loading, pulling, canUseFreePull, pullSingle, pullTen } = useGacha(userId);

  // 'idle' | 'animating' | 'result'
  const [phase, setPhase] = useState('idle');
  const [pullResult, setPullResult] = useState(null);

  const handlePull = async (count) => {
    const result = count === 1 ? await pullSingle() : await pullTen();

    if (!result) return;
    if (result.error) {
      alert(
        result.error === 'NOT_ENOUGH_POINTS'
          ? 'ポイントが足りません'
          : 'ガチャに失敗しました'
      );
      return;
    }

    setPullResult(result);
    setPhase('animating');
  };

  const handleAnimationDone = () => setPhase('result');

  const handleResultClose = () => {
    setPhase('idle');
    setPullResult(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-oshi-dark/60">読み込み中...</p>
      </div>
    );
  }

  if (phase === 'animating') {
    return <GachaAnimation results={pullResult.results} onDone={handleAnimationDone} />;
  }

  if (phase === 'result') {
    return (
      <GachaResult
        results={pullResult.results}
        newBadges={pullResult.newBadges}
        duplicates={pullResult.duplicates}
        refundPoints={pullResult.refundPoints}
        onClose={handleResultClose}
      />
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-4 pb-32">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="p-1">
          <img
            src="/icons/back.png"
            alt="戻る"
            className="w-10 h-10 object-contain"
            style={{ imageRendering: 'pixelated' }}
            draggable={false}
          />
        </button>
        <h1 className="text-lg font-black text-oshi-dark">缶バッジガチャ</h1>
        <div className="bg-white rounded-full px-3 py-1.5 border-2 border-oshi-sub flex items-center gap-1 shadow-sm">
          <span className="text-yellow-500">●</span>
          <span className="font-bold text-oshi-dark text-sm">{inventory.gachaPoints}</span>
        </div>
      </div>

      {/* 본일의 라인업 (placeholder — 라이버 sprite 가 추가되면 채울 예정) */}
      <div className="card !py-3">
        <p className="text-[11px] font-bold text-oshi-dark/60 mb-2">本日のラインナップ</p>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="w-12 h-12 rounded-full bg-white border-2 border-oshi-sub shadow-sm flex-shrink-0 flex items-center justify-center overflow-hidden"
            >
              <img
                src="/casoshi/gacha/capsule.png"
                alt=""
                className="w-10 h-10 object-contain opacity-70"
                style={{ imageRendering: 'pixelated' }}
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 가챠머신 비주얼 */}
      <div className="card !p-6 bg-gradient-to-b from-white to-oshi-bg">
        <div className="flex justify-center items-center py-2">
          <div className="relative">
            <img
              src="/casoshi/gacha/machine.png"
              alt="ガチャ"
              className="w-56 h-56 object-contain drop-shadow-xl"
              style={{ imageRendering: 'pixelated' }}
              draggable={false}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling.style.display = 'flex';
              }}
            />
            <div
              style={{ display: 'none' }}
              className="w-56 h-56 rounded-3xl bg-oshi-sub border-4 border-oshi-main items-center justify-center text-6xl shadow-xl"
            >
              🎰
            </div>

            {/* 반짝이 */}
            <div className="absolute -top-1 -left-1 text-yellow-300 text-2xl animate-pulse">✨</div>
            <div
              className="absolute -top-1 -right-1 text-yellow-300 text-xl animate-pulse"
              style={{ animationDelay: '0.5s' }}
            >
              ✨
            </div>
            <div
              className="absolute -bottom-1 -left-1 text-pink-400 text-lg animate-pulse"
              style={{ animationDelay: '1s' }}
            >
              💖
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-oshi-dark/60 mt-2">
          所持缶バッジ: {Object.keys(inventory.badges || {}).length}種類 ・ 累計
          {inventory.totalPulls}回
        </p>
      </div>

      {/* 가챠 버튼들 */}
      <div className="space-y-2.5">
        {canUseFreePull && (
          <button
            onClick={() => handlePull(1)}
            disabled={pulling}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-yellow-300 via-pink-300 to-oshi-main text-white font-black shadow-lg disabled:opacity-50 active:scale-95 transition"
          >
            🎁 本日無料ガチャ!
          </button>
        )}

        <button
          onClick={() => handlePull(1)}
          disabled={pulling || (inventory.gachaPoints < GACHA_COST.single && !canUseFreePull)}
          className="w-full py-3.5 rounded-full bg-white border-2 border-oshi-main text-oshi-main font-bold shadow-md disabled:opacity-50 active:scale-95 transition"
        >
          1回まわす ・ {GACHA_COST.single}pt
        </button>

        <button
          onClick={() => handlePull(10)}
          disabled={pulling || inventory.gachaPoints < GACHA_COST.ten}
          className="w-full py-3.5 rounded-full bg-oshi-main text-white font-black shadow-lg disabled:opacity-50 active:scale-95 transition"
        >
          10連まわす ・ {GACHA_COST.ten}pt
          <span className="text-[10px] ml-2 opacity-80 font-normal">レア以上1枚確定</span>
        </button>
      </div>

      {/* 안내 */}
      <p className="text-center text-[10px] text-oshi-dark/50 pt-2">
        ※ ダブったバッジは自動でポイントに変換されます
      </p>
      <p className="text-center text-[10px] text-oshi-dark/40">
        排出率: ノーマル80% / レア18% / UR2%
      </p>
    </div>
  );
}
