import { useState } from 'react';
import { SEED_CHARACTERS, calcLevel, calcExp } from '../data/characters';
import { SUPPORT_COST } from '../data/gameRules';

export default function CharacterDetail({
  characterId,
  points, setPoints,
  supports, setSupports,
  onBack,
}) {
  const character = SEED_CHARACTERS.find(c => c.id === characterId);
  const [feedback, setFeedback] = useState(null);

  if (!character) {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <button onClick={onBack} className="text-oshi-dark/60 mb-4">← 戻る</button>
        <div>キャラクターが見つかりません</div>
      </div>
    );
  }

  const supportPoints = supports[character.id] || 0;
  const level = calcLevel(supportPoints);
  const exp = calcExp(supportPoints);
  const canSupport = points >= SUPPORT_COST;

  const handleSupport = () => {
    if (!canSupport) {
      setFeedback({ type: 'error', text: 'ポイントが足りないよ…' });
      setTimeout(() => setFeedback(null), 1500);
      return;
    }
    setPoints(p => p - SUPPORT_COST);
    setSupports(s => ({
      ...s,
      [character.id]: (s[character.id] || 0) + SUPPORT_COST,
    }));
    setFeedback({ type: 'ok', text: `+${SUPPORT_COST} 応援！` });
    setTimeout(() => setFeedback(null), 800);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-5">
      <button
        onClick={onBack}
        className="text-sm text-oshi-dark/70 hover:text-oshi-dark"
      >
        ← 戻る
      </button>

      {/* 캐릭터 헤더 */}
      <section
        className="rounded-3xl p-6 text-center shadow-md"
        style={{ backgroundColor: character.bgColor }}
      >
        <div
          className="mx-auto w-32 h-32 rounded-full flex items-center justify-center text-7xl shadow-inner mb-3 animate-float"
          style={{ backgroundColor: character.themeColor + '55' }}
        >
          {character.emoji}
        </div>

        <div className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full text-white mb-2"
             style={{ backgroundColor: character.themeColor }}>
          {character.type}
        </div>

        <div className="text-2xl font-black text-oshi-dark">
          {character.name}
        </div>
        <div className="text-xs text-oshi-dark/60 mb-3">
          {character.nameRomaji}
        </div>

        <div className="bg-white/70 rounded-2xl px-4 py-3 text-sm text-oshi-dark">
          「{character.catchphrase}」
        </div>
      </section>

      {/* 레벨 & EXP */}
      <section className="card">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold text-oshi-dark/60">レベル</div>
          <div className="text-3xl font-black" style={{ color: character.themeColor }}>
            Lv.{level}
          </div>
        </div>
        <div className="h-3 bg-oshi-bg rounded-full overflow-hidden mb-1">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${exp}%`, backgroundColor: character.themeColor }}
          />
        </div>
        <div className="text-[10px] text-oshi-dark/60 text-right">
          {exp}/100 EXP · 応援合計 {supportPoints}
        </div>
      </section>

      {/* プロフィール */}
      <section className="card">
        <div className="text-xs font-bold text-oshi-dark/60 mb-2">プロフィール</div>
        <div className="text-sm text-oshi-dark leading-relaxed">
          {character.bio}
        </div>
      </section>

      {/* 응원 버튼 */}
      <section className="sticky bottom-4 pt-2">
        <button
          onClick={handleSupport}
          disabled={!canSupport}
          className={`w-full py-4 rounded-full font-black text-lg shadow-xl transition-all ${
            canSupport
              ? 'bg-oshi-main text-white active:scale-95 hover:bg-pink-500'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          💖 応援する（-{SUPPORT_COST} ポイント）
        </button>

        {feedback && (
          <div
            className={`mt-2 text-center text-sm font-bold animate-pop ${
              feedback.type === 'ok' ? 'text-oshi-main' : 'text-red-500'
            }`}
          >
            {feedback.text}
          </div>
        )}
      </section>
    </div>
  );
}
