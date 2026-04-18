import { shade } from '../utils/color';

// ============================================================
// 컬러 팔레트 (선택지)
// ============================================================

export const SKIN_COLORS = [
  { id: 'fair',   hex: '#FFE0C2', label: '페어' },
  { id: 'medium', hex: '#F5C896', label: '미디엄' },
  { id: 'tan',    hex: '#D89B6A', label: '탠' },
];

export const HAIR_COLORS = [
  { id: 'pink',   hex: '#FF6B9D', label: 'ピンク' },
  { id: 'blonde', hex: '#FFD166', label: 'ブロンド' },
  { id: 'brown',  hex: '#8B5A2B', label: 'ブラウン' },
  { id: 'black',  hex: '#2D1B2E', label: 'ブラック' },
  { id: 'blue',   hex: '#7BB7F0', label: 'ブルー' },
  { id: 'purple', hex: '#B47AEA', label: 'パープル' },
];

export const OUTFIT_COLORS = [
  { id: 'pink',   hex: '#FF6B9D', label: 'ピンク' },
  { id: 'blue',   hex: '#A5D8FF', label: 'ブルー' },
  { id: 'yellow', hex: '#FFD166', label: 'イエロー' },
  { id: 'purple', hex: '#B47AEA', label: 'パープル' },
  { id: 'mint',   hex: '#98E4C8', label: 'ミント' },
  { id: 'white',  hex: '#FFFFFF', label: 'ホワイト' },
];

export const ACCENT_COLORS = [
  { id: 'pink', hex: '#FF4785', label: 'ピンク' },
  { id: 'red',  hex: '#E24B4A', label: 'レッド' },
  { id: 'gold', hex: '#FFB400', label: 'ゴールド' },
  { id: 'white', hex: '#FFFFFF', label: 'ホワイト' },
];

// ============================================================
// 베이스 (항상 렌더됨: 얼굴 + 목 + 볼터치)
// ============================================================

export function renderBase({ skin }) {
  const skinShadow = shade(skin, -0.12);
  return (
    <g>
      {/* 목 */}
      <rect x="88" y="150" width="24" height="18" fill={skin} />
      {/* 얼굴 (둥근 챠비) */}
      <ellipse cx="100" cy="100" rx="58" ry="60" fill={skin} stroke={skinShadow} strokeWidth="2" />
      {/* 턱 하이라이트 살짝 */}
      <path d="M 60 110 Q 100 165 140 110" fill={shade(skin, 0.05)} opacity="0.4" />
      {/* 볼터치 */}
      <ellipse cx="70" cy="118" rx="9" ry="5" fill="#FFB5C5" opacity="0.65" />
      <ellipse cx="130" cy="118" rx="9" ry="5" fill="#FFB5C5" opacity="0.65" />
    </g>
  );
}

// ============================================================
// 헤어 (얼굴 위에 덮어씌움)
// ============================================================

export const HAIR_PARTS = [
  {
    id: 'hair_twintails',
    name: 'ツインテール',
    render: ({ hair }) => {
      const hShadow = shade(hair, -0.25);
      return (
        <g>
          {/* 뒤쪽 양갈래 */}
          <ellipse cx="38" cy="130" rx="22" ry="40" fill={hair} stroke={hShadow} strokeWidth="2" />
          <ellipse cx="162" cy="130" rx="22" ry="40" fill={hair} stroke={hShadow} strokeWidth="2" />
          <ellipse cx="32" cy="160" rx="14" ry="12" fill={hair} stroke={hShadow} strokeWidth="2" />
          <ellipse cx="168" cy="160" rx="14" ry="12" fill={hair} stroke={hShadow} strokeWidth="2" />
          {/* 정수리/옆 커버 */}
          <path d="M 42 80 Q 45 40 100 40 Q 155 40 158 80 Q 160 105 155 115 L 145 60 Q 130 55 115 65 Q 100 60 85 65 Q 70 55 55 60 L 45 115 Q 40 105 42 80 Z" fill={hair} stroke={hShadow} strokeWidth="2" />
          {/* 앞머리 뱅 */}
          <path d="M 48 78 Q 60 58 75 65 Q 90 52 100 60 Q 110 52 125 65 Q 140 58 152 78 Q 148 92 130 88 Q 115 92 100 82 Q 85 92 70 88 Q 52 92 48 78 Z" fill={hair} stroke={hShadow} strokeWidth="2" />
        </g>
      );
    },
  },
  {
    id: 'hair_bob',
    name: 'ボブ',
    render: ({ hair }) => {
      const hShadow = shade(hair, -0.25);
      return (
        <g>
          {/* 뒷머리 전체 (귀 높이까지) */}
          <path d="M 40 95 Q 40 40 100 38 Q 160 40 160 95 L 160 135 Q 155 150 140 148 L 140 115 Q 138 90 100 82 Q 62 90 60 115 L 60 148 Q 45 150 40 135 Z" fill={hair} stroke={hShadow} strokeWidth="2" />
          {/* 앞머리 */}
          <path d="M 45 75 Q 65 50 100 55 Q 135 50 155 75 Q 150 95 130 90 Q 115 95 100 85 Q 85 95 70 90 Q 50 95 45 75 Z" fill={hair} stroke={hShadow} strokeWidth="2" />
        </g>
      );
    },
  },
  {
    id: 'hair_long',
    name: 'ロング',
    render: ({ hair }) => {
      const hShadow = shade(hair, -0.25);
      return (
        <g>
          {/* 긴 뒷머리 (어깨 아래까지) */}
          <path d="M 38 95 Q 38 38 100 36 Q 162 38 162 95 L 170 200 Q 165 215 150 212 L 148 130 Q 145 100 100 92 Q 55 100 52 130 L 50 212 Q 35 215 30 200 Z" fill={hair} stroke={hShadow} strokeWidth="2" />
          {/* 옆으로 흐르는 머리 */}
          <path d="M 40 130 Q 32 150 28 180 Q 26 195 35 200 Q 42 180 45 155 Z" fill={hShadow} opacity="0.5" />
          <path d="M 160 130 Q 168 150 172 180 Q 174 195 165 200 Q 158 180 155 155 Z" fill={hShadow} opacity="0.5" />
          {/* 앞머리 (사이드 쓸어내림) */}
          <path d="M 45 80 Q 55 50 100 52 Q 145 52 155 80 Q 150 95 125 88 Q 108 80 85 95 Q 55 100 45 80 Z" fill={hair} stroke={hShadow} strokeWidth="2" />
        </g>
      );
    },
  },
];

