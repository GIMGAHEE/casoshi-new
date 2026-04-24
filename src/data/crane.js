// クレーンゲーム (인형뽑기) 데이터
// 추후 인형 그래픽 업로드되면 emoji 필드를 image: '/dolls/...' 로 교체

// 인형 풀 (등급별)
export const DOLL_POOL = [
  // N (일반) - 50%
  { id: 'n_heart',   name: 'ハート',   rarity: 'N', emoji: '💖' },
  { id: 'n_star',    name: 'スター',   rarity: 'N', emoji: '⭐' },
  { id: 'n_cloud',   name: 'くも',     rarity: 'N', emoji: '☁️' },
  { id: 'n_flower',  name: 'おはな',   rarity: 'N', emoji: '🌸' },

  // R (레어) - 30%
  { id: 'r_bear',    name: 'くまちゃん', rarity: 'R', emoji: '🐻' },
  { id: 'r_bunny',   name: 'うさちゃん', rarity: 'R', emoji: '🐰' },
  { id: 'r_cat',     name: 'ねこちゃん', rarity: 'R', emoji: '🐱' },

  // SR (슈퍼레어) - 15%
  { id: 'sr_panda',  name: 'パンダ',   rarity: 'SR', emoji: '🐼' },
  { id: 'sr_unicorn',name: 'ユニコーン', rarity: 'SR', emoji: '🦄' },

  // SSR (울트라레어) - 5%
  { id: 'ssr_dragon',name: 'ドラゴン', rarity: 'SSR', emoji: '🐉' },
];

// 등급별 속성
export const RARITY_INFO = {
  N:   { label: 'N',   prob: 0.50, color: '#B0B0B0', glow: 'none',                       reward: 20,  pointReward: true  },
  R:   { label: 'R',   prob: 0.30, color: '#5BA4E0', glow: '0 0 12px rgba(91,164,224,.5)', reward: 80,  pointReward: true  },
  SR:  { label: 'SR',  prob: 0.15, color: '#B77EE0', glow: '0 0 18px rgba(183,126,224,.7)', reward: 0,   furnitureUnlock: true },
  SSR: { label: 'SSR', prob: 0.05, color: '#FFB800', glow: '0 0 28px rgba(255,184,0,.9)',   reward: 300, levelBoost: 100 },
};

// 1회 플레이 비용 / 무료 쿨다운
export const CRANE_COST = 50;
export const CRANE_FREE_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24시간

// 성공 판정:
// crane-doll 중심 거리가 작을수록 성공 확률↑
// 거리 0 → 95% / 거리 50(최대) → 15%
export const calcSuccessProb = (distancePx, maxDist = 50) => {
  const t = Math.min(1, Math.max(0, distancePx / maxDist));
  return 0.95 - 0.80 * t; // 95% → 15%
};

// 랜덤 등급 뽑기
export const rollRarity = () => {
  const rand = Math.random();
  let acc = 0;
  for (const key of ['SSR', 'SR', 'R', 'N']) { // 희귀도 높은 순으로 체크
    acc += RARITY_INFO[key].prob;
  }
  // 정방향으로 다시
  acc = 0;
  const r = Math.random();
  for (const key of ['N', 'R', 'SR', 'SSR']) {
    acc += RARITY_INFO[key].prob;
    if (r < acc) return key;
  }
  return 'N';
};

// 등급 내 랜덤 인형
export const rollDoll = (rarity) => {
  const pool = DOLL_POOL.filter(d => d.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
};
