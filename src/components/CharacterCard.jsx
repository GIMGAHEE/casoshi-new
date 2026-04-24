import { calcLevel, calcExp } from '../data/characters';
import PixelAvatar from './PixelAvatar';

export default function CharacterCard({ character, supportPoints, onClick, highlight = false }) {
  const level = calcLevel(supportPoints);
  const exp = calcExp(supportPoints);
  const typeLabel = character.isLiver ? 'ライバー' : character.type;

  return (
    <button
      onClick={onClick}
      className={`card w-full text-left active:scale-[0.98] transition-transform relative bg-white ${
        highlight ? 'ring-2 ring-oshi-main' : ''
      }`}
    >
      {highlight && (
        <div className="absolute -top-2 -right-2 bg-oshi-main text-white text-[10px] font-black px-2 py-1 rounded-full shadow">
          マイ推し
        </div>
      )}

      <div className="flex items-center gap-4">
        <div
          className="flex-shrink-0 w-20 h-20 rounded-full flex items-center justify-center shadow-inner overflow-hidden"
          style={{ backgroundColor: character.themeColor + '25' }}
        >
          {character.sprite && character.spriteSize && !character.hairOverlay ? (
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
          ) : character.sprite ? (
            <PixelAvatar sprite={character.sprite} size={72} hairOverlay={character.hairOverlay} hairTransform={character.hairTransform} />
          ) : character.isMyOshi ? (
            <div style={{ imageRendering: 'pixelated' }}>
              <PixelAvatar
                selections={{ parts: character.parts, colors: character.colors }}
                size={56}
              />
            </div>
          ) : (
            <div className="text-5xl animate-float">{character.emoji}</div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="text-[10px] font-black px-2.5 py-0.5 rounded-full text-white"
              style={{ backgroundColor: character.themeColor }}
            >
              {typeLabel}
            </span>
            <span className="text-[11px] font-bold text-oshi-dark/60">
              Lv.{level}
            </span>
          </div>

          <div className="text-lg font-black text-oshi-dark truncate">
            {character.name}
          </div>

          <div className="text-xs text-oshi-dark/60 line-clamp-1 mb-2">
            {character.catchphrase}
          </div>

          {/* EXP bar — 얇고 깔끔 */}
          <div className="h-1.5 bg-oshi-sub/40 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${exp}%`,
                backgroundColor: character.themeColor,
              }}
            />
          </div>
          <div className="text-[10px] text-oshi-dark/50 mt-1 text-right">
            {exp}/100 EXP
          </div>
        </div>
      </div>
    </button>
  );
}
