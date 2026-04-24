// 방 꾸미기용 가구 카탈로그
// defaultWidthPercent: 방 너비 대비 가구 기본 너비 (%)
// aspectRatio: PNG의 width/height (레이아웃 계산용)
// category: 'bed' | 'seat' | 'storage' | 'table' | 'deco'
// ※ 2026-04: PNG들을 content bbox로 크롭해서 여백 제거 → aspectRatio / defaultWidthPercent 재계산됨

export const FURNITURE_CATEGORIES = [
  { id: 'all',     label: 'すべて',       emoji: '🛋️' },
  { id: 'bed',     label: '寝具',         emoji: '🛏️' },
  { id: 'seat',    label: 'いす・ソファ', emoji: '🪑' },
  { id: 'storage', label: '収納',         emoji: '🗄️' },
  { id: 'table',   label: 'テーブル',     emoji: '💡' },
  { id: 'deco',    label: 'デコ',         emoji: '🌿' },
];

export const FURNITURE_CATALOG = [
  {
    id: 'bed',
    label: 'ベッド',
    image: '/furniture/bed.png',
    category: 'bed',
    aspectRatio: 1.42,
    defaultWidthPercent: 19.0,
  },
  {
    id: 'chair',
    label: 'いす',
    image: '/furniture/chair.png',
    category: 'seat',
    aspectRatio: 0.87,
    defaultWidthPercent: 7.3,
  },
  {
    id: 'vanity',
    label: 'ドレッサー',
    image: '/furniture/vanity.png',
    category: 'storage',
    aspectRatio: 0.82,
    defaultWidthPercent: 14.5,
  },
  {
    id: 'drawer',
    label: 'チェスト',
    image: '/furniture/drawer.png',
    category: 'storage',
    aspectRatio: 1.25,
    defaultWidthPercent: 11.0,
  },
  {
    id: 'carpet1',
    label: 'カーペット',
    image: '/furniture/carpet1.png',
    category: 'deco',
    aspectRatio: 2.03,
    defaultWidthPercent: 41.5,
  },
  {
    id: 'carpet2',
    label: 'ハートマット',
    image: '/furniture/carpet2.png',
    category: 'deco',
    aspectRatio: 1.71,
    defaultWidthPercent: 33.5,
  },
  {
    id: 'carpet_rainbow',
    label: 'レインボーマット',
    image: '/furniture/carpet_rainbow.png',
    category: 'deco',
    aspectRatio: 2.245,
    defaultWidthPercent: 41.0,
  },
  {
    id: 'carpet_pink_check',
    label: 'チェックマット',
    image: '/furniture/carpet_pink_check.png',
    category: 'deco',
    aspectRatio: 2.464,
    defaultWidthPercent: 42.5,
  },
  {
    id: 'sofa_heart',
    label: 'ハートソファ',
    image: '/furniture/sofa_heart.png',
    category: 'seat',
    aspectRatio: 1.339,
    defaultWidthPercent: 20.0,
  },
  {
    id: 'bed_pink',
    label: 'ピンクベッド',
    image: '/furniture/bed_pink.png',
    category: 'bed',
    aspectRatio: 0.816,
    defaultWidthPercent: 15.0,
  },
  {
    id: 'wardrobe',
    label: 'クローゼット',
    image: '/furniture/wardrobe.png',
    category: 'storage',
    aspectRatio: 0.634,
    defaultWidthPercent: 12.0,
  },
  {
    id: 'nightstand_lamp',
    label: 'ナイトテーブル',
    image: '/furniture/nightstand_lamp.png',
    category: 'table',
    aspectRatio: 0.637,
    defaultWidthPercent: 9.0,
  },
  {
    id: 'side_table_plant',
    label: 'サイドテーブル',
    image: '/furniture/side_table_plant.png',
    category: 'table',
    aspectRatio: 0.949,
    defaultWidthPercent: 12.0,
  },
  {
    id: 'chair_simple',
    label: 'シンプルチェア',
    image: '/furniture/chair_simple.png',
    category: 'seat',
    aspectRatio: 0.613,
    defaultWidthPercent: 7.0,
  },
  {
    id: 'bookshelf',
    label: '本棚',
    image: '/furniture/bookshelf.png',
    category: 'storage',
    aspectRatio: 0.715,
    defaultWidthPercent: 12.0,
  },
  {
    id: 'tv_stand',
    label: 'テレビ',
    image: '/furniture/tv_stand.png',
    category: 'table',
    aspectRatio: 1.089,
    defaultWidthPercent: 14.5,
  },
  {
    id: 'plant_large',
    label: '観葉植物',
    image: '/furniture/plant_large.png',
    category: 'deco',
    aspectRatio: 0.614,
    defaultWidthPercent: 8.0,
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
