// キャスオシ 시드 캐릭터 5명
// Phase 1: GH(제작자) 세팅. Phase 2 대비해서 creatorId 구조 유지

export const SEED_CHARACTERS = [
  {
    id: 'himari',
    creatorId: 'seed_gh',
    name: 'ひまり',
    nameRomaji: 'Himari',
    type: '太陽系',
    typeLabel: '밝은',
    emoji: '🌻',
    themeColor: '#FFD166',
    bgColor: '#FFF4D6',
    sprite: '/sprites/himari.png',
    catchphrase: 'みんなの元気、ぜんぶ吸収しちゃう！',
    bio: 'いつも笑顔を絶やさない太陽みたいな子。推されると光ります。',
    dialogues: [
      { unlockLevel: 1, text: 'はじめまして！応援ありがとっ！♪' },
      { unlockLevel: 2, text: 'えへへ、キミのこと覚えちゃった！' },
      { unlockLevel: 3, text: '今日もキミに会えて、ひまりは幸せだよー！' },
      { unlockLevel: 5, text: 'キミの応援が、ひまりの太陽みたいなんだ☀️' },
      { unlockLevel: 10, text: 'ずっと、ずっと、キミのひまり先輩でいさせてね！' },
    ],
  },
  {
    id: 'yuki',
    creatorId: 'seed_gh',
    name: 'ゆき',
    nameRomaji: 'Yuki',
    type: '清楚系',
    typeLabel: '청순',
    emoji: '❄️',
    themeColor: '#A5D8FF',
    bgColor: '#E7F5FF',
    sprite: '/sprites/yuki.png',
    catchphrase: 'そっと、側にいさせてください。',
    bio: '物静かで優しい雪の妖精。声をかけると少しだけ微笑みます。',
    dialogues: [
      { unlockLevel: 1, text: '…こんにちは。見つけてくれて、ありがとう。' },
      { unlockLevel: 2, text: '…あの、もう少しだけ、居てもいい？' },
      { unlockLevel: 3, text: '雪が降る音、聞こえますか…？ふふっ。' },
      { unlockLevel: 5, text: 'あなたの応援、全部、心に積もっていきます。' },
      { unlockLevel: 10, text: '……もう、離れないでね？ずっと、一緒に。' },
    ],
  },
  {
    id: 'rei',
    creatorId: 'seed_gh',
    name: 'れい',
    nameRomaji: 'Rei',
    type: 'クール系',
    typeLabel: '쿨',
    emoji: '🌙',
    themeColor: '#9B8AFB',
    bgColor: '#EDE9FE',
    sprite: '/sprites/rei.png',
    catchphrase: '…別に、嬉しくなんかないけど。',
    bio: 'ツンとした態度の裏に、実はファン想いの一面が。',
    dialogues: [
      { unlockLevel: 1, text: '……。( じっと見てる )' },
      { unlockLevel: 2, text: 'ふーん、まだいるんだ。…別に嬉しくないし。' },
      { unlockLevel: 3, text: 'ま、まあ、応援してくれるなら、勝手にしたら？' },
      { unlockLevel: 5, text: '…今日の応援、ちゃんと数えてたからね。バカ。' },
      { unlockLevel: 10, text: 'これ以上は…言わないけど。…ありがと。本当に。' },
    ],
  },
  {
    id: 'akane',
    creatorId: 'seed_gh',
    name: 'あかね',
    nameRomaji: 'Akane',
    type: 'ボーイッシュ系',
    typeLabel: '보이시',
    emoji: '🔥',
    themeColor: '#FF8A65',
    bgColor: '#FFE3D6',
    sprite: '/sprites/akane.png',
    catchphrase: 'よっしゃ、今日も全力で行くぞ！',
    bio: '元気100倍、勝負ごとが大好き。推しカツも真剣勝負です。',
    dialogues: [
      { unlockLevel: 1, text: 'おーっす！相棒になるか？！' },
      { unlockLevel: 2, text: 'お前、ガッツあるじゃん！気に入ったぜ！' },
      { unlockLevel: 3, text: 'よっしゃ、今日はもっと燃えるぞ！ついてこい！' },
      { unlockLevel: 5, text: 'お前の応援、マジで効くわ。エネルギー補給ありがとな！' },
      { unlockLevel: 10, text: '一生、一緒に走ろうぜ！約束だ！' },
    ],
  },
  {
    id: 'mio',
    creatorId: 'seed_gh',
    name: 'みお',
    nameRomaji: 'Mio',
    type: 'ミステリアス系',
    typeLabel: '미스테리어스',
    emoji: '🔮',
    themeColor: '#B47AEA',
    bgColor: '#F3E8FF',
    sprite: '/sprites/mio.png',
    catchphrase: 'あなたの運命、視えてしまった。',
    bio: '不思議な雰囲気の占い好き。推しの数値で占いの精度が上がるとか。',
    dialogues: [
      { unlockLevel: 1, text: 'あら…貴方、面白い星の下に生まれたのね。' },
      { unlockLevel: 2, text: '水晶に…貴方の顔が映っているわ。ふふ。' },
      { unlockLevel: 3, text: '今夜の占い、貴方にだけ教えてあげましょうか？' },
      { unlockLevel: 5, text: '運命の糸が、私と貴方を結んでいるのが視えたの。' },
      { unlockLevel: 10, text: 'ねえ…この先の未来、一緒に視に行かない？' },
    ],
  },
];

