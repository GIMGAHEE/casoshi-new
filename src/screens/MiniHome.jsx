import { findCharacter, calcLevel } from '../data/characters';
import IsometricRoom from '../components/IsometricRoom';
import PixelAvatar from '../components/PixelAvatar';

export default function MiniHome({
  characterId, myOshi, supports,
  onBack, onOpenDetail,
}) {
  const character = findCharacter(myOshi, characterId);
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

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-24">
      <button
        onClick={onBack}
        className="text-sm text-oshi-dark/70 hover:text-oshi-dark"
      >
        ← 戻る
      </button>

      {/* Cyworld-style 헤더 */}
      <section className="mt-3 rounded-2xl overflow-hidden shadow-md border-2 border-oshi-sub bg-white">
        <div
          className="px-4 py-2 flex items-center justify-between text-white text-xs font-bold"
          style={{ backgroundColor: character.themeColor }}
        >
          <span>🏠 {character.name}のおへや</span>
          <span className="opacity-80">Lv.{level}</span>
        </div>

        {/* 방 뷰 */}
        <div
          className="relative overflow-hidden"
          style={{
            background: `linear-gradient(180deg, ${character.bgColor} 0%, #FFFFFF 100%)`,
            aspectRatio: '1 / 1',
          }}
        >
          <IsometricRoom character={character}>
            {/* 캐릭터를 바닥 중앙(뒤벽 앞)에 배치, 발 y≈330 */}
            <foreignObject x="140" y="170" width="120" height="160">
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                }}
              >
                <div style={{ width: 100, height: 132, overflow: 'visible' }}>
                  {character.sprite ? (
                    <PixelAvatar sprite={character.sprite} size={100} hairOverlay={character.hairOverlay} hairTransform={character.hairTransform} />
                  ) : character.isMyOshi ? (
                    <PixelAvatar
                      selections={{ parts: character.parts, colors: character.colors }}
                      size={100}
                    />
                  ) : (
                    <div
                      style={{
                        width: 100,
                        height: 120,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 72,
                      }}
                    >
                      {character.emoji}
                    </div>
                  )}
                </div>
              </div>
            </foreignObject>

            {/* 캐릭터 그림자 */}
            <ellipse cx="200" cy="330" rx="32" ry="7" fill="rgba(0,0,0,0.22)" />
          </IsometricRoom>

          {/* 오른쪽 상단: BGM 인디케이터 */}
          <div className="absolute top-2 right-2 bg-white/90 rounded-full px-2 py-1 flex items-center gap-1 shadow text-[10px] font-bold text-oshi-dark">
            <span>🎵</span>
            <span className="truncate max-w-[100px]">
              {character.catchphrase.slice(0, 12)}...
            </span>
          </div>

          {/* 왼쪽 하단: 방 정보 */}
          <div className="absolute bottom-2 left-2 bg-white/90 rounded-lg px-2 py-1 text-[10px] font-bold text-oshi-dark shadow">
            応援 {supportPoints}pt · 訪問 {Math.floor(supportPoints / 5) + 1}回目
          </div>
        </div>

        {/* 하단 액션 메뉴 (Cyworld 느낌) */}
        <div className="grid grid-cols-4 divide-x divide-oshi-sub border-t-2 border-oshi-sub bg-oshi-bg/40">
          <MenuButton emoji="💬" label="방명록" onClick={() => alert('방명록は Phase 2 で実装予定！')} />
          <MenuButton emoji="🛋️" label="家具追加" onClick={() => alert('家具の追加機能は次のアップデートで！')} />
          <MenuButton emoji="💖" label="응원" onClick={() => onOpenDetail(characterId)} />
          <MenuButton emoji="📷" label="앨범" onClick={() => alert('アルバム機能は Phase 2 で！')} />
        </div>
      </section>

      {/* 캐릭터 카드 (간략) */}
      <section className="mt-4 card p-3">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
            style={{ backgroundColor: character.themeColor + '40' }}
          >
            {character.sprite ? (
              <PixelAvatar sprite={character.sprite} size={48} hairOverlay={character.hairOverlay} hairTransform={character.hairTransform} />
            ) : character.isMyOshi ? (
              <PixelAvatar
                selections={{ parts: character.parts, colors: character.colors }}
                size={44}
              />
            ) : (
              <span className="text-2xl">{character.emoji}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-black text-oshi-dark">{character.name}</div>
            <div className="text-[11px] text-oshi-dark/70 line-clamp-1">
              「{character.catchphrase}」
            </div>
          </div>
          <button
            onClick={() => onOpenDetail(characterId)}
            className="text-xs font-bold text-oshi-main hover:underline"
          >
            詳細 ›
          </button>
        </div>
      </section>

      {/* 피드 스텁 (BGM / 최근 활동 / 방명록 최근) */}
      <section className="mt-4 card">
        <div className="text-xs font-bold text-oshi-dark/60 mb-2">📻 今日のBGM</div>
        <div className="bg-gradient-to-r from-oshi-sub/30 to-oshi-bg rounded-xl px-3 py-2 text-xs text-oshi-dark flex items-center gap-2">
          <span className="text-lg">🎼</span>
          <span className="truncate">「{character.catchphrase}」</span>
        </div>

        <div className="text-xs font-bold text-oshi-dark/60 mt-4 mb-2">✨ 最近のアクション</div>
        <div className="space-y-1 text-xs text-oshi-dark/80">
          <ActivityLine emoji="💖" text={`${supportPoints}ポイント 応援しました`} />
          <ActivityLine emoji="⭐" text={`Lv.${level} に到達！`} />
          <ActivityLine emoji="🏠" text="おへやに遊びに来ました" />
        </div>
      </section>
    </div>
  );
}

function MenuButton({ emoji, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 py-3 hover:bg-white/60 active:scale-95 transition"
    >
      <div className="text-lg">{emoji}</div>
      <div className="text-[10px] font-bold text-oshi-dark/80">{label}</div>
    </button>
  );
}

function ActivityLine({ emoji, text }) {
  return (
    <div className="flex items-center gap-2 py-1 border-b border-oshi-sub/30 last:border-0">
      <span>{emoji}</span>
      <span className="text-[11px] flex-1">{text}</span>
    </div>
  );
}
