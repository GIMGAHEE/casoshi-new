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
    color: '#FFB5C5',
    glowColor: '#FFE4F1',
    labelImage: '/casoshi/rarity/normal.png',
    rate: 0.80,
    refundPoints: 5,
    stars: 1,
  },
  rare: {
    key: 'rare',
    label: 'レア',
    color: '#C8B5E8',
    glowColor: '#E8DCFF',
    labelImage: '/casoshi/rarity/rare.png',
    rate: 0.18,
    refundPoints: 10,
    stars: 2,
  },
  // SR 슬롯 — 이미지 라벨은 준비되어 있고, 캔뱃지가 추가되면 자동 활성화
  sr: {
    key: 'sr',
    label: 'SR',
    color: '#FFC580',
    glowColor: '#FFE4B0',
    labelImage: '/casoshi/rarity/sr.png',
    rate: 0,
    refundPoints: 20,
    stars: 3,
  },
  ur: {
    key: 'ur',
    label: 'UR',
    color: '#FFD8E8',
    glowColor: '#FFF0F8',
    labelImage: '/casoshi/rarity/ur.png',
    rate: 0.02,
    refundPoints: 50,
    stars: 4,
  },
};

export const GACHA_COST = {
  single: 30,
  ten: 270, // 10% 할인
};

// 무료 가챠 룰만 남김 (포인트 적립은 일반 포인트 시스템으로 통합)
export const GACHA_FREE_PULL = {
  perDay: 1,  // 하루 1회 무료
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
