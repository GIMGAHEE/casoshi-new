import { shade } from '../utils/color';

/**
 * Cyworld-style isometric mini-room
 * - 캐릭터의 테마 컬러에 맞춰 벽지/러그/침대 컬러 변경
 * - 바닥/가구 구조는 고정
 * - 완전 픽셀은 아니지만 크리스프 엣지 + 한정 팔레트로 픽셀 감성
 */
export default function IsometricRoom({
  character,
  children, // 방 안에 서있는 캐릭터 등 오버레이
  size = 340,
}) {
  const themeColor = character?.themeColor || '#FF6B9D';
  const accent = themeColor;
  const accentDark = shade(accent, -0.3);
  const accentLight = shade(accent, 0.4);

  // 벽지 스트라이프 컬러
  const wallBase = '#F5E6D3';
  const wallShadow = shade(wallBase, -0.15);
  const wallStripe = shade(accent, 0.6);

  // 바닥 나무
  const floorLight = '#E8C896';
  const floorDark = '#C9A878';
  const floorLine = '#8B6B45';

  return (
    <svg
      viewBox="0 0 400 400"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      style={{ display: 'block' }}
    >
      {/* ===== 벽 (뒤에 먼저 그림) ===== */}
      {/* 방 레이아웃 (isometric 2:1):
          바닥 다이아몬드:  L(0,270) B(200,170) R(400,270) F(200,370)
          벽 높이: 170 (수직)
          벽 위 꼭지점:    LT(0,100) BT(200,0)  RT(400,100)              */}

      {/* 왼쪽 벽 */}
      <polygon
        points="0,270 200,170 200,0 0,100"
        fill={wallBase}
        stroke="#8B6B45"
        strokeWidth="1"
      />
      {/* 왼쪽 벽 세로 스트라이프 */}
      <g stroke={wallStripe} strokeWidth="2" fill="none">
        <line x1="50"  y1="245" x2="50"  y2="75"  />
        <line x1="100" y1="220" x2="100" y2="50"  />
        <line x1="150" y1="195" x2="150" y2="25"  />
      </g>

      {/* 오른쪽 벽 */}
      <polygon
        points="200,170 400,270 400,100 200,0"
        fill={shade(wallBase, -0.04)}
        stroke="#8B6B45"
        strokeWidth="1"
      />
      {/* 오른쪽 벽 스트라이프 */}
      <g stroke={shade(wallStripe, -0.1)} strokeWidth="2" fill="none">
        <line x1="250" y1="195" x2="250" y2="25"  />
        <line x1="300" y1="220" x2="300" y2="50"  />
        <line x1="350" y1="245" x2="350" y2="75"  />
      </g>

      {/* ===== 창문 (오른쪽 벽, isometric 2:1 slope) ===== */}
      <g>
        <polygon
          points="250,60 340,105 340,185 250,140"
          fill="#FFF8F0"
          stroke={accentDark}
          strokeWidth="2"
        />
        <polygon
          points="254,66 336,107 336,179 254,134"
          fill="#B5E0FA"
        />
        <ellipse cx="275" cy="82" rx="8" ry="3" fill="white" opacity="0.9" />
        <ellipse cx="305" cy="125" rx="10" ry="3" fill="white" opacity="0.8" />
        {/* 창틀 십자 */}
        <line x1="254" y1="100" x2="336" y2="145" stroke={accentDark} strokeWidth="1.5" />
        <line x1="295" y1="83"  x2="295" y2="162" stroke={accentDark} strokeWidth="1.5" />
      </g>

      {/* ===== 바닥 ===== */}
      <polygon
        points="0,270 200,170 400,270 200,370"
        fill={floorLight}
        stroke={floorLine}
        strokeWidth="1.5"
      />
      {/* 나무 널빤지 라인 (isometric 평행) */}
      <g stroke={floorLine} strokeWidth="1" opacity="0.5">
        <line x1="50"  y1="245" x2="250" y2="345" />
        <line x1="100" y1="220" x2="300" y2="320" />
        <line x1="150" y1="195" x2="350" y2="295" />
      </g>

      {/* ===== 오버레이 (캐릭터 등) ===== */}
      {children && (
        <g>{children}</g>
      )}
    </svg>
  );
}