// 레벨 계산: 응원 포인트 100당 1레벨
export const calcLevel = (supportPoints) => Math.floor(supportPoints / 100) + 1;
export const calcExp = (supportPoints) => supportPoints % 100;

// 현재 해금된 대사들 (현재 레벨 이하 전부)
export const getUnlockedDialogues = (character, supportPoints) => {
  const level = calcLevel(supportPoints);
  return character.dialogues.filter(d => d.unlockLevel <= level);
};

// 특정 레벨에서 "새로" 해금되는 대사 (레벨업 직후 연출용)
export const getDialogueForLevel = (character, level) => {
  return character.dialogues.find(d => d.unlockLevel === level) || null;
};

// ============================================================
// MyOshi (유저가 만든 캐릭터)
// ============================================================

export const MY_OSHI_ID = 'my_oshi';

// MyOshi 프리셋 — gender 필드로 남/녀 분류
// body는 대머리 상태, 헤어는 반드시 HAIRSTYLES에서 선택해서 overlay로 표시
// hairBaked: true면 sprite에 헤어가 이미 그려져 있어서 overlay를 스킵함
// previewScale: basic(1024×1536) 기준 동일 시각 크기를 위한 배율.
//               basic_bob(447×854)처럼 타이트하게 크롭된 건 작게 렌더해야 함.
export const MY_OSHI_PRESETS = [
  // ===== 女の子 (girl) =====
  {
    id: 'preset_bob',
    gender: 'girl',
    sprite: '/sprites/basic_bob.png',
    label: 'ショート',
    themeColor: '#FF6B9D',
    bgColor: '#FFE5EC',
    hairBaked: true,
    previewScale: 0.44,
  },
  {
    id: 'preset_basic',
    gender: 'girl',
    sprite: '/sprites/basic.png',
    label: 'きほん',
    themeColor: '#FF6B9D',
    bgColor: '#FFE5EC',
    previewScale: 1.0,
  },
  // ===== 男の子 (boy) =====
  {
    id: 'preset_boy_brown',
    gender: 'boy',
    sprite: '/sprites/basic_boy_brown.png',
    label: 'ブラウン',
    themeColor: '#5BA4E0',
    bgColor: '#E5F0FB',
    hairBaked: true,
    previewScale: 0.48,  // 489/1024 ≈ 0.48
  },
  {
    id: 'preset_boy_basic',
    gender: 'boy',
    sprite: '/sprites/basic_boy.png',
    label: 'きほん',
    themeColor: '#5BA4E0',
    bgColor: '#E5F0FB',
    previewScale: 1.0,
  },
];

export const DEFAULT_PRESET_ID = 'preset_bob';
export const DEFAULT_GENDER = 'girl';

