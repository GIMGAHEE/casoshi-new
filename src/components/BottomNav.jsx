// 하단 탭 네비게이션 — 모바일 앱 느낌의 메인 네비
// 현재 화면에 따라 활성 탭이 강조된다.
//
// 탭 구조:
//   ホーム      → home
//   ランキング  → ranking
//   応援       → ranking (ライバー 탭이 디폴트라 자연스럽게 응원 대상 목록)
//   ショップ    → 준비중 alert
//   メニュー    → 준비중 alert (추후 설정/리셋 페이지)

const TABS = [
  { id: 'home',    icon: '🏠', label: 'ホーム' },
  { id: 'ranking', icon: '👑', label: 'ランキング' },
  { id: 'support', icon: '💖', label: '応援' },
  { id: 'shop',    icon: '🛍️', label: 'ショップ' },
  { id: 'menu',    icon: '☰',  label: 'メニュー' },
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
              className={`py-2.5 flex flex-col items-center gap-0.5 transition ${
                isActive ? 'text-oshi-main' : 'text-oshi-dark/50'
              }`}
            >
              <div className={`text-xl leading-none ${isActive ? '' : 'opacity-70'}`}>
                {t.icon}
              </div>
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
