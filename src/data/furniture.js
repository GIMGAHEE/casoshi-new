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
    id: 'bed_beige_check',
    label: 'ベージュチェック',
    image: '/furniture/bed_beige_check.png',
    category: 'bed',
    aspectRatio: 0.809,
    defaultWidthPercent: 15.0,
  },
  {
    id: 'bed_green',
    label: 'グリーン',
    image: '/furniture/bed_green.png',
    category: 'bed',
    aspectRatio: 0.843,
    defaultWidthPercent: 15.0,
  },
  {
    id: 'bed_pink_floral',
    label: 'ピンクフラワー',
    image: '/furniture/bed_pink_floral.png',
    category: 'bed',
    aspectRatio: 0.884,
    defaultWidthPercent: 16.0,
  },
  {
    id: 'bed_pink_stripe',
    label: 'ピンクストライプ',
    image: '/furniture/bed_pink_stripe.png',
    category: 'bed',
    aspectRatio: 0.829,
    defaultWidthPercent: 15.0,
  },
  {
    id: 'bed_purple',
    label: 'パープル',
    image: '/furniture/bed_purple.png',
    category: 'bed',
    aspectRatio: 0.777,
    defaultWidthPercent: 15.0,
  },
  {
    id: 'bed_cream',
    label: 'クリーム',
    image: '/furniture/bed_cream.png',
    category: 'bed',
    aspectRatio: 0.931,
    defaultWidthPercent: 16.0,
  },
  {
    id: 'bed_beige_soft',
    label: 'ベージュソフト',
    image: '/furniture/bed_beige_soft.png',
    category: 'bed',
    aspectRatio: 0.875,
    defaultWidthPercent: 16.0,
  },
  {
    id: 'bed_blue_heart',
    label: 'ブルーハート',
    image: '/furniture/bed_blue_heart.png',
    category: 'bed',
    aspectRatio: 0.808,
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
  {
    id: 'desk_laptop',
    label: 'デスク',
    image: '/furniture/desk_laptop.png',
    category: 'table',
    aspectRatio: 0.939,
    defaultWidthPercent: 18.0,
  },
  {
    id: 'bookshelf_heart',
    label: 'ブックシェルフ',
    image: '/furniture/bookshelf_heart.png',
    category: 'storage',
    aspectRatio: 0.566,
    defaultWidthPercent: 11.0,
  },
  {
    id: 'mirror_stand',
    label: 'すがたみ',
    image: '/furniture/mirror_stand.png',
    category: 'storage',
    aspectRatio: 0.531,
    defaultWidthPercent: 9.5,
  },
  {
    id: 'pegboard',
    label: 'ペグボード',
    image: '/furniture/pegboard.png',
    category: 'deco',
    aspectRatio: 0.764,
    defaultWidthPercent: 12.0,
  },
  {
    id: 'cabinet_tulip',
    label: 'キャビネット',
    image: '/furniture/cabinet_tulip.png',
    category: 'storage',
    aspectRatio: 0.684,
    defaultWidthPercent: 12.5,
  },
  {
    id: 'floor_lamp',
    label: 'フロアランプ',
    image: '/furniture/floor_lamp.png',
    category: 'deco',
    aspectRatio: 0.366,
    defaultWidthPercent: 5.5,
  },
  {
    id: 'stool_round',
    label: 'スツール',
    image: '/furniture/stool_round.png',
    category: 'table',
    aspectRatio: 0.575,
    defaultWidthPercent: 8.0,
  },
  {
    id: 'sofa_cream',
    label: 'クリームソファ',
    image: '/furniture/sofa_cream.png',
    category: 'seat',
    aspectRatio: 1.342,
    defaultWidthPercent: 19.0,
  },
  {
    id: 'shelf_cart',
    label: 'シェルフカート',
    image: '/furniture/shelf_cart.png',
    category: 'storage',
    aspectRatio: 0.950,
    defaultWidthPercent: 12.0,
  },
  {
    id: 'bench_storage',
    label: 'ベンチ',
    image: '/furniture/bench_storage.png',
    category: 'seat',
    aspectRatio: 1.232,
    defaultWidthPercent: 13.0,
  },
  {
    id: 'beanbag',
    label: 'ビーズクッション',
    image: '/furniture/beanbag.png',
    category: 'seat',
    aspectRatio: 1.036,
    defaultWidthPercent: 11.0,
  },
  {
    id: 'wall_shelf',
    label: 'ウォールシェルフ',
    image: '/furniture/wall_shelf.png',
    category: 'deco',
    aspectRatio: 1.535,
    defaultWidthPercent: 13.0,
  },
  {
    id: 'nightstand_clock',
    label: 'ナイトテーブル2',
    image: '/furniture/nightstand_clock.png',
    category: 'table',
    aspectRatio: 0.583,
    defaultWidthPercent: 9.0,
  },
  {
    id: 'shelf_small',
    label: 'シェルフ',
    image: '/furniture/shelf_small.png',
    category: 'storage',
    aspectRatio: 0.701,
    defaultWidthPercent: 10.5,
  },
  {
    id: 'pet_house',
    label: 'ペットハウス',
    image: '/furniture/pet_house.png',
    category: 'deco',
    aspectRatio: 0.857,
    defaultWidthPercent: 11.0,
  },
  {
    id: 'corkboard',
    label: 'コルクボード',
    image: '/furniture/corkboard.png',
    category: 'deco',
    aspectRatio: 1.132,
    defaultWidthPercent: 12.0,
  },
  {
    id: 'plant_medium',
    label: '植物',
    image: '/furniture/plant_medium.png',
    category: 'deco',
    aspectRatio: 0.541,
    defaultWidthPercent: 6.5,
  },
  {
    id: 'tv_radio_stand',
    label: 'ラジオ台',
    image: '/furniture/tv_radio_stand.png',
    category: 'table',
    aspectRatio: 1.366,
    defaultWidthPercent: 14.5,
  },
  {
    id: 'carpet_heart_oval',
    label: 'ハートマット2',
    image: '/furniture/carpet_heart_oval.png',
    category: 'deco',
    aspectRatio: 1.402,
    defaultWidthPercent: 25.0,
  },
  {
    id: 'plant_monstera',
    label: 'モンステラ',
    image: '/furniture/plant_monstera.png',
    category: 'deco',
    aspectRatio: 0.748,
    defaultWidthPercent: 11.0,
  },
  {
    id: 'plant_palm',
    label: 'パーム',
    image: '/furniture/plant_palm.png',
    category: 'deco',
    aspectRatio: 0.658,
    defaultWidthPercent: 10.0,
  },
  {
    id: 'plant_tree',
    label: 'ツリー',
    image: '/furniture/plant_tree.png',
    category: 'deco',
    aspectRatio: 0.672,
    defaultWidthPercent: 10.0,
  },
  {
    id: 'plant_sansevieria',
    label: 'サンスベリア',
    image: '/furniture/plant_sansevieria.png',
    category: 'deco',
    aspectRatio: 0.439,
    defaultWidthPercent: 6.5,
  },
  {
    id: 'plant_rubber',
    label: 'ゴムの木',
    image: '/furniture/plant_rubber.png',
    category: 'deco',
    aspectRatio: 0.581,
    defaultWidthPercent: 8.5,
  },
  {
    id: 'plant_ivy',
    label: 'アイビー',
    image: '/furniture/plant_ivy.png',
    category: 'deco',
    aspectRatio: 0.834,
    defaultWidthPercent: 11.0,
  },
  {
    id: 'plant_lavender',
    label: 'ラベンダー',
    image: '/furniture/plant_lavender.png',
    category: 'deco',
    aspectRatio: 0.591,
    defaultWidthPercent: 8.5,
  },
  {
    id: 'plant_lemon',
    label: 'レモンの木',
    image: '/furniture/plant_lemon.png',
    category: 'deco',
    aspectRatio: 0.660,
    defaultWidthPercent: 9.5,
  },
];