// ============================================================
// 눈 (얼굴 위)
// ============================================================

export const EYE_PARTS = [
  {
    id: 'eyes_round',
    name: 'キラキラ',
    render: () => (
      <g>
        {/* 왼쪽 */}
        <ellipse cx="76" cy="108" rx="8" ry="11" fill="#2D1B2E" />
        <circle cx="78" cy="105" r="3" fill="white" />
        <circle cx="74" cy="112" r="1.5" fill="white" />
        {/* 오른쪽 */}
        <ellipse cx="124" cy="108" rx="8" ry="11" fill="#2D1B2E" />
        <circle cx="126" cy="105" r="3" fill="white" />
        <circle cx="122" cy="112" r="1.5" fill="white" />
      </g>
    ),
  },
  {
    id: 'eyes_wink',
    name: 'ウィンク',
    render: () => (
      <g>
        {/* 왼쪽 (감은 눈) */}
        <path d="M 68 108 Q 76 102 84 108" stroke="#2D1B2E" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* 오른쪽 (뜬 눈) */}
        <ellipse cx="124" cy="108" rx="8" ry="11" fill="#2D1B2E" />
        <circle cx="126" cy="105" r="3" fill="white" />
      </g>
    ),
  },
  {
    id: 'eyes_jitome',
    name: 'ジト目',
    render: () => (
      <g>
        <ellipse cx="76" cy="110" rx="7" ry="3.5" fill="#2D1B2E" />
        <ellipse cx="124" cy="110" rx="7" ry="3.5" fill="#2D1B2E" />
      </g>
    ),
  },
];

// ============================================================
// 입
// ============================================================

