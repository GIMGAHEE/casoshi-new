// 방 꾸미기용 가구 카탈로그
// defaultWidthPercent: 방 너비 대비 가구 기본 너비 (%)
// aspectRatio: PNG의 width/height (레이아웃 계산용)
// ※ 2026-04: PNG들을 content bbox로 크롭해서 여백 제거 → aspectRatio / defaultWidthPercent 재계산됨

export const FURNITURE_CATALOG = [
  {
    id: 'bed',
    label: 'ベッド',
    image: '/furniture/bed.png',
    aspectRatio: 1.42,
    defaultWidthPercent: 22.5,
  },
  {
    id: 'chair',
    label: 'いす',
    image: '/furniture/chair.png',
    aspectRatio: 0.87,
    defaultWidthPercent: 8.6,
  },
  {
    id: 'vanity',
    label: 'ドレッサー',
    image: '/furniture/vanity.png',
    aspectRatio: 0.82,
    defaultWidthPercent: 17.1,
  },
  {
    id: 'drawer',
    label: 'チェスト',
    image: '/furniture/drawer.png',
    aspectRatio: 1.25,
    defaultWidthPercent: 13.0,
  },
  {
    id: 'carpet1',
    label: 'カーペット',
    image: '/furniture/carpet1.png',
    aspectRatio: 2.03,
    defaultWidthPercent: 48.7,
  },
  {
    id: 'carpet2',
    label: 'ハートマット',
    image: '/furniture/carpet2.png',
    aspectRatio: 1.71,
    defaultWidthPercent: 39.6,
  },
];

export const findFurniture = (id) =>
  FURNITURE_CATALOG.find(f => f.id === id);

// 방 아이템 기본값 (새로 추가할 때)
export const createRoomItem = (furnitureId) => {
  const now = Date.now();
  return {
    id: `item_${now}_${Math.random().toString(36).slice(2, 7)}`,
    furnitureId,
    x: 50,        // 방 중앙 (%)
    y: 70,        // 바닥 쪽
    scale: 1.0,   // 균일 배율
    rotation: 0,
  };
};
