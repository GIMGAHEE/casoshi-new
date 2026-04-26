import { useState } from 'react';
import {
  asCharacter, asLiverCharacter, calcLevel, SEED_CHARACTERS,
} from '../data/characters';
import { useLivers } from '../hooks/useLivers';
import { useMyOshis } from '../hooks/useMyOshis';
import { getUserId } from '../auth/userIdentity';
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
  const livers = useLivers();
  const allMyOshis = useMyOshis();
  const myUserId = getUserId();
  const [tab, setTab] = useState('liver'); // 'liver' | 'character'

  // 라이버 랭킹 — Firestore 에 쌓인 전체 유저 누적 pt (stats.totalSupport) 기준.
  // supports[c.id] 로컬값은 "나 혼자 응원한 양" 이라 진짜 랭킹이 아님.
  const liverRanked = livers
    .map(asLiverCharacter)
    .filter(Boolean)
    .map(c => ({ ...c, supportPoints: c.stats?.totalSupport || 0 }))
    .sort((a, b) => b.supportPoints - a.supportPoints);

  // 캐릭터 랭킹 — 본인 MyOshi + 다른 유저 MyOshi (Firestore).
  // 정렬: 최근 업데이트순 (응원 기능이 라이버 전용이라 활동성 기반).
  // 시드 캐릭터는 비공개 상태 (데모용이었음).
  const myOshiChar = asCharacter(myOshi);
  const otherOshis = allMyOshis
    .filter(m => m.userId !== myUserId && m.oshi)
    .map(m => asCharacter(m.oshi, {
      id: `myoshi_${m.userId}`,
      creatorId: m.userId,
      updatedAt: m.meta?.updatedAt || null,
    }))
    .filter(Boolean);

  const characterRanked = [
    ...(myOshiChar ? [myOshiChar] : []),
    ...otherOshis,
  ]
    .map(c => ({ ...c, supportPoints: supports[c.id] || 0 }))
    .sort((a, b) => {
      // 본인 / 다른 유저 MyOshi 는 updatedAt 내림차순, 없으면 뒤로
      const aT = a.updatedAt?.seconds || (a.isMyOshi ? Date.now() / 1000 : 0);
      const bT = b.updatedAt?.seconds || (b.isMyOshi ? Date.now() / 1000 : 0);
      return bT - aT;
    });

  const ranked = tab === 'liver' ? liverRanked : characterRanked;
  const top = ranked[0] || null;
  const hasAnySupport = top && top.supportPoints > 0;

  const isLiverTabEmpty = tab === 'liver' && liverRanked.length === 0;

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

      {/* 탭 */}
      <section className="flex gap-1 p-1 rounded-2xl bg-white/70 border-2 border-oshi-sub shadow-inner">
        <TabButton
          active={tab === 'liver'}
          onClick={() => setTab('liver')}
          icon="/icons/mic.png"
          label="ライバー"
          count={liverRanked.length}
        />
        <TabButton
          active={tab === 'character'}
          onClick={() => setTab('character')}
          icon="⭐"
          label="キャラクター"
          count={characterRanked.length}
        />
      </section>

      {/* 라이버 없는 경우 */}
      {isLiverTabEmpty ? (
        <div className="bg-white/60 rounded-2xl border-2 border-dashed border-oshi-sub p-10 text-center">
          <img src="/icons/mic.png" alt="" className="w-12 h-12 object-contain mx-auto mb-2" style={{ imageRendering: 'pixelated' }} />
          <div className="text-sm text-oshi-dark/60">
            まだ登録されたライバーがいません
          </div>
          <div className="text-[11px] text-oshi-dark/40 mt-1">
            運営がライバーを登録するとここに表示されます
          </div>
        </div>
      ) : (
        <>
          {/* 1등 크게 */}
          {hasAnySupport && (
            <section
              className="rounded-3xl p-6 text-center shadow-lg relative overflow-hidden"
              style={{ backgroundColor: top.bgColor }}
            >
              <img
                src="/icons/crown.png"
                alt=""
                className="absolute top-3 right-3 w-12 h-12 object-contain animate-float"
                style={{ imageRendering: 'pixelated' }}
                draggable={false}
              />

              <div className="text-[10px] font-black tracking-[0.3em] text-oshi-dark/60 mb-2">
                ✦ #1 {tab === 'liver' ? 'ライバー' : '推し'} ✦
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

              {tab === 'liver' && (
                <button
                  onClick={() => onSelectCharacter(top.id)}
                  className="btn-primary inline-block"
                  style={{ backgroundColor: top.themeColor }}
                >
                  もっと応援する
                </button>
              )}
            </section>
          )}

          {/* 순위 리스트 */}
          <section className="space-y-2">
            {ranked.map((c, idx) => {
              const level = calcLevel(c.supportPoints);
              const maxSupport = Math.max(top?.supportPoints || 1, 1);
              const barWidth = Math.max(4, (c.supportPoints / maxSupport) * 100);

              return (
                <button
                  key={c.id}
                  onClick={() => {
                    if (c.isOtherUserOshi) {
                      alert(`${c.name}\n他のユーザーが作った推しキャラです 👀`);
                      return;
                    }
                    onSelectCharacter(c.id);
                  }}
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-oshi-dark">{c.name}</span>
                      <span className="text-[10px] font-bold text-oshi-dark/50">Lv.{level}</span>
                      {c.isLiver && (
                        <span className="text-[9px] font-black bg-oshi-main text-white px-1.5 rounded-full">LIVE</span>
                      )}
                      {c.isMyOshi && (
                        <span className="text-[9px] font-black bg-yellow-400 text-white px-1.5 rounded-full">MY</span>
                      )}
                      {c.isOtherUserOshi && (
                        <span className="text-[9px] font-black bg-purple-400 text-white px-1.5 rounded-full">USER</span>
                      )}
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
        </>
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon, label, count }) {
  // icon: 문자열에 ".png" 들어가면 이미지 경로로 인식, 아니면 이모지
  const isImg = typeof icon === 'string' && icon.includes('.png');
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-1.5 ${
        active
          ? 'bg-oshi-main text-white shadow'
          : 'text-oshi-dark/60 hover:text-oshi-dark'
      }`}
    >
      {isImg ? (
        <img src={icon} alt="" className="w-4 h-4 object-contain" style={{ imageRendering: 'pixelated' }} />
      ) : (
        <span>{icon}</span>
      )}
      <span>{label}</span>
      <span className={`text-[10px] font-bold px-1.5 rounded-full ${
        active ? 'bg-white/30' : 'bg-oshi-sub/50 text-oshi-dark/70'
      }`}>
        {count}
      </span>
    </button>
  );
}
