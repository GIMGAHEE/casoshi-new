// ============================================================
// PixelParts V2 — 32 × 44 pixel sprite
// Full outlines + chibi proportions + visible hands/legs
// ============================================================
//
// Token legend:
//   .  transparent    _  outline (fixed dark)
//   1  skin           2  skin shadow
//   3  hair           4  hair shadow          5  hair highlight
//   e  eye dark       w  eye white
//   M  mouth          B  blush
//   6  outfit         7  outfit shadow
//   8  accent         9  accent shadow
//   W  trim white
//   L  leg skin       l  leg shadow
//   F  shoe           f  shoe shadow
//
// Layer order (bottom→top): base → outfit → mouth → eyes → hair → accessory
// ============================================================

import { shade } from '../utils/color';

export const SPRITE_W = 32;
export const SPRITE_H = 44;

const OUTLINE     = '#2B1C2E';
const EYE_DARK    = '#3B2530';
const EYE_WHITE   = '#FFFFFF';
const MOUTH_COLOR = '#D94E7F';
const BLUSH_COLOR = '#FFB5C5';
const TRIM_WHITE  = '#FFFFFF';
const SHOE_COLOR  = '#5B4A3F';
const SHOE_SHADOW = '#3A2E26';

export const SKIN_COLORS = [
  { id: 'fair',   hex: '#FFE0C2', label: '밝음' },
  { id: 'medium', hex: '#F5C896', label: '보통' },
  { id: 'tan',    hex: '#D89B6A', label: '탠' },
];

export const HAIR_COLORS = [
  { id: 'pink',   hex: '#FF6B9D', label: 'ピンク' },
  { id: 'blonde', hex: '#FFD166', label: 'ブロンド' },
  { id: 'brown',  hex: '#8B5A2B', label: 'ブラウン' },
  { id: 'black',  hex: '#3A2C3E', label: 'ブラック' },
  { id: 'blue',   hex: '#7BB7F0', label: 'ブルー' },
  { id: 'purple', hex: '#B47AEA', label: 'パープル' },
];

export const OUTFIT_COLORS = [
  { id: 'pink',   hex: '#FF6B9D', label: 'ピンク' },
  { id: 'blue',   hex: '#A5D8FF', label: 'ブルー' },
  { id: 'yellow', hex: '#FFD166', label: 'イエロー' },
  { id: 'purple', hex: '#B47AEA', label: 'パープル' },
  { id: 'mint',   hex: '#98E4C8', label: 'ミント' },
  { id: 'red',    hex: '#E24B4A', label: 'レッド' },
];

export const ACCENT_COLORS = [
  { id: 'pink',  hex: '#FF4785', label: 'ピンク' },
  { id: 'red',   hex: '#E24B4A', label: 'レッド' },
  { id: 'gold',  hex: '#FFB400', label: 'ゴールド' },
  { id: 'white', hex: '#FFFFFF', label: 'ホワイト' },
];

// ============================================================
// Helpers
// ============================================================
function cen(content) {
  const pad = (SPRITE_W - content.length) / 2;
  if (pad < 0 || pad !== Math.floor(pad)) {
    throw new Error(`cen: cannot center "${content}" (len ${content.length})`);
  }
  return '.'.repeat(pad) + content + '.'.repeat(pad);
}

function at(col, content) {
  if (col + content.length > SPRITE_W) {
    throw new Error(`at: ${col}+${content.length} exceeds ${SPRITE_W}`);
  }
  return '.'.repeat(col) + content + '.'.repeat(SPRITE_W - col - content.length);
}

const blank = () => '.'.repeat(SPRITE_W);

function grid(rows) {
  if (rows.length !== SPRITE_H) {
    throw new Error(`grid: H=${rows.length} ≠ ${SPRITE_H}`);
  }
  rows.forEach((r, i) => {
    if (r.length !== SPRITE_W) {
      throw new Error(`grid: row ${i} W=${r.length} ≠ ${SPRITE_W}\n  "${r}"`);
    }
  });
  return rows;
}

