import { findCharacter, calcLevel } from '../data/characters';
import { useLivers } from '../hooks/useLivers';
import { findFurniture } from '../data/furniture';
import IsometricRoom from '../components/IsometricRoom';
import PixelAvatar from '../components/PixelAvatar';

export default function MiniHome({
  characterId, myOshi, supports, room,
  onBack, onOpenDetail, onEditRoom,
}) {
  const livers = useLivers();
  const character = findCharacter(myOshi, characterId, livers);
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
  // 라이버의 경우 liver 본인이 꾸민 방 (liverRoom) 우선 사용, 없으면 팬의 room 데이터
  const effectiveRoom = character.isLiver && character.liverRoom
    ? character.liverRoom
    : room;
  const roomItems = effectiveRoom?.items || [];
  const characterPos = effectiveRoom?.characterPos || { x: 50, y: 80 };

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-24">
      <button
        onClick={onBack}
        className="text-sm text-oshi-dark/70 hover:text-oshi-dark"
      >
        <img src="/icons/back.png" alt="戻る" className="w-10 h-10 object-contain" style={{ imageRendering: "pixelated" }} draggable={false} />
      </button>

      {/* Cyworld-style 헤더 */}
      <section className="mt-3 rounded-2xl overflow-hidden shadow-md border-2 border-oshi-sub bg-white">
        <div
          className="px-4 py-2 flex items-center justify-between text-white text-xs font-bold"
          style={{ backgroundColor: character.themeColor }}
        >
          <span className="flex items-center gap-1.5">
            <img src="/icons/home.png" alt="" className="w-4 h-4" style={{ imageRendering: 'pixelated' }} />
            {character.name}のおへや
          </span>
          <span className="opacity-80">Lv.{level}</span>
        </div>

        {/* 방 뷰 */}
        <div className="relative">
          <IsometricRoom character={character}>
            {/* 배치된 가구 렌더링 (캐릭터보다 뒤) */}
            {roomItems.map(item => {
              const f = findFurniture(item.furnitureId);
              if (!f) return null;
              const scale = item.scale ?? item.scaleX ?? 1;
              return (
                <div
                  key={item.id}
                  style={{
                    position: 'absolute',
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                    width: `${f.defaultWidthPercent * scale}%`,
                    aspectRatio: f.aspectRatio,
                    transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
                    transformOrigin: 'center center',
                    pointerEvents: 'none',
                  }}
                >
                  <img
                    src={f.image}
                    alt=""
                    draggable={false}
                    style={{
                      width: '100%',
                      height: '100%',
                      imageRendering: 'pixelated',
                    }}
                  />
                </div>
              );
            })}

            {/* 캐릭터 (RoomEditor와 동일한 렌더 로직)
               hairBaked preset(크롭된 basic_bob): width%, center anchor
               그 외: 기존 구조(발 기준 anchor, size=90) */}
            {character.sprite && character.spriteSize && !character.hairOverlay ? (
              <div
                style={{
                  position: 'absolute',
                  left: `${characterPos.x}%`,
                  top: `${characterPos.y}%`,
                  width: '8%',
                  height: '22.9%',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                }}
              >
                <img
                  src={character.sprite}
                  alt=""
                  draggable={false}
                  style={{
                    width: '100%',
                    height: '100%',
                    imageRendering: 'pixelated',
                    display: 'block',
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  position: 'absolute',
                  left: `${characterPos.x}%`,
                  top: `${characterPos.y}%`,
                  transform: 'translate(-50%, -100%)',
                  pointerEvents: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div style={{ height: 104, width: 90, overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
                  {character.sprite ? (
                    <PixelAvatar
                      sprite={character.sprite}
                      size={90}
                      hairOverlay={character.hairOverlay}
                      hairTransform={character.hairTransform}
                    />
                  ) : character.isMyOshi ? (
                    <PixelAvatar
                      selections={{ parts: character.parts, colors: character.colors }}
                      size={90}
                    />
                  ) : (
                    <div style={{ fontSize: 72 }}>{character.emoji}</div>
                  )}
                </div>
              </div>
            )}
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
          <MenuButton
            emoji={<img src="/icons/chat.png" alt="" className="w-6 h-6" style={{ imageRendering: 'pixelated' }} />}
            label="ゲストブック"
            onClick={() => alert('ゲストブックは Phase 2 で実装予定！')}
          />
          <MenuButton
            emoji={<img src="/icons/sofa.png" alt="" className="w-6 h-6" style={{ imageRendering: 'pixelated' }} />}
            label={character.isLiver ? '本人のみ' : '家具追加'}
            onClick={character.isLiver
              ? () => alert('ライバー本人がマイページから飾ります 🎤')
              : onEditRoom}
          />
          <MenuButton
            emoji={character.isLiver
              ? <img src="/icons/heart.png" alt="" className="w-5 h-5" style={{ imageRendering: 'pixelated' }} />
              : <div className="text-xl">📝</div>}
            label={character.isLiver ? '応援' : 'プロフィール'}
            onClick={() => onOpenDetail(characterId)}
          />
          <MenuButton
            emoji={<img src="/icons/camera.png" alt="" className="w-6 h-6" style={{ imageRendering: 'pixelated' }} />}
            label="アルバム"
            onClick={() => alert('アルバム機能は Phase 2 で！')}
          />
        </div>
      </section>

      {/* 캐릭터 카드 (간략) */}
      <section className="mt-4 card p-3">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
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
          <ActivityLine
            emoji={<img src="/icons/heart.png" alt="" className="w-4 h-4 inline-block" style={{ imageRendering: 'pixelated' }} />}
            text={`${supportPoints}ポイント 応援しました`}
          />
          <ActivityLine emoji="⭐" text={`Lv.${level} に到達！`} />
          <ActivityLine
            emoji={<img src="/icons/home.png" alt="" className="w-4 h-4 inline-block" style={{ imageRendering: 'pixelated' }} />}
            text="おへやに遊びに来ました"
          />
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
