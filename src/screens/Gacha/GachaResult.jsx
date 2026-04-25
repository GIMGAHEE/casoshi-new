import { RARITY_CONFIG } from '../../data/badges';

export default function GachaResult({ results, newBadges, duplicates, refundPoints, onClose }) {
  const isSingle = results.length === 1;
  
  // 레어도순 정렬 (UR > レア > ノーマル)
  const rarityOrder = { ur: 3, rare: 2, normal: 1 };
  const sorted = [...results].sort(
    (a, b) => rarityOrder[b.rarity] - rarityOrder[a.rarity]
  );
  
  // 신규 캔뱃지 ID 셋
  const newIds = new Set(newBadges.map(b => b.id));
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-pink-200 p-4 pb-32">
      <h1 className="text-2xl font-bold text-pink-600 text-center mt-6 mb-2">
        ✨ ガチャ結果 ✨
      </h1>
      
      <div className="text-center text-sm text-pink-500 mb-6">
        {newBadges.length > 0 && (
          <span className="inline-block mx-2">
            🎀 NEW {newBadges.length}枚
          </span>
        )}
        {duplicates.length > 0 && (
          <span className="inline-block mx-2">
            🔁 ダブリ {duplicates.length}枚 → +{refundPoints}pt
          </span>
        )}
      </div>
      
      {/* 캔뱃지 그리드 */}
      <div className={`grid gap-3 ${isSingle ? 'grid-cols-1 max-w-xs mx-auto' : 'grid-cols-3 sm:grid-cols-5'}`}>
        {sorted.map((badge, i) => {
          const config = RARITY_CONFIG[badge.rarity];
          const isNew = newIds.has(badge.id);
          
          return (
            <div
              key={`${badge.id}-${i}`}
              className="relative"
              style={{
                animation: `result-pop 0.4s ease-out ${i * 0.05}s both`,
              }}
            >
              {/* NEW 배지 */}
              {isNew && (
                <div className="absolute -top-1 -right-1 z-10 bg-pink-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md">
                  NEW
                </div>
              )}
              
              {/* 뱃지 본체 */}
              <div className="relative">
                {/* 글로우 (레어 이상) */}
                {badge.rarity !== 'normal' && (
                  <div
                    className="absolute inset-0 rounded-full blur-md"
                    style={{
                      backgroundColor: config.glowColor,
                      opacity: 0.7,
                    }}
                  />
                )}
                
                {/* 이미지 */}
                <div
                  className="relative aspect-square rounded-full border-2 sm:border-4 bg-white shadow-md overflow-hidden"
                  style={{ borderColor: config.color }}
                >
                  <img
                    src={badge.image}
                    alt={badge.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.outerHTML = `<div class="w-full h-full flex items-center justify-center text-2xl">🎀</div>`;
                    }}
                  />
                </div>
                
                {/* 별 (UR/레어만) */}
                {badge.rarity !== 'normal' && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap">
                    {Array(config.stars).fill('⭐').join('')}
                  </div>
                )}
              </div>
              
              {/* 이름 (단발일때만) */}
              {isSingle && (
                <p className="mt-3 text-center font-bold text-pink-700">
                  {badge.name}
                </p>
              )}
            </div>
          );
        })}
      </div>
      
      {/* 환원 안내 */}
      {refundPoints > 0 && (
        <div className="mt-6 mx-auto max-w-xs bg-white/80 rounded-xl p-3 text-center text-sm text-pink-600">
          ダブリ {duplicates.length}枚で <span className="font-bold">+{refundPoints}pt</span> 獲得しました
        </div>
      )}
      
      {/* OK 버튼 (하단고정) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-pink-200 to-transparent">
        <button
          onClick={onClose}
          className="w-full max-w-md mx-auto block py-4 rounded-2xl bg-pink-500 text-white font-bold shadow-lg active:scale-95 transition"
        >
          OK
        </button>
      </div>
      
      <style>{`
        @keyframes result-pop {
          from { transform: scale(0.6); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