// ============================================================
// BASE_BODY — head + hands + bare legs + shoes
// ============================================================
export const BASE_BODY = grid([
  blank(),                                        // 0
  blank(),                                        // 1
  blank(),                                        // 2
  cen('__________'),                              // 3  head top cap 10w
  cen('_111111111111_'),                          // 4  14w
  cen('_11111111111111_'),                        // 5  16w
  cen('_1111111111111111_'),                      // 6  18w
  cen('_111111111111111111_'),                    // 7  20w face top
  cen('_111111111111111111_'),                    // 8
  cen('_111111111111111111_'),                    // 9
  cen('_111111111111111111_'),                    // 10
  cen('_111111111111111111_'),                    // 11 eye row
  cen('_111111111111111111_'),                    // 12 eye row
  cen('_111111111111111111_'),                    // 13 eye row
  cen('_111111111111111111_'),                    // 14 blush row
  cen('_111111111111111111_'),                    // 15 mouth row
  cen('_111111111111111111_'),                    // 16 mouth row
  cen('_1111111111111111_'),                      // 17 chin narrow 18w
  cen('_11111111111111_'),                        // 18 16w
  cen('_1111111111_'),                            // 19 12w
  cen('_111111_'),                                // 20 8w
  cen('_1111_'),                                  // 21 neck 6w
  cen('_1111_'),                                  // 22 neck 6w
  blank(),                                        // 23 (outfit)
  blank(),                                        // 24
  blank(),                                        // 25
  blank(),                                        // 26
  blank(),                                        // 27
  cen('_11_................_11_'),                // 28 hands peek 24w
  cen('_11_................_11_'),                // 29
  cen('_11_................_11_'),                // 30
  blank(),                                        // 31
  blank(),                                        // 32
  blank(),                                        // 33
  blank(),                                        // 34
  blank(),                                        // 35
  blank(),                                        // 36
  cen('_LLLL_...._LLLL_'),                        // 37 legs 16w
  cen('_LLLl_...._LLLl_'),                        // 38
  cen('_LLLl_...._LLLl_'),                        // 39
  cen('_LLLl_...._LLLl_'),                        // 40
  cen('_FFFFFF_...._FFFFFF_'),                    // 41 shoes 20w
  cen('_ffffff_...._ffffff_'),                    // 42
  blank(),                                        // 43
]);

// ============================================================
// HAIR — shared top + style-specific bottom
// ============================================================
const HAIR_TOP = [
  blank(),                                        // 0
  blank(),                                        // 1
  cen('____'),                                    // 2  tuft 4w
  cen('________'),                                // 3  8w
  cen('____________'),                            // 4  12w cap
  cen('_333333333333_'),                          // 5  14w
  cen('_33333333333334_'),                        // 6  16w (w/ shadow)
  cen('_3333333333333334_'),                      // 7  18w
  cen('_333353333335333334_'),                    // 8  20w w/ highlight specks
  cen('_333333333333333334_'),                    // 9  20w bangs
];

