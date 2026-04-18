import { shade } from '../utils/color';

/**
 * 1-point perspective mini-room
 * - 뒤쪽 코너가 중앙 소실점, 벽이 좌우로 퍼짐
 * - 바닥은 앞쪽이 넓은 삼각형/사다리꼴
 * - 캐릭터는 바닥 중앙에 서있음
 */
export default function IsometricRoom({
  character,
  children,
  size = 340,
}) {
  const themeColor = character?.themeColor || '#FF6B9D';
  const accent = themeColor;
  const accentDark = shade(accent, -0.3);

  // 벽/바닥 팔레트
  const wallLeft  = '#F5E6D3';
  const wallRight = shade(wallLeft, -0.08);
  const floorColor = '#C9A878';
  const floorDark  = '#8B6B45';

  return (
    <svg
      viewBox="0 0 400 400"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      style={{ display: 'block' }}
    >
      {/* 방 좌표 체계:
          소실점(뒤 코너 위): (200, 120)
          뒤 코너 아래(바닥과 벽 만남): (200, 220)
          앞 모서리: 화면 네 귀퉁이 (0,0)(400,0)(0,400)(400,400)
          바닥 앞 모서리: (0,400)-(400,400)
          바닥 뒤: (200,220) 한 점(수렴) */}

      {/* ===== 왼쪽 벽 ===== */}
      <polygon
        points="0,0 200,120 200,220 0,400"
        fill={wallLeft}
        stroke={floorDark}
        strokeWidth="1"
      />

      {/* ===== 오른쪽 벽 ===== */}
      <polygon
        points="400,0 200,120 200,220 400,400"
        fill={wallRight}
        stroke={floorDark}
        strokeWidth="1"
      />

      {/* ===== 바닥 (삼각형) ===== */}
      <polygon
        points="200,220 0,400 400,400"
        fill={floorColor}
        stroke={floorDark}
        strokeWidth="1.5"
      />
      {/* 바닥 depth 라인 (뒤→앞 방향 깊이감) */}
      <g stroke={floorDark} strokeWidth="1" opacity="0.35">
        <line x1="150" y1="265" x2="250" y2="265" />
        <line x1="100" y1="310" x2="300" y2="310" />
        <line x1="50"  y1="355" x2="350" y2="355" />
      </g>

      {/* ===== 창문 (오른쪽 벽, 원근 적용) ===== */}
      <g>
        <polygon
          points="260,80 330,50 330,220 260,190"
          fill="#FFF8F0"
          stroke={accentDark}
          strokeWidth="2"
        />
        {/* 하늘 */}
        <polygon
          points="264,84 326,56 326,216 264,186"
          fill="#B5E0FA"
        />
        {/* 구름 */}
        <ellipse cx="285" cy="95" rx="8" ry="3" fill="white" opacity="0.9" />
        <ellipse cx="305" cy="130" rx="10" ry="3" fill="white" opacity="0.8" />
        {/* 창틀 십자 */}
        <line x1="264" y1="135" x2="326" y2="105" stroke={accentDark} strokeWidth="1.5" />
        <line x1="295" y1="67"  x2="295" y2="205" stroke={accentDark} strokeWidth="1.5" />
      </g>

      {/* ===== 오버레이 (캐릭터 등) ===== */}
      {children && (
        <g>{children}</g>
      )}
    </svg>
  );
}
