import { allCharacters, calcLevel } from '../data/characters';
import { listLivers } from '../auth/liverRepository';
import PixelAvatar from '../components/PixelAvatar';

const MEDALS = ['🥇', '🥈', '🥉'];
const MEDAL_BG = [
  'linear-gradient(135deg, #FFD700, #FFA500)',
  'linear-gradient(135deg, #E8E8E8, #B0B0B0)',
  'linear-gradient(135deg, #CD7F32, #8B4513)',
];

// 아바타 표시 (PNG sprite > 픽셀 빌더 > 이모지 폴백)
function Avatar({ character, size }) {
  if (character.sprite && character.spriteSize && !character.hairOverlay) {
    // hairBaked 크롭된 sprite: 부모 원형 프레임 기준 height 꽉 채우기
    return (
      <img
        src={character.sprite}
        alt=""
        draggable={false}
        style={{
          height: '90%',
          width: 'auto',
          imageRendering: 'pixelated',
        }}
      />
    );
  }
  if (character.sprite) {
    return <PixelAvatar sprite={character.sprite} size={size} hairOverlay={character.hairOverlay} hairTransform={character.hairTransform} />;
  }
  if (character.isMyOshi) {
    return (
      <PixelAvatar
        selections={{ parts: character.parts, colors: character.colors }}
        size={size}
      />
    );
  }
  return <div style={{ fontSize: size * 0.55 }}>{character.emoji}</div>;
}

export default function Ranking({ myOshi, supports, onBack, onSelectCharacter }) {
  const characters = allCharacters(myOshi, listLivers());
  const ranked = [...characters]
    .map(c => ({ ...c, supportPoints: supports[c.id] || 0 }))
    .sort((a, b) => b.supportPoints - a.supportPoints);

  const top = ranked[0];
  const hasAnySupport = top.supportPoints > 0;

  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-5">
      <button
        onClick={onBack}
        className="text-sm text-oshi-dark/70 hover:text-oshi-dark"
      >
        <img src="/icons/back.png" alt="戻る" className="w-10 h-10 object-contain" style={{ imageRendering: "pixelated" }} draggable={false} />
      </button>

      {/* 헤더 */}
      <section className="text-center py-2">
        <div className="text-3xl font-black text-oshi-main flex items-center justify-center gap-2">
          <img
            src="/icons/trophy.png"
            alt=""
            className="h-10 w-auto"
            style={{ imageRendering: 'pixelated' }}
          />
          推しランキング
        </div>
        <div className="text-xs text-oshi-dark/60 mt-1">
          一番推されているのは誰？
        </div>
      </section>

      {/* 1등 크게 */}
      {hasAnySupport && (
        <section
          className="rounded-3xl p-6 text-center shadow-lg relative overflow-hidden"
          style={{ backgroundColor: top.bgColor }}
        >
          <div className="absolute top-3 right-3 text-4xl animate-float">👑</div>

          <div className="text-[10px] font-black tracking-[0.3em] text-oshi-dark/60 mb-2">
            ✦ #1 推し ✦
          </div>

          <div
            className="mx-auto w-24 h-24 rounded-full flex items-center justify-center shadow-inner mb-2 overflow-hidden"
            style={{ backgroundColor: top.themeColor + '55' }}
          >
            <Avatar character={top} size={96} />
          </div>

          <div className="text-2xl font-black text-oshi-dark mb-1">
            {top.name}
          </div>
          <div className="text-xs text-oshi-dark/60 mb-3">
            Lv.{calcLevel(top.supportPoints)} · 応援 {top.supportPoints} pt
          </div>

          <button
            onClick={() => onSelectCharacter(top.id)}
            className="btn-primary inline-block"
            style={{ backgroundColor: top.themeColor }}
          >
            もっと応援する
          </button>
        </section>
      )}

      {/* 순위 리스트 */}
      <section className="space-y-2">
        {ranked.map((c, idx) => {
          const level = calcLevel(c.supportPoints);
          const maxSupport = Math.max(top.supportPoints, 1);
          const barWidth = Math.max(4, (c.supportPoints / maxSupport) * 100);

          return (
            <button
              key={c.id}
              onClick={() => onSelectCharacter(c.id)}
              className="w-full card text-left flex items-center gap-3 active:scale-[0.98] transition-transform"
              style={{ padding: '12px' }}
            >
              {/* 순위 */}
              <div
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl font-black"
                style={{
                  background: idx < 3 ? MEDAL_BG[idx] : '#F3F4F6',
                  color: idx < 3 ? 'white' : '#9CA3AF',
                }}
              >
                {idx < 3 ? MEDALS[idx] : idx + 1}
              </div>

              {/* 캐릭터 */}
              <div
                className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: c.themeColor + '40' }}
              >
                <Avatar character={c} size={48} />
              </div>

              {/* 정보 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-oshi-dark">{c.name}</span>
                  <span className="text-[10px] font-bold text-oshi-dark/50">Lv.{level}</span>
                </div>
                <div className="h-2 bg-oshi-bg rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: c.themeColor,
                    }}
                  />
                </div>
                <div className="text-[10px] text-oshi-dark/60 mt-1">
                  応援 {c.supportPoints} pt
                </div>
              </div>
            </button>
          );
        })}
      </section>

      {!hasAnySupport && (
        <div className="text-center text-xs text-oshi-dark/50 py-6">
          まだ誰も応援されていません。<br />
          推しに応援してランキングを作ろう！
        </div>
      )}
    </div>
  );
}