export const HAIR_PARTS = [
  {
    id: 'hair_twintails',
    name: 'ツインテール',
    grid: grid([
      ...HAIR_TOP,                                // 0-9
      cen('_333..............333_'),              // 10 bangs retract 22w
      cen('_333..............333_'),              // 11
      cen('_333..............333_'),              // 12
      cen('_333..............333_'),              // 13
      cen('_333..............333_'),              // 14
      cen('_333..............333_'),              // 15
      cen('_333..............333_'),              // 16
      cen('_333..............334_'),              // 17 shadow hint
      cen('_333..............334_'),              // 18
      cen('_333..............334_'),              // 19
      cen('_333..............334_'),              // 20
      cen('_333..............334_'),              // 21 (neck level)
      cen('_333..............334_'),              // 22
      cen('_333..............334_'),              // 23 over shoulders
      cen('_333..............334_'),              // 24
      cen('_33..............34_'),                // 25 taper 20w
      cen('_3..............4_'),                  // 26 taper 18w
      cen('__..............__'),                  // 27 close caps 18w
      blank(),                                    // 28
      blank(),                                    // 29
      blank(),                                    // 30
      blank(),                                    // 31
      blank(),                                    // 32
      blank(),                                    // 33
      blank(),                                    // 34
      blank(),                                    // 35
      blank(),                                    // 36
      blank(),                                    // 37
      blank(),                                    // 38
      blank(),                                    // 39
      blank(),                                    // 40
      blank(),                                    // 41
      blank(),                                    // 42
      blank(),                                    // 43
    ]),
  },
  {
    id: 'hair_bob',
    name: 'ボブ',
    grid: grid([
      ...HAIR_TOP,                                // 0-9
      cen('_333..............333_'),              // 10 bangs retract
      cen('_33..............34_'),                // 11 sides narrow
      cen('_33..............34_'),                // 12
      cen('_33..............34_'),                // 13
      cen('_33..............34_'),                // 14
      cen('_33..............34_'),                // 15
      cen('_3..............4_'),                  // 16 taper
      cen('__..............__'),                  // 17 end caps
      blank(),                                    // 18
      blank(),                                    // 19
      blank(),                                    // 20
      blank(),                                    // 21
      blank(),                                    // 22
      blank(),                                    // 23
      blank(),                                    // 24
      blank(),                                    // 25
      blank(),                                    // 26
      blank(),                                    // 27
      blank(),                                    // 28
      blank(),                                    // 29
      blank(),                                    // 30
      blank(),                                    // 31
      blank(),                                    // 32
      blank(),                                    // 33
      blank(),                                    // 34
      blank(),                                    // 35
      blank(),                                    // 36
      blank(),                                    // 37
      blank(),                                    // 38
      blank(),                                    // 39
      blank(),                                    // 40
      blank(),                                    // 41
      blank(),                                    // 42
      blank(),                                    // 43
    ]),
  },
  {
    id: 'hair_long',
    name: 'ロング',
    grid: grid([
      ...HAIR_TOP,                                // 0-9
      cen('_333..............333_'),              // 10
      cen('_33..............34_'),                // 11 straight down
      cen('_33..............34_'),                // 12
      cen('_33..............34_'),                // 13
      cen('_33..............34_'),                // 14
      cen('_33..............34_'),                // 15
      cen('_33..............34_'),                // 16
      cen('_33..............34_'),                // 17
      cen('_33..............34_'),                // 18
      cen('_33..............34_'),                // 19
      cen('_33..............34_'),                // 20
      cen('_33..............34_'),                // 21
      cen('_33..............34_'),                // 22
      cen('_33..............34_'),                // 23
      cen('_33..............34_'),                // 24
      cen('_33..............34_'),                // 25
      cen('_33..............34_'),                // 26
      cen('_33..............34_'),                // 27
      cen('_33..............34_'),                // 28
      cen('_3..............4_'),                  // 29 taper
      cen('__..............__'),                  // 30 close caps
      blank(),                                    // 31
      blank(),                                    // 32
      blank(),                                    // 33
      blank(),                                    // 34
      blank(),                                    // 35
      blank(),                                    // 36
      blank(),                                    // 37
      blank(),                                    // 38
      blank(),                                    // 39
      blank(),                                    // 40
      blank(),                                    // 41
      blank(),                                    // 42
      blank(),                                    // 43
    ]),
  },
];

// ============================================================
// EYES — 4 wide × 3 tall with white highlight
// Positioned at cols 10-13 (left) and 18-21 (right)
// ============================================================
export const EYE_PARTS = [
  {
    id: 'eyes_round',
    name: '○まる',
    grid: grid([
      ...Array(11).fill(blank()),                 // 0-10
      cen('eeee....eeee'),                        // 11 top
      cen('ewwe....ewwe'),                        // 12 middle (highlight)
      cen('eeee....eeee'),                        // 13 bottom
      ...Array(30).fill(blank()),                 // 14-43
    ]),
  },
  {
    id: 'eyes_wink',
    name: 'ウィンク',
    grid: grid([
      ...Array(11).fill(blank()),                 // 0-10
      at(18, 'eeee'),                             // 11 right eye top
      cen('eeee....ewwe'),                        // 12 left wink + right mid
      at(18, 'eeee'),                             // 13 right eye bottom
      ...Array(30).fill(blank()),                 // 14-43
    ]),
  },
  {
    id: 'eyes_jitome',
    name: 'ジト目',
    grid: grid([
      ...Array(12).fill(blank()),                 // 0-11
      cen('eeee....eeee'),                        // 12 thin line
      ...Array(31).fill(blank()),                 // 13-43
    ]),
  },
];