// 헤어 목록 — gender 필드로 남/녀 구분
// defaultTransform: 기본 anchor 위에 런타임 CSS transform으로 적용
export const HAIRSTYLES = [
  // ===== 女の子 (girl) =====
  { id: 'hair_bob_short',     gender: 'girl', label: 'ショート',   overlay: '/sprites/hair_bob_short.png',     defaultTransform: { x: 0, y: -18, scale: 0.74 } },
  { id: 'hair_medium',        gender: 'girl', label: 'ミディアム', overlay: '/sprites/hair_medium.png',        defaultTransform: { x: 0, y: -10, scale: 0.80 } },
  { id: 'hair_long_straight', gender: 'girl', label: 'ロング',     overlay: '/sprites/hair_long_straight.png', defaultTransform: { x: 0, y:  -7, scale: 0.84 } },
  { id: 'hair_long_wavy',     gender: 'girl', label: 'ウェーブ',   overlay: '/sprites/hair_long_wavy.png',     defaultTransform: { x: 0, y:  -2, scale: 0.90 } },
  { id: 'hair_twintails',     gender: 'girl', label: 'ツインテ',   overlay: '/sprites/hair_twintails.png',     defaultTransform: { x: 0, y: -11, scale: 0.81 } },
  { id: 'hair_bun',           gender: 'girl', label: 'お団子',     overlay: '/sprites/hair_bun.png',           defaultTransform: { x: 0, y: -13, scale: 0.81 } },
  { id: 'hair_long_full',     gender: 'girl', label: 'ロング',     overlay: '/sprites/hair_long_full.png',     defaultTransform: { x: 2, y:  -7, scale: 0.78 } },
  { id: 'hair_long_bangs',    gender: 'girl', label: 'ロングバング', overlay: '/sprites/hair_long_bangs.png',    defaultTransform: { x: 3, y: -10, scale: 0.74 } },
  { id: 'hair_medium_wavy',   gender: 'girl', label: 'ミディウェーブ', overlay: '/sprites/hair_medium_wavy.png',   defaultTransform: { x: 4, y:  -7, scale: 0.84 } },
  { id: 'hair_shoulder_wavy', gender: 'girl', label: 'セミロング', overlay: '/sprites/hair_shoulder_wavy.png', defaultTransform: { x: 2, y: -16, scale: 0.70 } },
  { id: 'hair_twin_bangs',    gender: 'girl', label: 'ツイン',     overlay: '/sprites/hair_twin_bangs.png',    defaultTransform: { x: 2, y:  -6, scale: 0.82 } },
  { id: 'hair_side_pony',     gender: 'girl', label: 'サイドまとめ', overlay: '/sprites/hair_side_pony.png',     defaultTransform: { x: 5, y: -13, scale: 0.70 } },
  { id: 'hair_half_braid',    gender: 'girl', label: 'ハーフブレイド', overlay: '/sprites/hair_half_braid.png',    defaultTransform: { x: 2, y: -10, scale: 0.76 } },
  { id: 'hair_high_pony',     gender: 'girl', label: 'ハイポニー', overlay: '/sprites/hair_high_pony.png',     defaultTransform: { x: 8, y: -14, scale: 0.77 } },
  { id: 'hair_side_braid',    gender: 'girl', label: 'サイドブレイド', overlay: '/sprites/hair_side_braid.png',    defaultTransform: { x: 3, y: -14, scale: 0.64 } },
  { id: 'hair_twin_braids',   gender: 'girl', label: 'ツインブレイド', overlay: '/sprites/hair_twin_braids.png',   defaultTransform: { x: 2, y: -15, scale: 0.62 } },
  // ===== 男の子 (boy) =====
  { id: 'boy_hair_brown_wavy',       gender: 'boy', label: 'ブラウンウェーブ', overlay: '/sprites/boy_hair_brown_wavy.png',       defaultTransform: { x: 0, y: -21, scale: 0.62 } },
  { id: 'boy_hair_black_voluminous', gender: 'boy', label: 'ボリューム',       overlay: '/sprites/boy_hair_black_voluminous.png', defaultTransform: { x: 0, y: -20, scale: 0.63 } },
  { id: 'boy_hair_black_spiky',      gender: 'boy', label: 'スパイク',         overlay: '/sprites/boy_hair_black_spiky.png',      defaultTransform: { x: 0, y: -21, scale: 0.66 } },
  { id: 'boy_hair_blonde',           gender: 'boy', label: 'ブロンド',         overlay: '/sprites/boy_hair_blonde.png',           defaultTransform: { x: 0, y: -21, scale: 0.58 } },
  { id: 'boy_hair_brown_dark_bangs', gender: 'boy', label: '前髪ダーク',       overlay: '/sprites/boy_hair_brown_dark_bangs.png', defaultTransform: { x: 0, y: -21, scale: 0.68 } },
  { id: 'boy_hair_auburn_wavy',      gender: 'boy', label: 'オーバーン',       overlay: '/sprites/boy_hair_auburn_wavy.png',      defaultTransform: { x: 0, y: -21, scale: 0.62 } },
  { id: 'boy_hair_brown_fluffy',     gender: 'boy', label: 'ふんわり',         overlay: '/sprites/boy_hair_brown_fluffy.png',     defaultTransform: { x: 0, y: -21, scale: 0.62 } },
  { id: 'boy_hair_black_parted',     gender: 'boy', label: 'センター',         overlay: '/sprites/boy_hair_black_parted.png',     defaultTransform: { x: 0, y: -21, scale: 0.64 } },
  { id: 'boy_hair_black_short_spike',gender: 'boy', label: 'ショートスパイク', overlay: '/sprites/boy_hair_black_short_spike.png',defaultTransform: { x: 0, y: -22, scale: 0.66 } },
  { id: 'boy_hair_black_slick',      gender: 'boy', label: 'オールバック',     overlay: '/sprites/boy_hair_black_slick.png',      defaultTransform: { x: 0, y: -21, scale: 0.65 } },
  { id: 'boy_hair_brown_mid',        gender: 'boy', label: 'ブラウンミディ',   overlay: '/sprites/boy_hair_brown_mid.png',        defaultTransform: { x: 0, y: -22, scale: 0.67 } },
  { id: 'boy_hair_silver',           gender: 'boy', label: 'シルバー',         overlay: '/sprites/boy_hair_silver.png',           defaultTransform: { x: 0, y: -21, scale: 0.63 } },
  { id: 'boy_hair_platinum',         gender: 'boy', label: 'プラチナ',         overlay: '/sprites/boy_hair_platinum.png',         defaultTransform: { x: 0, y: -21, scale: 0.68 } },
  { id: 'boy_hair_black_full',       gender: 'boy', label: 'フル',             overlay: '/sprites/boy_hair_black_full.png',       defaultTransform: { x: 0, y: -20, scale: 0.70 } },
  { id: 'boy_hair_brown_messy',      gender: 'boy', label: 'メッシー',         overlay: '/sprites/boy_hair_brown_messy.png',      defaultTransform: { x: 0, y: -21, scale: 0.69 } },
  { id: 'boy_hair_black_upspike',    gender: 'boy', label: 'アップ',           overlay: '/sprites/boy_hair_black_upspike.png',    defaultTransform: { x: 0, y: -22, scale: 0.69 } },
];

