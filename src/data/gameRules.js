// 오늘 날짜 키 (JST 기준 간단 처리 - Phase 1은 로컬 타임존 OK)
export const todayKey = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// 출석 보너스: 10 포인트
export const DAILY_BONUS = 10;

// 탭게임 보상: 탭당 1 포인트, 쿨다운 없음 (Phase 1)
export const TAP_REWARD = 1;

// 응원 비용: 1회당 5 포인트
export const SUPPORT_COST = 5;