// ============================================================
// MOUTHS — each includes blush
// ============================================================
export const MOUTH_PARTS = [
  {
    id: 'mouth_smile',
    name: 'にっこり',
    grid: grid([
      ...Array(14).fill(blank()),                 // 0-13
      cen('BB..............BB'),                  // 14 blush 18w
      cen('M..M'),                                // 15 smile corners
      cen('MM'),                                  // 16 smile middle
      ...Array(27).fill(blank()),                 // 17-43
    ]),
  },
  {
    id: 'mouth_open',
    name: 'あーん',
    grid: grid([
      ...Array(14).fill(blank()),                 // 0-13
      cen('BB..............BB'),                  // 14 blush
      cen('eMMe'),                                // 15 open mouth top
      cen('eMMe'),                                // 16 open mouth bottom
      ...Array(27).fill(blank()),                 // 17-43
    ]),
  },
  {
    id: 'mouth_smirk',
    name: 'ちいさく',
    grid: grid([
      ...Array(14).fill(blank()),                 // 0-13
      cen('BB..............BB'),                  // 14 blush
      cen('MMMM'),                                // 15 flat line
      ...Array(28).fill(blank()),                 // 16-43
    ]),
  },
];

// ============================================================
// OUTFITS
// ============================================================
export const OUTFIT_PARTS = [
  {
    id: 'outfit_dress',
    name: 'ワンピース',
    grid: grid([
      ...Array(22).fill(blank()),                 // 0-21
      cen('_66666666666666_'),                    // 22 collar 16w
      cen('_66666666666666666666_'),              // 23 shoulders 22w
      cen('_6666666666666666666666_'),            // 24 puff sleeves 24w
      cen('_76666666666666666667_'),              // 25 shoulders w/shadow 22w
      cen('_666666666666666666_'),                // 26 20w
      cen('_6666666666666666_'),                  // 27 torso 18w
      cen('_66666666666666_'),                    // 28 16w (hands visible sides)
      cen('_66666666666666_'),                    // 29 16w
      cen('_88888888888888_'),                    // 30 belt accent 16w
      cen('_666666666666666666_'),                // 31 skirt flares 20w
      cen('_66666666666666666666_'),              // 32 22w
      cen('_6666666666666666666666_'),            // 33 24w
      cen('_666666666666666666666666_'),          // 34 widest 26w
      cen('_66666666666666666666_'),              // 35 hem 22w
      blank(),                                    // 36
      blank(),                                    // 37
      blank(),                                    // 38
      blank(),                                    // 39
      blank(),                                    // 40
      blank(),                                    // 41
      blank(),                                    // 42
      blank(),                                    // 43
    ]),
  },
  {
    id: 'outfit_hoodie',
    name: 'パーカー',
    grid: grid([
      ...Array(19).fill(blank()),                 // 0-18
      cen('_7777777777_'),                        // 19 hood back 12w
      cen('_777777777777777777_'),                // 20 hood 20w
      cen('_77777777777777777777_'),              // 21 hood 22w
      cen('_66666666666666_'),                    // 22 neck 16w
      cen('_66666666666666666666_'),              // 23 shoulders 22w
      cen('_66666666666666666666_'),              // 24
      cen('_66666666666666666666_'),              // 25
      cen('_66666666666666666666_'),              // 26
      cen('_66666666666666666666_'),              // 27
      cen('_66666666666666666666_'),              // 28
      cen('_66666666666666666666_'),              // 29
      cen('_66666666666666666666_'),              // 30
      cen('_66666666666666666666_'),              // 31
      cen('_666666666666666666_'),                // 32 hem 20w
      cen('_6666666666666666_'),                  // 33 18w
      blank(),                                    // 34
      blank(),                                    // 35
      blank(),                                    // 36
      blank(),                                    // 37
      blank(),                                    // 38
      blank(),                                    // 39
      blank(),                                    // 40
      blank(),                                    // 41
      blank(),                                    // 42
      blank(),                                    // 43
    ]),
  },
  {
    id: 'outfit_sailor',
    name: 'セーラー',
    grid: grid([
      ...Array(22).fill(blank()),                 // 0-21
      cen('_66666666666666_'),                    // 22 neck 16w
      cen('_6WWWWWWWWWWWW6_'),                    // 23 sailor collar 16w
      cen('_66WWWWWWWWWWWWWW66_'),                // 24 collar spread 20w
      cen('_666WWWWWWWWWWWW666_'),                // 25 V-neck narrow 20w
      cen('_6666666666666666_'),                  // 26 torso 18w
      cen('_66666666666666_'),                    // 27 16w
      cen('_888888888888_'),                      // 28 ribbon accent 14w
      cen('_66666666666666_'),                    // 29 16w
      cen('_88888888888888888888_'),              // 30 skirt waistband 22w
      cen('_88888888888888888888_'),              // 31
      cen('_8888888888888888888888_'),            // 32 pleated skirt 24w
      cen('_8888888888888888888888_'),            // 33
      cen('_888888888888888888888888_'),          // 34 widest 26w
      cen('_88888888888888888888_'),              // 35 hem 22w
      blank(),                                    // 36
      blank(),                                    // 37
      blank(),                                    // 38
      blank(),                                    // 39
      blank(),                                    // 40
      blank(),                                    // 41
      blank(),                                    // 42
      blank(),                                    // 43
    ]),
  },
];

