import { SEED_CHARACTERS } from '../data/characters';
import { todayKey, DAILY_BONUS } from '../data/gameRules';
import CharacterCard from '../components/CharacterCard';

export default function Home({
  points, setPoints,
  supports,
  lastCheckin, setLastCheckin,
  onSelectCharacter, onOpenTapGame,
}) {
  const today = todayKey();
  const canCheckin = lastCheckin !== today;

  const handleCheckin = () => {
    if (!canCheckin) return;
    setPoints(p => p + DAILY_BONUS);
    setLastCheckin(today);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* 히어로 */}
      <section className="text-center py-4">
        <div className="text-4xl font-black text-oshi-main mb-1">
          キャスオシ
        </div>
        <div className="text-xs text-oshi-dark/60">
          ゲームで推しを育てる、新しい推し活。
        </div>
      </section>

      {/* 액션 2개 */}
      <section className="grid grid-cols-2 gap-3">
        <button
          onClick={handleCheckin}
          disabled={!canCheckin}
          className={`card flex flex-col items-center justify-center py-5 transition ${
            canCheckin
              ? 'hover:bg-oshi-bg cursor-pointer'
              : 'opacity-50 cursor-not-allowed'
          }`}
        >
          <div className="text-3xl mb-1">📅</div>
          <div className="text-sm font-bold text-oshi-dark">
            {canCheckin ? '出席チェック' : '出席済み'}
          </div>
          <div className="text-[10px] text-oshi-dark/60">
            +{DAILY_BONUS} ポイント
          </div>
        </button>

        <button
          onClick={onOpenTapGame}
          className="card flex flex-col items-center justify-center py-5 bg-gradient-to-br from-oshi-sub to-oshi-bg hover:scale-[1.02] transition-transform"
        >
          <div className="text-3xl mb-1">💥</div>
          <div className="text-sm font-bold text-oshi-dark">タップゲーム</div>
          <div className="text-[10px] text-oshi-dark/60">
            タップで +1 ポイント
          </div>
        </button>
      </section>

      {/* 추천 캐릭터 */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-lg font-black text-oshi-dark">
            あなたの推し
          </h2>
          <span className="text-xs text-oshi-dark/60">
            {SEED_CHARACTERS.length}人
          </span>
        </div>
        <div className="space-y-3">
          {SEED_CHARACTERS.map(ch => (
            <CharacterCard
              key={ch.id}
              character={ch}
              supportPoints={supports[ch.id] || 0}
              onClick={() => onSelectCharacter(ch.id)}
            />
          ))}
        </div>
      </section>

      {/* footer */}
      <div className="text-center text-[10px] text-oshi-dark/40 pt-4 pb-8">
        Phase 1 MVP · ローカル保存 · 無課金
      </div>
    </div>
  );
}
