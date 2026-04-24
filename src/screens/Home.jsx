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
  onSelectCharacter, onOpenTapGame, onOpenRhythmGame, onOpenCraneGame, onOpenRanking,
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

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* 히어로 */}
      <section className="text-center py-4">
        <div className="text-4xl font-black text-oshi-main mb-1">
          Casオシ
        </div>
        <div className="text-xs text-oshi-dark/60">
          ゲームで推しを育てる、新しい推し活。
        </div>
      </section>

      {/* 액션 섹션 */}
      <section className="space-y-3">
        {/* 1열: 출석 / 랭킹 / 마이홈 (3-col) */}
        <div className="grid grid-cols-3 gap-2">
          {/* 출석 체크 */}
          <button
            onClick={handleCheckin}
            disabled={!canCheckin}
            className={`card flex flex-col items-center justify-center py-4 px-2 transition ${
              canCheckin ? 'hover:bg-oshi-bg cursor-pointer' : 'opacity-50 cursor-not-allowed'
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

          {/* 랭킹 */}
          <button
            onClick={onOpenRanking}
            className="card flex flex-col items-center justify-center py-4 px-2 bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 hover:scale-[1.03] transition-transform"
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
                className="card relative flex flex-col items-center justify-center py-4 px-2 hover:scale-[1.03] transition-transform"
                style={{
                  background: `linear-gradient(135deg, ${selfLiver.profile.themeColor}22, ${selfLiver.profile.bgColor})`,
                  borderColor: selfLiver.profile.themeColor + '60',
                }}
              >
                <span className="absolute top-1 right-1 text-[8px] font-black bg-oshi-main text-white px-1.5 py-0.5 rounded-full">
                  LIVER
                </span>
                <div className="w-14 h-14 mb-1 rounded-xl bg-white/80 shadow-inner overflow-hidden relative">
                  {liverChar?.sprite ? (
                    <>
                      <img
                        src={liverChar.sprite}
                        alt=""
                        draggable={false}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'top',
                          imageRendering: 'pixelated',
                        }}
                      />
                      {liverChar.hairOverlay && (
                        <img
                          src={liverChar.hairOverlay}
                          alt=""
                          draggable={false}
                          style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'top',
                            transform: liverChar.hairTransform
                              ? `translate(${liverChar.hairTransform.x}%, ${liverChar.hairTransform.y}%) scale(${liverChar.hairTransform.scale})`
                              : undefined,
                            transformOrigin: 'center top',
                            imageRendering: 'pixelated',
                            pointerEvents: 'none',
                          }}
                        />
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      {selfLiver.profile.gender === 'boy' ? '🎤' : '💖'}
                    </div>
                  )}
                </div>
                <div className="text-[11px] font-bold text-oshi-dark leading-tight text-center truncate w-full">
                  {selfLiver.profile.name}
                </div>
                <div className="text-[9px] text-oshi-dark/55 mt-0.5">マイページ</div>
              </button>
            );
          })() : myOshiChar ? (
            <button
              onClick={() => onSelectCharacter(MY_OSHI_ID)}
              className="card flex flex-col items-center justify-center py-4 px-2 hover:scale-[1.03] transition-transform"
              style={{
                background: `linear-gradient(135deg, ${myOshiChar.themeColor}22, ${myOshiChar.bgColor})`,
                borderColor: myOshiChar.themeColor + '60',
              }}
            >
              <div className="w-14 h-14 mb-1 rounded-xl bg-white/80 shadow-inner overflow-hidden relative">
                {myOshiChar.sprite ? (
                  <>
                    <img
                      src={myOshiChar.sprite}
                      alt=""
                      draggable={false}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'top',
                        imageRendering: 'pixelated',
                      }}
                    />
                    {myOshiChar.hairOverlay && (
                      <img
                        src={myOshiChar.hairOverlay}
                        alt=""
                        draggable={false}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'top',
                          transform: myOshiChar.hairTransform
                            ? `translate(${myOshiChar.hairTransform.x}%, ${myOshiChar.hairTransform.y}%) scale(${myOshiChar.hairTransform.scale})`
                            : undefined,
                          transformOrigin: 'center top',
                          imageRendering: 'pixelated',
                          pointerEvents: 'none',
                        }}
                      />
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">💖</div>
                )}
              </div>
              <div className="text-[11px] font-bold text-oshi-dark leading-tight text-center truncate w-full">
                {myOshiChar.name}
              </div>
              <div className="text-[9px] text-oshi-dark/55 mt-0.5">マイホーム</div>
            </button>
          ) : (
            <button
              onClick={onOpenBuilder}
              className="card flex flex-col items-center justify-center py-4 px-2 border-dashed border-2 border-oshi-main/40 bg-gradient-to-br from-oshi-sub/40 via-white to-oshi-bg hover:scale-[1.03] transition-transform"
            >
              <div className="w-12 h-12 mb-1 flex items-center justify-center text-3xl">➕</div>
              <div className="text-[11px] font-bold text-oshi-main leading-tight text-center">マイ推し</div>
              <div className="text-[9px] text-oshi-dark/55 mt-0.5">作成する</div>
            </button>
          )}
        </div>

        {/* 2열: 게임 3개 */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onOpenTapGame}
            className="card flex flex-col items-center justify-center py-4 px-2 bg-gradient-to-br from-oshi-sub to-oshi-bg hover:scale-[1.03] transition-transform"
          >
            <img
              src="/icons/tap.png"
              alt=""
              className="w-14 h-14 mb-1"
              style={{ imageRendering: 'pixelated' }}
            />
            <div className="text-[11px] font-bold text-oshi-dark leading-tight text-center">タップゲーム</div>
            <div className="text-[9px] text-oshi-dark/55 mt-0.5">+1 pt</div>
          </button>

          <button
            onClick={onOpenCraneGame}
            className="card flex flex-col items-center justify-center py-4 px-2 bg-gradient-to-br from-pink-100 via-pink-50 to-pink-100 hover:scale-[1.03] transition-transform border-pink-200"
          >
            <img
              src="/icons/crane.png"
              alt=""
              className="w-14 h-14 mb-1"
              style={{ imageRendering: 'pixelated' }}
            />
            <div className="text-[11px] font-bold text-oshi-dark leading-tight text-center">クレーン</div>
            <div className="text-[9px] text-oshi-dark/55 mt-0.5">1日1回無料</div>
          </button>

          <button
            onClick={onOpenRhythmGame}
            className="card relative flex flex-col items-center justify-center py-4 px-2 bg-gradient-to-br from-purple-100 via-pink-50 to-orange-50 hover:scale-[1.03] transition-transform border-purple-200"
          >
            <span className="absolute top-1.5 right-1.5 text-[8px] font-black bg-oshi-main text-white px-1.5 py-0.5 rounded-full">NEW</span>
            <img
              src="/icons/rhythm.png"
              alt=""
              className="w-14 h-14 mb-1 object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
            <div className="text-[11px] font-bold text-oshi-dark leading-tight text-center">推しコール</div>
            <div className="text-[9px] text-oshi-dark/55 mt-0.5">30秒 リズム</div>
          </button>
        </div>
      </section>

      {/* 등록된 라이버 */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-lg font-black text-oshi-dark">🎤 登録ライバー</h2>
          <span className="text-xs text-oshi-dark/60">{registeredLivers.length}人</span>
        </div>
        {registeredLivers.length === 0 ? (
          <div className="bg-white/60 rounded-2xl border-2 border-dashed border-oshi-sub p-6 text-center">
            <div className="text-3xl mb-2">🎤</div>
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
                supportPoints={supports[ch.id] || 0}
                onClick={() => onSelectCharacter(ch.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 시드 캐릭터 (샘플) */}
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

      <div className="text-center text-[10px] text-oshi-dark/40 pt-4 pb-8 space-y-1.5">
        {!liverSession && (
          <button
            onClick={onOpenLiverLogin}
            className="text-oshi-dark/60 hover:text-oshi-main underline underline-offset-2"
          >
            🎤 ライバーログイン
          </button>
        )}
        {liverSession && selfLiver && (
          <div className="text-oshi-main/80">
            🎤 ログイン中: <span className="font-bold">{selfLiver.profile.name}</span>
          </div>
        )}
        <div>Phase 2 · ローカル保存 · 無課金</div>
      </div>
    </div>
  );
}
