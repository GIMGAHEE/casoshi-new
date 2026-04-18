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

      {/* 뒤쪽 왼쪽 벽 (사각 다이아몬드 - 왼쪽 면) */}
      <polygon
        points="60,260 200,190 200,60 60,130"
        fill={wallBase}
        stroke="#8B6B45"
        strokeWidth="1"
      />
      {/* 왼쪽 벽 세로 스트라이프 (벽지) */}
      <g stroke={wallStripe} strokeWidth="2" fill="none">
        <line x1="90" y1="245" x2="90" y2="115" />
        <line x1="125" y1="227" x2="125" y2="97" />
        <line x1="160" y1="209" x2="160" y2="79" />
      </g>

      {/* 뒤쪽 오른쪽 벽 */}
      <polygon
        points="200,190 340,260 340,130 200,60"
        fill={shade(wallBase, -0.04)}
        stroke="#8B6B45"
        strokeWidth="1"
      />

      {/* 오른쪽 벽 스트라이프 */}
      <g stroke={shade(wallStripe, -0.1)} strokeWidth="2" fill="none">
        <line x1="235" y1="208" x2="235" y2="78" />
        <line x1="270" y1="225" x2="270" y2="95" />
        <line x1="305" y1="243" x2="305" y2="113" />
      </g>

      {/* ===== 창문 (오른쪽 벽) ===== */}
      <g>
        {/* 창문 프레임 */}
        <polygon
          points="230,135 290,165 290,225 230,195"
          fill="#FFF8F0"
          stroke={accentDark}
          strokeWidth="2"
        />
        {/* 하늘 */}
        <polygon
          points="234,140 286,166 286,220 234,194"
          fill="#B5E0FA"
        />
        {/* 구름 */}
        <ellipse cx="250" cy="158" rx="8" ry="3" fill="white" opacity="0.9" />
        <ellipse cx="270" cy="175" rx="10" ry="3" fill="white" opacity="0.8" />
        {/* 창틀 십자 */}
        <line x1="234" y1="167" x2="286" y2="193" stroke={accentDark} strokeWidth="1.5" />
        <line x1="260" y1="152" x2="260" y2="207" stroke={accentDark} strokeWidth="1.5" />
      </g>

      {/* ===== 바닥 (다이아몬드, 나무 패턴) ===== */}
      <polygon
        points="60,260 200,190 340,260 200,330"
        fill={floorLight}
        stroke={floorLine}
        strokeWidth="1.5"
      />
      {/* 나무 널빤지 라인 (왼쪽 대각선 방향) */}
      <g stroke={floorLine} strokeWidth="1" opacity="0.5">
        <line x1="95" y1="242" x2="235" y2="312" />
        <line x1="130" y1="225" x2="270" y2="295" />
        <line x1="165" y1="207" x2="305" y2="277" />
        <line x1="200" y1="190" x2="340" y2="260" />
      </g>

      {/* ===== 오버레이 (캐릭터 등) ===== */}
      {children && (
        <g>{children}</g>
      )}
    </svg>
  );
}