export const DEFAULT_HAIRSTYLE_ID = 'hair_bob_short';
export const DEFAULT_HAIRSTYLE_BY_GENDER = {
  girl: 'hair_bob_short',
  boy: 'boy_hair_brown_wavy',
};

// hairOffset: 사용자가 슬라이더로 설정한 "0포인트 대비 오프셋"
// { x, y, scale: -30~+30 (percent-point) }
export const DEFAULT_HAIR_OFFSET = { x: 0, y: 0, scale: 0 };

// 실제 렌더링에 쓸 transform = 기본값 + 오프셋
// 구버전 저장 데이터(x 없음) 호환을 위해 o.x || 0 사용
export const computeHairTransform = (hairstyleId, offset) => {
  const hs = HAIRSTYLES.find(h => h.id === hairstyleId);
  const def = hs?.defaultTransform || { x: 0, y: 0, scale: 1 };
  const o = offset || DEFAULT_HAIR_OFFSET;
  return {
    x: def.x + (o.x || 0),
    y: def.y + (o.y || 0),
    scale: def.scale + (o.scale || 0) / 100,
  };
};

// 제네릭 대사 (유저 캐릭터용 - 이름 자리표시자 {name} 치환)
const GENERIC_DIALOGUES = [
  { unlockLevel: 1,  text: 'よろしくね！私は{name}だよ♪' },
  { unlockLevel: 2,  text: 'えへへ、また会えたね！' },
  { unlockLevel: 3,  text: 'あなたのおかげで、元気が出るよ！' },
  { unlockLevel: 5,  text: 'ずっと応援してくれて、本当にありがとう。' },
  { unlockLevel: 10, text: '私の一番の推し活仲間、それはあなただよ！' },
];

