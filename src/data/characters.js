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

// 제네릭 대사 (유저 캐릭터용 - 이름 자리표시자 {name} 치환)
const GENERIC_DIALOGUES = [
  { unlockLevel: 1,  text: 'よろしくね！私は{name}だよ♪' },
  { unlockLevel: 2,  text: 'えへへ、また会えたね！' },
  { unlockLevel: 3,  text: 'あなたのおかげで、元気が出るよ！' },
  { unlockLevel: 5,  text: 'ずっと応援してくれて、本当にありがとう。' },
  { unlockLevel: 10, text: '私の一番の推し活仲間、それはあなただよ！' },
];

// myOshi(로컬스토리지 저장 데이터)를 표준 캐릭터 객체로 변환
export const asCharacter = (myOshi) => {
  if (!myOshi) return null;
  return {
    id: MY_OSHI_ID,
    creatorId: 'user_self',
    name: myOshi.name,
    nameRomaji: '',
    type: 'マイ推し',
    typeLabel: '나의 추시',
    themeColor: myOshi.colors.hair,     // 테마 컬러는 머리색 기준
    bgColor: myOshi.colors.outfit + '33', // 옷 컬러 + 투명도
    catchphrase: 'あなたが作った、あなただけの推し。',
    bio: `${myOshi.name}は、あなただけのために生まれた推しです。一緒に育てていこう！`,
    dialogues: GENERIC_DIALOGUES.map(d => ({
      ...d,
      text: d.text.replace('{name}', myOshi.name),
    })),
    // MyOshi 전용 필드 (렌더 시 AvatarSVG 사용 여부 판별용)
    isMyOshi: true,
    parts: myOshi.parts,
    colors: myOshi.colors,
  };
};

// 전체 캐릭터 목록 (시드 + 있으면 마이 추시)
export const allCharacters = (myOshi) => {
  const my = asCharacter(myOshi);
  return my ? [my, ...SEED_CHARACTERS] : SEED_CHARACTERS;
};

export const findCharacter = (myOshi, id) => {
  return allCharacters(myOshi).find(c => c.id === id) || null;
};
