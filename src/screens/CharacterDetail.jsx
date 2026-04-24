import { useState } from 'react';
import {
  calcLevel, calcExp,
  getUnlockedDialogues, findCharacter,
} from '../data/characters';
import { SUPPORT_COST } from '../data/gameRules';
import { addLiverSupport } from '../auth/liverRepository';
import { useLivers } from '../hooks/useLivers';
import LevelUpModal from '../components/LevelUpModal';
import PixelAvatar from '../components/PixelAvatar';

export default function CharacterDetail({
  characterId,
  myOshi,
  points, setPoints,
  supports, setSupports,
  onBack, onEditMyOshi, onOpenMiniHome,
}) {
  const livers = useLivers();
  const character = findCharacter(myOshi, characterId, livers);
  const [feedback, setFeedback] = useState(null);
  const [levelUpTo, setLevelUpTo] = useState(null);

  if (!character) {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <button onClick={onBack} className="text-oshi-dark/60 mb-4"><img src="/icons/back.png" alt="戻る" className="w-10 h-10 object-contain" style={{ imageRendering: "pixelated" }} draggable={false} /></button>
        <div>キャラクターが見つかりません</div>
      </div>
    );
  }

  const supportPoints = supports[character.id] || 0;
  const level = calcLevel(supportPoints);
  const exp = calcExp(supportPoints);
  const canSupport = points >= SUPPORT_COST;
  const unlockedDialogues = getUnlockedDialogues(character, supportPoints);

  const handleSupport = () => {
    if (!canSupport) {
      setFeedback({ type: 'error', text: 'ポイントが足りないよ…' });
      setTimeout(() => setFeedback(null), 1500);
      return;
    }

    const prevLevel = calcLevel(supportPoints);
    const nextSupport = supportPoints + SUPPORT_COST;
    const nextLevel = calcLevel(nextSupport);

    setPoints(p => p - SUPPORT_COST);
    setSupports(s => ({
      ...s,
      [character.id]: (s[character.id] || 0) + SUPPORT_COST,
    }));

    // 라이버면 라이버 stats 도 동기화 (라이버 대시보드에 반영되도록)
    if (character.isLiver && character.liverId) {
      addLiverSupport(character.liverId, SUPPORT_COST);
    }

    if (nextLevel > prevLevel) {
      // 레벨업! 모달 띄우기
      setLevelUpTo(nextLevel);
    } else {
      setFeedback({ type: 'ok', text: `+${SUPPORT_COST} 応援！` });
      setTimeout(() => setFeedback(null), 800);
    }
  };

  return (
    <>
      <div className="max-w-md mx-auto px-4 py-4 space-y-5 pb-32">
        <button
          onClick={onBack}
          className="text-sm text-oshi-dark/70 hover:text-oshi-dark"
        >
          <img src="/icons/back.png" alt="戻る" className="w-10 h-10 object-contain" style={{ imageRendering: "pixelated" }} draggable={false} />
        </button>

        {/* 캐릭터 헤더 */}
        <section
          className="rounded-3xl p-6 text-center shadow-md relative"
          style={{ backgroundColor: character.bgColor }}
        >
          {character.isMyOshi && onEditMyOshi && (
            <button
              onClick={onEditMyOshi}
              className="absolute top-3 right-3 bg-white/80 rounded-full px-3 py-1 text-xs font-bold text-oshi-dark border border-oshi-sub active:scale-95 flex items-center gap-1"
            >
              <img src="/icons/edit.png" alt="" className="w-4 h-4" style={{ imageRendering: 'pixelated' }} />
              編集
            </button>
          )}

          {onOpenMiniHome && (
            <button
              onClick={onOpenMiniHome}
              className="absolute top-3 left-3 bg-white/80 rounded-full px-3 py-1 text-xs font-bold text-oshi-dark border border-oshi-sub active:scale-95 flex items-center gap-1"
            >
              <img src="/icons/home.png" alt="" className="w-4 h-4" style={{ imageRendering: 'pixelated' }} />
              おへや
            </button>
          )}

          <div
            className="mx-auto w-32 h-32 rounded-full flex items-center justify-center shadow-inner mb-3 overflow-hidden"
            style={{ backgroundColor: character.themeColor + '40' }}
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
              <PixelAvatar sprite={character.sprite} size={128} hairOverlay={character.hairOverlay} hairTransform={character.hairTransform} />
            ) : character.isMyOshi ? (
              <PixelAvatar
                selections={{ parts: character.parts, colors: character.colors }}
                size={110}
              />
            ) : (
              <div className="text-7xl animate-float">{character.emoji}</div>
            )}
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

        {/* 대사 갤러리 */}
        <section className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold text-oshi-dark/60">セリフ図鑑</div>
            <div className="text-[10px] text-oshi-dark/50">
              {unlockedDialogues.length}/{character.dialogues.length}
            </div>
          </div>
          <div className="space-y-2">
            {character.dialogues.map(d => {
              const unlocked = d.unlockLevel <= level;
              return (
                <div
                  key={d.unlockLevel}
                  className={`rounded-xl p-3 transition ${
                    unlocked
                      ? 'bg-white border border-oshi-sub'
                      : 'bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        unlocked ? 'text-white' : 'bg-gray-300 text-gray-500'
                      }`}
                      style={unlocked ? { backgroundColor: character.themeColor } : {}}
                    >
                      Lv.{d.unlockLevel}
                    </span>
                    {!unlocked && (
                      <span className="text-[10px] text-gray-400">🔒 未解放</span>
                    )}
                  </div>
                  <div className={`text-sm ${unlocked ? 'text-oshi-dark' : 'text-gray-400 italic'}`}>
                    {unlocked ? `「${d.text}」` : '「??????」'}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* 응원 버튼 (고정) — 라이버에게만 표시 */}
      {character.isLiver && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-oshi-bg via-oshi-bg to-transparent">
          <div className="max-w-md mx-auto">
            <button
              onClick={handleSupport}
              disabled={!canSupport}
              className={`w-full py-4 rounded-full font-black text-lg shadow-xl transition-all ${
                canSupport
                  ? 'bg-oshi-main text-white active:scale-95 hover:bg-pink-500'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <img
                src="/icons/heart.png"
                alt=""
                className="w-5 h-5 inline-block mr-1 align-middle"
                style={{ imageRendering: 'pixelated' }}
              />
              応援する（-{SUPPORT_COST} ポイント）
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
          </div>
        </div>
      )}

      {levelUpTo !== null && (
        <LevelUpModal
          character={character}
          newLevel={levelUpTo}
          onClose={() => setLevelUpTo(null)}
        />
      )}
    </>
  );
}