export const MOUTH_PARTS = [
  {
    id: 'mouth_smile',
    name: 'にっこり',
    render: () => (
      <path d="M 92 135 Q 100 142 108 135" stroke="#2D1B2E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    ),
  },
  {
    id: 'mouth_open',
    name: 'ぱくっ',
    render: () => (
      <g>
        <ellipse cx="100" cy="137" rx="5" ry="4" fill="#2D1B2E" />
        <ellipse cx="100" cy="140" rx="3" ry="1.5" fill="#FF6B9D" />
      </g>
    ),
  },
  {
    id: 'mouth_smirk',
    name: 'ちいさく',
    render: () => (
      <path d="M 96 137 Q 100 140 104 137" stroke="#2D1B2E" strokeWidth="2" fill="none" strokeLinecap="round" />
    ),
  },
];

// ============================================================
// 옷 (몸통)
// ============================================================

export const OUTFIT_PARTS = [
  {
    id: 'outfit_dress',
    name: 'ワンピース',
    render: ({ outfit }) => {
      const oShadow = shade(outfit, -0.2);
      const oTrim = shade(outfit, -0.3);
      return (
        <g>
          {/* 팔 (소매) */}
          <ellipse cx="46" cy="185" rx="14" ry="18" fill={outfit} stroke={oShadow} strokeWidth="2" />
          <ellipse cx="154" cy="185" rx="14" ry="18" fill={outfit} stroke={oShadow} strokeWidth="2" />
          {/* 드레스 몸통 (A라인) */}
          <path d="M 62 168 Q 100 164 138 168 L 156 232 Q 100 236 44 232 Z" fill={outfit} stroke={oShadow} strokeWidth="2" />
          {/* 허리 트림 */}
          <rect x="62" y="188" width="76" height="4" fill={oTrim} />
          {/* 깃 */}
          <path d="M 88 166 L 100 178 L 112 166" fill="none" stroke={oShadow} strokeWidth="2" />
        </g>
      );
    },
  },
  {
    id: 'outfit_hoodie',
    name: 'パーカー',
    render: ({ outfit }) => {
      const oShadow = shade(outfit, -0.2);
      return (
        <g>
          {/* 후드 (목 뒤) */}
          <ellipse cx="100" cy="170" rx="42" ry="16" fill={oShadow} />
          {/* 팔 */}
          <ellipse cx="44" cy="190" rx="15" ry="22" fill={outfit} stroke={oShadow} strokeWidth="2" />
          <ellipse cx="156" cy="190" rx="15" ry="22" fill={outfit} stroke={oShadow} strokeWidth="2" />
          {/* 후드 몸통 */}
          <path d="M 58 172 Q 100 168 142 172 L 152 232 Q 100 236 48 232 Z" fill={outfit} stroke={oShadow} strokeWidth="2" />
          {/* 캥거루 포켓 */}
          <path d="M 78 200 Q 100 195 122 200 L 120 218 L 80 218 Z" fill="none" stroke={oShadow} strokeWidth="2" />
          {/* 끈 */}
          <line x1="92" y1="172" x2="90" y2="188" stroke={oShadow} strokeWidth="2" strokeLinecap="round" />
          <line x1="108" y1="172" x2="110" y2="188" stroke={oShadow} strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    },
  },
  {
    id: 'outfit_sailor',
    name: 'セーラー',
    render: ({ outfit, accent }) => {
      const oShadow = shade(outfit, -0.2);
      return (
        <g>
          {/* 팔 */}
          <ellipse cx="46" cy="185" rx="14" ry="18" fill={outfit} stroke={oShadow} strokeWidth="2" />
          <ellipse cx="154" cy="185" rx="14" ry="18" fill={outfit} stroke={oShadow} strokeWidth="2" />
          {/* 몸통 */}
          <path d="M 62 168 Q 100 164 138 168 L 150 232 Q 100 236 50 232 Z" fill={outfit} stroke={oShadow} strokeWidth="2" />
          {/* 세일러 칼라 */}
          <path d="M 72 166 L 100 200 L 128 166 L 128 178 L 100 210 L 72 178 Z" fill="#FFFFFF" stroke={oShadow} strokeWidth="1.5" />
          {/* 리본 */}
          <path d="M 88 200 L 100 195 L 112 200 L 108 212 L 100 208 L 92 212 Z" fill={accent} stroke={shade(accent, -0.3)} strokeWidth="1.5" />
          <circle cx="100" cy="203" r="3" fill={shade(accent, -0.3)} />
        </g>
      );
    },
  },
];

// ============================================================
// 액세서리 (최상단)
// ============================================================

export const ACCESSORY_PARTS = [
  {
    id: 'acc_none',
    name: 'なし',
    render: () => null,
  },
  {
    id: 'acc_ribbon',
    name: 'リボン',
    render: ({ accent }) => {
      const aShadow = shade(accent, -0.3);
      return (
        <g>
          {/* 리본 */}
          <path d="M 62 50 L 80 42 L 82 55 L 74 58 Z" fill={accent} stroke={aShadow} strokeWidth="1.5" />
          <path d="M 82 55 L 98 42 L 96 58 L 82 58 Z" fill={accent} stroke={aShadow} strokeWidth="1.5" />
          <circle cx="82" cy="52" r="4" fill={aShadow} />
        </g>
      );
    },
  },
  {
    id: 'acc_catears',
    name: 'ねこみみ',
    render: ({ hair }) => {
      const hShadow = shade(hair, -0.3);
      return (
        <g>
          {/* 왼쪽 귀 */}
          <path d="M 50 55 L 58 25 L 75 55 Z" fill={hair} stroke={hShadow} strokeWidth="2" />
          <path d="M 56 50 L 60 35 L 70 50 Z" fill="#FFB5C5" />
          {/* 오른쪽 귀 */}
          <path d="M 125 55 L 142 25 L 150 55 Z" fill={hair} stroke={hShadow} strokeWidth="2" />
          <path d="M 130 50 L 140 35 L 144 50 Z" fill="#FFB5C5" />
        </g>
      );
    },
  },
  {
    id: 'acc_halo',
    name: 'てんし',
    render: ({ accent }) => (
      <g>
        <ellipse cx="100" cy="35" rx="32" ry="7" fill="none" stroke={accent} strokeWidth="3.5" opacity="0.85" />
        <ellipse cx="100" cy="35" rx="22" ry="4" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.9" />
      </g>
    ),
  },
];

// ============================================================
// 헬퍼
// ============================================================

export const findPart = (registry, id) => registry.find(p => p.id === id) || registry[0];

// 디폴트 (빌더 초기 상태)
export const DEFAULT_SELECTIONS = {
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
