import { calcLevel, calcExp } from '../data/characters';

export default function CharacterCard({ character, supportPoints, onClick }) {
  const level = calcLevel(supportPoints);
  const exp = calcExp(supportPoints);

  return (
    <button
      onClick={onClick}
      className="card w-full text-left active:scale-[0.98] transition-transform"
      style={{ backgroundColor: character.bgColor }}
    >
      <div className="flex items-start gap-4">
        <div
          className="text-6xl animate-float flex-shrink-0 w-20 h-20 rounded-full flex items-center justify-center shadow-inner"
          style={{ backgroundColor: character.themeColor + '40' }}
        >
          {character.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: character.themeColor }}
            >
              {character.type}
            </span>
            <span className="text-[10px] font-bold text-oshi-dark/60">
              Lv.{level}
            </span>
          </div>

          <div className="text-lg font-black text-oshi-dark truncate">
            {character.name}
          </div>

          <div className="text-xs text-oshi-dark/70 line-clamp-2 mb-2">
            {character.catchphrase}
          </div>

          {/* EXP bar */}
          <div className="h-2 bg-white/60 rounded-full overflow-hidden">
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
