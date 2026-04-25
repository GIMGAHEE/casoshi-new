// 캔뱃지 마스터 데이터
// 라이버 추가시 여기에 4종 (또는 더) 추가하면 자동으로 가챠 풀에 들어감

export const BADGES = {
  // === 라이버 1: oshinoko (예시) ===
  oshinoko_smile: {
    id: 'oshinoko_smile',
    liverId: 'oshinoko',
    name: '笑顔ver',
    rarity: 'normal',
    image: '/casoshi/badges/oshinoko_smile.png',
  },
  oshinoko_wink: {
    id: 'oshinoko_wink',
    liverId: 'oshinoko',
    name: 'ウインクver',
    rarity: 'normal',
    image: '/casoshi/badges/oshinoko_wink.png',
  },
  oshinoko_live: {
    id: 'oshinoko_live',
    liverId: 'oshinoko',
    name: 'ライブ衣装ver',
    rarity: 'rare',
    image: '/casoshi/badges/oshinoko_live.png',
  },
  oshinoko_birthday: {
    id: 'oshinoko_birthday',
    liverId: 'oshinoko',
    name: '誕生日限定ver',
    rarity: 'ur',
    image: '/casoshi/badges/oshinoko_birthday.png',
  },
};

export const RARITY_CONFIG = {
  normal: {
    key: 'normal',
    label: 'ノーマル',
    color: '#A0A0A0',
    glowColor: '#E0E0E0',
    rate: 0.80,
    refundPoints: 10,
    stars: 1,
  },
  rare: {
    key: 'rare',
    label: 'レア',
    color: '#5B9CFF',
    glowColor: '#A0C8FF',
    rate: 0.18,
    refundPoints: 30,
    stars: 2,
  },
  // SR 자리는 나중을 위해 비워둠 — 추가시 rate 재조정 필요
  ur: {
    key: 'ur',
    label: 'UR',
    color: '#FFD700',
    glowColor: '#FFF4A0',
    rate: 0.02,
    refundPoints: 100,
    stars: 4,
  },
};

export const GACHA_COST = {
  single: 100,
  ten: 900, // 10% 할인
};

export const GACHA_REWARDS = {
  perSupport: 10,         // 응원 1회당 가챠pt
  dailyFirstSupport: 50,  // 하루 첫 응원 보너스
  liverLevelUp: 100,      // 라이버 Lv.UP 시 보너스
  dailyFreePull: true,    // 하루 1회 무료 가챠
};

// 헬퍼 함수
export function getBadgesByLiver(liverId) {
  return Object.values(BADGES).filter(b => b.liverId === liverId);
}

export function getBadgesByRarity(rarity) {
  return Object.values(BADGES).filter(b => b.rarity === rarity);
}

export function getBadgeById(id) {
  return BADGES[id] || null;
}
