// 하단 탭 네비게이션 — 모바일 앱 느낌의 메인 네비
//
// 탭 구조:
//   ホーム     → home screen
//   ランキング → ranking
//   応援      → ranking (ライバー 탭이 기본이라 응원 대상 목록으로 자연스럽게)
//   マイ推し   → MyOshi MiniHome (있으면) / Builder (없으면)
//   メニュー   → 준비중 alert (추후 설정/리셋 페이지)
//
// 기존 /public/icons/*.png 를 최대한 활용. ホーム와 メニュー는 적절한
// 기존 아이콘이 없어서 이모지로 유지.

const TABS = [
  { id: 'home',    type: 'emoji', icon: '🏠',                 label: 'ホーム' },
  { id: 'ranking', type: 'img',   icon: '/icons/trophy.png',  label: 'ランキング' },
  { id: 'support', type: 'img',   icon: '/icons/heart.png',   label: '応援' },
  { id: 'myoshi',  type: 'img',   icon: '/icons/sofa.png',    label: 'マイ推し' },
  { id: 'menu',    type: 'emoji', icon: '☰',                  label: 'メニュー' },
];

export default function BottomNav({ active, onNavigate }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t-2 border-oshi-sub z-20 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
      <div className="max-w-md mx-auto grid grid-cols-5">
        {TABS.map(t => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onNavigate(t.id)}
              className={`py-2 flex flex-col items-center gap-0.5 transition ${
                isActive ? 'text-oshi-main' : 'text-oshi-dark/50'
              }`}
            >
              {t.type === 'img' ? (
                <img
                  src={t.icon}
                  alt=""
                  className={`w-7 h-7 object-contain ${isActive ? '' : 'opacity-60 grayscale-[25%]'}`}
                  style={{ imageRendering: 'pixelated' }}
                  draggable={false}
                />
              ) : (
                <div className={`text-2xl leading-none ${isActive ? '' : 'opacity-60'}`}>
                  {t.icon}
                </div>
              )}
              <div className={`text-[10px] ${isActive ? 'font-black' : 'font-bold'}`}>
                {t.label}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
