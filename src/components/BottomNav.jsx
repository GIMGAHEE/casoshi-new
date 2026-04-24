// 하단 탭 네비게이션 — 모바일 앱 느낌의 메인 네비
//
// 탭 구조 (4개):
//   ホーム     → home screen        (home.png)
//   ランキング → ranking            (trophy.png)
//   応援      → ranking (ライバー 탭) (heart.png)
//   マイ推し   → MyOshi MiniHome / Builder (sofa.png)
//
// メニュー 는 당분간 비공개 (설정/리셋 기능이 본격적으로 필요해지면 부활)

const TABS = [
  { id: 'home',    icon: '/icons/home.png',   label: 'ホーム' },
  { id: 'ranking', icon: '/icons/trophy.png', label: 'ランキング' },
  { id: 'support', icon: '/icons/heart.png',  label: '応援' },
  { id: 'myoshi',  icon: '/icons/sofa.png',   label: 'マイホーム' },
];

export default function BottomNav({ active, onNavigate }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t-2 border-oshi-sub z-20 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
      <div className="max-w-md mx-auto grid grid-cols-4">
        {TABS.map(t => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onNavigate(t.id)}
              className={`py-2 flex flex-col items-center gap-0.5 transition ${
                isActive ? 'text-oshi-main' : 'text-oshi-dark/60'
              }`}
            >
              <img
                src={t.icon}
                alt=""
                className="w-7 h-7 object-contain"
                style={{ imageRendering: 'pixelated' }}
                draggable={false}
              />
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