// myOshi(로컬스토리지 저장 데이터)를 표준 캐릭터 객체로 변환
// 신형: { name, presetId }
// 구형(마이그레이션): { name, parts, colors } — presetId 없으면 기본 프리셋 사용
export const asCharacter = (myOshi) => {
  if (!myOshi) return null;
  const preset =
    MY_OSHI_PRESETS.find(p => p.id === myOshi.presetId) ||
    MY_OSHI_PRESETS.find(p => p.id === DEFAULT_PRESET_ID);

  const hairstyle =
    HAIRSTYLES.find(h => h.id === myOshi.hairstyleId) ||
    HAIRSTYLES.find(h => h.id === DEFAULT_HAIRSTYLE_ID);

  return {
    id: MY_OSHI_ID,
    creatorId: 'user_self',
    name: myOshi.name,
    nameRomaji: '',
    type: 'マイ推し',
    typeLabel: '나의 추시',
    themeColor: preset.themeColor,
    bgColor: preset.bgColor,
    sprite: preset.sprite,
    // hairBaked preset(basic_bob.png)은 이미 content에 타이트하게 크롭되어 있어서
    // 동일한 시각 크기를 내려면 작은 size를 써야 함. 일반 preset은 기존 size=90 유지.
    spriteSize: preset.hairBaked ? 39 : 90,
    hairOverlay: preset.hairBaked ? null : hairstyle.overlay,
    hairTransform: preset.hairBaked ? null : computeHairTransform(myOshi.hairstyleId, myOshi.hairOffset),
    catchphrase: 'あなたが作った、あなただけの推し。',
    bio: `${myOshi.name}は、あなただけのために生まれた推しです。一緒に育てていこう！`,
    dialogues: GENERIC_DIALOGUES.map(d => ({
      ...d,
      text: d.text.replace('{name}', myOshi.name),
    })),
    isMyOshi: true,
    presetId: preset.id,
  };
};

// 전체 캐릭터 목록 (시드 + 있으면 마이 추시 + 등록된 라이버)
export const allCharacters = (myOshi, livers = []) => {
  const my = asCharacter(myOshi);
  const liverChars = livers.map(asLiverCharacter).filter(Boolean);
  return [
    ...(my ? [my] : []),
    ...liverChars,
    ...SEED_CHARACTERS,
  ];
};

export const findCharacter = (myOshi, id, livers = []) => {
  return allCharacters(myOshi, livers).find(c => c.id === id) || null;
};

// ============================================================
// 🎤 라이버 → Character 변환 (운영자가 등록한 라이버를 홈/랭킹/상세에 표시)
// ============================================================
export const asLiverCharacter = (liver) => {
  if (!liver) return null;
  const p = liver.profile || {};
  const gender = p.gender === 'boy' ? 'boy' : 'girl';
  return {
    id: liver.id,
    creatorId: liver.username,
    name: p.name,
    nameRomaji: '',
    type: 'ライバー',
    typeLabel: '라이버',
    emoji: gender === 'boy' ? '🎤' : '💖',
    themeColor: p.themeColor || '#FF6B9D',
    bgColor: p.bgColor || '#FFE5EC',
    sprite: p.imageUrl || null,
    catchphrase: p.streamSchedule
      ? `📅 ${p.streamSchedule}`
      : 'よろしくお願いします！',
    bio: p.bio || `${p.name}です、応援お願いします！`,
    dialogues: GENERIC_DIALOGUES.map(d => ({
      ...d,
      text: d.text.replace('{name}', p.name),
    })),
    // 라이버 고유 메타
    isLiver: true,
    liverId: liver.id,
    casLiveHandle: p.casLiveHandle || '',
    streamSchedule: p.streamSchedule || '',
    gender,
  };
};