// ============================================================
// ACCESSORIES
// ============================================================
export const ACCESSORY_PARTS = [
  {
    id: 'acc_none',
    name: 'なし',
    grid: grid(Array(SPRITE_H).fill(blank())),
  },
  {
    id: 'acc_ribbon',
    name: 'リボン',
    grid: grid([
      blank(),                                    // 0
      blank(),                                    // 1
      blank(),                                    // 2
      cen('_88__88_'),                            // 3 ribbon loops 8w
      cen('88998899'),                            // 4 bow center 8w
      cen('_8_88_8_'),                            // 5 bottom 8w
      ...Array(38).fill(blank()),                 // 6-43
    ]),
  },
  {
    id: 'acc_catears',
    name: 'ねこみみ',
    grid: grid([
      blank(),                                    // 0
      at(8, '_3_') + at(21, '_3_') === undefined
        ? blank()
        : '........_3_.........._3_........',    // 1 ear tips (hand-written)
      '......._333_........_333_.......',        // 2 ear mid
      '......_33833_......_33833_......',        // 3 ear base (inner pink)
      ...Array(40).fill(blank()),                 // 4-43
    ]),
  },
  {
    id: 'acc_halo',
    name: 'てんし',
    grid: grid([
      cen('_888888888888_'),                      // 0 halo top 14w
      cen('_8__________8_'),                      // 1 halo ring (hollow) 14w
      cen('_888888888888_'),                      // 2 halo bottom 14w
      ...Array(41).fill(blank()),                 // 3-43
    ]),
  },
];

// ============================================================
// Palette + compositor
// ============================================================
export function buildPalette(colors) {
  return {
    '1': colors.skin,
    '2': shade(colors.skin, -0.15),
    '3': colors.hair,
    '4': shade(colors.hair, -0.3),
    '5': shade(colors.hair, 0.25),
    'e': EYE_DARK,
    'w': EYE_WHITE,
    'M': MOUTH_COLOR,
    'B': BLUSH_COLOR,
    '6': colors.outfit,
    '7': shade(colors.outfit, -0.25),
    '8': colors.accent,
    '9': shade(colors.accent, -0.3),
    'W': TRIM_WHITE,
    'L': colors.skin,
    'l': shade(colors.skin, -0.15),
    'F': SHOE_COLOR,
    'f': SHOE_SHADOW,
    '_': OUTLINE,
  };
}

export const findPart = (registry, id) =>
  registry.find(p => p.id === id) || registry[0];

export function composeLayers(selections) {
  const layers = [
    BASE_BODY,
    findPart(OUTFIT_PARTS, selections.parts.outfit).grid,
    findPart(MOUTH_PARTS, selections.parts.mouth).grid,
    findPart(EYE_PARTS, selections.parts.eyes).grid,
    findPart(HAIR_PARTS, selections.parts.hair).grid,
    findPart(ACCESSORY_PARTS, selections.parts.accessory).grid,
  ];

  return Array.from({ length: SPRITE_H }, (_, y) => {
    let row = '';
    for (let x = 0; x < SPRITE_W; x++) {
      let ch = '.';
      for (const layer of layers) {
        const c = layer[y][x];
        if (c !== '.') ch = c;
      }
      row += ch;
    }
    return row;
  });
}

export const DEFAULT_PIXEL_SELECTIONS = {
  parts: {
    hair: 'hair_twintails',
    eyes: 'eyes_round',
    mouth: 'mouth_smile',
    outfit: 'outfit_dress',
    accessory: 'acc_ribbon',
  },
  colors: {
    skin: '#FFE0C2',
    hair: '#FF6B9D',
    outfit: '#A5D8FF',
    accent: '#FF4785',
  },
};
