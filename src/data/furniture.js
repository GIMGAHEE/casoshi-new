// 방 꾸미기용 가구 카탈로그
// defaultWidthPercent: 방 너비 대비 가구 기본 너비 (%)
// aspectRatio: PNG의 width/height (레이아웃 계산용)

export const FURNITURE_CATALOG = [
  {
    id: 'bed',
    label: 'ベッド',
    image: '/furniture/bed.png',
    aspectRatio: 1.5,       // 1536 / 1024
    defaultWidthPercent: 42,
  },
  {
    id: 'chair',
    label: 'いす',
    image: '/furniture/chair.png',
    aspectRatio: 1.0,       // 1024 / 1024
    defaultWidthPercent: 20,
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
    scaleX: 1.0,
    scaleY: 1.0,
    rotation: 0,
  };
};