export const findFurniture = (id) =>
  FURNITURE_CATALOG.find(f => f.id === id);

// ===== 가구 해금 시스템 =====
// 카테고리 내 순서대로 첫 2개는 Lv.1, 3번째부터 매 레벨마다 +1개씩 해금.
// 예) seat 카테고리에 가구가 6개 있으면:
//   index 0,1 -> Lv.1 / index 2 -> Lv.2 / index 3 -> Lv.3 / ...
const FREE_COUNT_PER_CATEGORY = 2;

// 카테고리별 가구 순서 인덱스를 캐시
const _categoryIndexCache = (() => {
  const map = {};
  const counters = {};
  for (const f of FURNITURE_CATALOG) {
    counters[f.category] = counters[f.category] ?? 0;
    map[f.id] = counters[f.category];
    counters[f.category]++;
  }
  return map;
})();

// 특정 가구의 해금 레벨
export const getFurnitureUnlockLevel = (furnitureId) => {
  const idx = _categoryIndexCache[furnitureId] ?? 0;
  if (idx < FREE_COUNT_PER_CATEGORY) return 1;
  return idx - FREE_COUNT_PER_CATEGORY + 2; // 2번째 index → Lv.2, 3번째 → Lv.3
};

// 현재 레벨에서 사용 가능한지
export const isFurnitureUnlocked = (furnitureId, level) =>
  getFurnitureUnlockLevel(furnitureId) <= level;

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
