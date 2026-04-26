import { SEED_CHARACTERS, asCharacter, asLiverCharacter, MY_OSHI_ID, MY_OSHI_PRESETS } from '../data/characters';
import { todayKey, DAILY_BONUS } from '../data/gameRules';
import { useLivers } from '../hooks/useLivers';
import CharacterCard from '../components/CharacterCard';
import PixelAvatar from '../components/PixelAvatar';

export default function Home({
  points, setPoints,
  supports, myOshi,
  liverSession,
  lastCheckin, setLastCheckin,
  onSelectCharacter, onOpenTapGame, onOpenRhythmGame, onOpenCraneGame, onOpenGacha, onOpenRanking,
  onOpenBuilder, onOpenLiverLogin, onOpenLiverDashboard,
}) {
  const today = todayKey();
  const canCheckin = lastCheckin !== today;
  const myOshiChar = asCharacter(myOshi);

  // 운영자가 등록한 라이버들 (로그인한 라이버 본인은 제외)
  const allLivers = useLivers();
  const selfLiver = liverSession ? allLivers.find(l => l.id === liverSession.liverId) : null;
  const registeredLivers = allLivers
    .filter(l => !liverSession || l.id !== liverSession.liverId)
    .map(asLiverCharacter)
    .filter(Boolean);

  const handleCheckin = () => {
    if (!canCheckin) return;
    setPoints(p => p + DAILY_BONUS);
    setLastCheckin(today);
  };

  // 산리오/픽셀 UI 톤 — 흰색 BG + 연한 핑크 보더 + 작은 단색 그림자
  const pixelCard = {
    background: '#fffafd',
    borderColor: '#ffc4dc',
    borderRadius: '14px',
    boxShadow: '0 2px 0 0 #ffc4dc',
  };
  // 선택/강조 카드 (랭킹) — 노랑 톤
  const pixelCardSelected = {
    background: '#fff8d8',
    borderColor: '#ffaa2a',
    borderRadius: '14px',
    boxShadow: '0 2px 0 0 #ffd87a',
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-3 pb-6 space-y-5">
      {/* 히어로 — 로고 이미지 (ゲームで推しを育てる 부제목도 이미지에 포함됨) */}
      <section className="text-center">
        <img
          src="/logo.png"
          alt="Casオシ — ゲームで推しを育てる、新しい推し活。"
          className="mx-auto w-full max-w-xs"
          style={{ imageRendering: 'pixelated' }}
          draggable={false}
        />
      </section>

      {/* 액션 섹션 */}
      <section className="space-y-4">
        {/* 1열: 출석 / 랭킹 / 마이홈 (3-col) */}
        <div className="grid grid-cols-3 gap-3">
          {/* 출석 체크 — 보라+핑크 톤 */}
          <button
            onClick={handleCheckin}
            disabled={!canCheckin}
            style={pixelCard}
            className={`card flex flex-col items-center justify-center py-4 px-2 transition ${
              canCheckin ? 'hover:brightness-105 cursor-pointer' : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <img
              src="/icons/calendar.png"
              alt=""
              className="w-12 h-12 mb-1"
              style={{ imageRendering: 'pixelated' }}
            />
            <div className="text-[11px] font-bold text-oshi-dark leading-tight text-center">
              {canCheckin ? '出席' : '出席済み'}
            </div>
            <div className="text-[9px] text-oshi-dark/55 mt-0.5">+{DAILY_BONUS} pt</div>
          </button>

          {/* 랭킹 — 노란색 강조 (핵심 기능) */}
          <button
            onClick={onOpenRanking}
            style={pixelCardSelected}
            className="card flex flex-col items-center justify-center py-4 px-2 hover:brightness-105 transition"
          >
            <img
              src="/icons/trophy.png"
              alt=""
              className="h-12 w-auto mb-1"
              style={{ imageRendering: 'pixelated' }}
            />
            <div className="text-[11px] font-bold text-oshi-dark leading-tight text-center">ランキング</div>
            <div className="text-[9px] text-oshi-dark/55 mt-0.5">推しをチェック</div>
          </button>

          {/* 마이홈 (라이버 마이페이지 / 마이 추시 / 작성 CTA) */}
          {liverSession && selfLiver ? (() => {
            const liverChar = asLiverCharacter(selfLiver);
            return (
              <button
                onClick={onOpenLiverDashboard}
                style={pixelCard}
                className="card relative flex flex-col items-center justify-center py-4 px-2 hover:brightness-105 transition"
              >
                <span className="absolute top-1 right-1 text-[8px] font-black bg-oshi-main text-white px-1.5 py-0.5 rounded-full">
                  LIVER
                </span>
                <AvatarTile
                  sprite={liverChar?.sprite}
                  hairOverlay={liverChar?.hairOverlay}
                  hairTransform={liverChar?.hairTransform}
                  fallbackEmoji={selfLiver.profile.gender === 'boy' ? '🎤' : '💖'}
                />
                <div className="text-[11px] font-bold text-oshi-dark leading-tight text-center truncate w-full">
                  {selfLiver.profile.name}
                </div>
                <div className="text-[9px] text-oshi-dark/55 mt-0.5">マイページ</div>
              </button>
            );
          })() : myOshiChar ? (
            <button
              onClick={() => onSelectCharacter(MY_OSHI_ID)}
              style={pixelCard}
              className="card flex flex-col items-center justify-center py-4 px-2 hover:brightness-105 transition"
            >
              <AvatarTile
                sprite={myOshiChar.sprite}
                hairOverlay={myOshiChar.hairOverlay}
                hairTransform={myOshiChar.hairTransform}
                fallbackEmoji="💖"
              />
              <div className="text-[11px] font-bold text-oshi-dark leading-tight text-center truncate w-full">
                {myOshiChar.name}
              </div>
              <div className="text-[9px] text-oshi-dark/55 mt-0.5">マイホーム</div>
            </button>
          ) : (
            <button
              onClick={onOpenBuilder}
              style={{
                background: '#fffafd',
                borderColor: '#ffc4dc',
                borderRadius: '14px',
                borderStyle: 'dashed',
                boxShadow: '0 2px 0 0 #ffc4dc',
              }}
              className="card flex flex-col items-center justify-center py-4 px-2 hover:brightness-105 transition"
            >
              <div className="w-12 h-12 mb-1 flex items-center justify-center text-3xl">➕</div>
              <div className="text-[11px] font-bold text-oshi-main leading-tight text-center">マイ推し</div>
              <div className="text-[9px] text-oshi-dark/55 mt-0.5">作成する</div>
            </button>
          )}
        </div>

        {/* 2열: 게임 4개 (タップ/クレーン/推しリズム/ガチャ) */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={onOpenTapGame}
            style={pixelCard}
            className="card !p-2 flex flex-col items-center justify-center py-3 hover:scale-[1.03] transition-transform"
          >
            <img
              src="/icons/tap.png"
              alt=""
              className="w-12 h-12 mb-1"
              style={{ imageRendering: 'pixelated' }}
            />
            <div className="text-[10px] font-bold text-oshi-dark leading-tight text-center">タップ</div>
            <div className="text-[8px] text-oshi-dark/55 mt-0.5">+1 pt</div>
          </button>

          <button
            onClick={onOpenCraneGame}
            style={pixelCard}
            className="card !p-2 flex flex-col items-center justify-center py-3 hover:scale-[1.03] transition-transform"
          >
            <img
              src="/icons/crane.png"
              alt=""
              className="w-12 h-12 mb-1"
              style={{ imageRendering: 'pixelated' }}
            />
            <div className="text-[10px] font-bold text-oshi-dark leading-tight text-center">クレーン</div>
            <div className="text-[8px] text-oshi-dark/55 mt-0.5">1日1回無料</div>
          </button>

          <button
            onClick={onOpenRhythmGame}
            style={pixelCard}
            className="card !p-2 relative flex flex-col items-center justify-center py-3 hover:scale-[1.03] transition-transform"
          >
            <span className="absolute top-1 right-1 text-[7px] font-black bg-oshi-main text-white px-1 py-0.5 rounded-full">NEW</span>
            <img
              src="/icons/rhythm.png"
              alt=""
              className="w-12 h-12 mb-1 object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
            <div className="text-[10px] font-bold text-oshi-dark leading-tight text-center">推しリズム</div>
            <div className="text-[8px] text-oshi-dark/55 mt-0.5">30秒 リズム</div>
          </button>

          <button
            onClick={onOpenGacha}
            style={pixelCard}
            className="card !p-2 relative flex flex-col items-center justify-center py-3 hover:scale-[1.03] transition-transform"
          >
            <span className="absolute top-1 right-1 text-[7px] font-black bg-oshi-main text-white px-1 py-0.5 rounded-full">NEW</span>
            <img
              src="/casoshi/gacha/icon.png"
              alt=""
              className="w-12 h-12 mb-1 object-contain drop-shadow"
              style={{ imageRendering: 'pixelated' }}
              draggable={false}
            />
            <div className="text-[10px] font-bold text-oshi-dark leading-tight text-center">ガチャ</div>
            <div className="text-[8px] text-oshi-dark/55 mt-0.5">1日1回無料</div>
          </button>
        </div>
      </section>

      {/* 등록된 라이버 */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-lg font-black text-oshi-dark inline-flex items-center gap-2">
            <img src="/icons/mic.png" alt="" className="w-7 h-7 object-contain" style={{ imageRendering: 'pixelated' }} />
            登録ライバー
          </h2>
          <span className="text-xs text-oshi-dark/60">{registeredLivers.length}人</span>
        </div>
        {registeredLivers.length === 0 ? (
          <div
            className="p-6 text-center"
            style={{
              background: '#fffafd',
              border: '2px dashed #ffc4dc',
              borderRadius: '14px',
              boxShadow: '0 2px 0 0 #ffc4dc',
            }}
          >
            <img src="/icons/mic.png" alt="" className="w-10 h-10 object-contain mx-auto mb-2" style={{ imageRendering: 'pixelated' }} />
            <div className="text-xs text-oshi-dark/60">
              まだ登録されたライバーがいません
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {registeredLivers.map(ch => (
              <CharacterCard
                key={ch.id}
                character={ch}
                supportPoints={ch.stats?.totalSupport || 0}
                onClick={() => onSelectCharacter(ch.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 시드 캐릭터 (샘플) — 비공개. 나중에 콜라보/피처드 용도로 부활 가능.
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-lg font-black text-oshi-dark">サンプル推し</h2>
          <span className="text-xs text-oshi-dark/60">{SEED_CHARACTERS.length}人</span>
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
      */}

      <div className="text-center text-[10px] text-oshi-dark/40 pt-4 pb-8 space-y-1.5">
        {!liverSession && (
          <button
            onClick={onOpenLiverLogin}
            className="text-oshi-dark/60 hover:text-oshi-main underline underline-offset-2"
          >
            <img src="/icons/mic.png" alt="" className="w-4 h-4 inline-block mr-1 align-middle" style={{ imageRendering: 'pixelated' }} />
            ライバーログイン
          </button>
        )}
        {liverSession && selfLiver && (
          <div className="text-oshi-main/80 inline-flex items-center gap-1 justify-center">
            <img src="/icons/mic.png" alt="" className="w-4 h-4 object-contain" style={{ imageRendering: 'pixelated' }} />
            ログイン中: <span className="font-bold">{selfLiver.profile.name}</span>
          </div>
        )}
        <div>Phase 2 · ローカル保存 · 無課金</div>
      </div>
    </div>
  );
}

/**
 * 아바타 썸네일 타일 — 상반신만 보이는 크롭.
 *
 * 핵심: sprite 와 hairOverlay 는 원본 canvas 에서 hairTransform 으로 정렬됨.
 * 그래서 그 정렬을 유지한 상태로 "전체를 확대" 하는 방식으로 구현:
 *
 *   outer (56x56 overflow-hidden)
 *     └ scale wrapper (transform: scale(1.3), origin 'center top')
 *         └ composition root (relative)
 *             ├ sprite (block img)
 *             └ hair overlay (absolute + hairTransform)
 *
 * 이러면 내부에선 MiniHome/CharacterCard 와 동일한 sprite/hair 합성이 일어나고,
 * 바깥에서만 상반신 보이게 확대/크롭된다.
 */
function AvatarTile({ sprite, hairOverlay, hairTransform, fallbackEmoji }) {
  if (!sprite) {
    return (
      <div className="w-14 h-14 mb-1 rounded-xl bg-white/80 shadow-inner overflow-hidden flex items-center justify-center">
        <div className="text-3xl">{fallbackEmoji}</div>
      </div>
    );
  }
  // 두 종류의 sprite 가 근본적으로 다른 비율이라, 각각 다른 방식으로 표시:
  //   - 일반 (1024x1536, 큰 빈공간): 컨테이너 가득 + scale up + top anchor
  //     → 큰 빈공간 덕에 자연스럽게 상반신만 보이고 다리는 overflow
  //   - hairBaked (~447x854, 타이트): 이미 크롭된 sprite 라서 그냥 contain
  //     → 머리부터 발끝까지 다 들어오게, 작은 미니 피규어 느낌
  const isHairBaked = !hairOverlay;

  if (isHairBaked) {
    // momo(긴머리) 와 동일한 프레이밍 목표: 머리 위 약간 + 상반신, 다리 잘림.
    // 방법: 이미지를 컨테이너보다 크게(높이 140%) + 상단 정렬 + overflow-hidden.
    // sprite 가 타이트 크롭이라 단순히 height 만 키우면 됨.
    return (
      <div className="w-14 h-14 mb-1 rounded-xl bg-white/80 shadow-inner overflow-hidden relative flex justify-center">
        <img
          src={sprite}
          alt=""
          draggable={false}
          style={{
            position: 'absolute',
            top: '28%',
            height: '95%',
            width: 'auto',
            imageRendering: 'pixelated',
          }}
        />
      </div>
    );
  }

  // 일반 sprite: 기존 scale + top anchor 방식
  const SCALE = 1.3;
  return (
    <div className="w-14 h-14 mb-1 rounded-xl bg-white/80 shadow-inner overflow-hidden flex justify-center">
      <div
        style={{
          width: '100%',
          transform: `scale(${SCALE})`,
          transformOrigin: 'center top',
        }}
      >
        <div style={{ position: 'relative', width: '100%' }}>
          <img
            src={sprite}
            alt=""
            draggable={false}
            style={{
              display: 'block',
              width: '100%',
              imageRendering: 'pixelated',
            }}
          />
          {hairOverlay && (
            <img
              src={hairOverlay}
              alt=""
              draggable={false}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: hairTransform
                  ? `translate(${hairTransform.x}%, ${hairTransform.y}%) scale(${hairTransform.scale})`
                  : undefined,
                transformOrigin: 'center center',
                imageRendering: 'pixelated',
                pointerEvents: 'none',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
