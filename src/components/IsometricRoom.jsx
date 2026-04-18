import { shade } from '../utils/color';

/**
 * 1-point perspective mini-room with visible back wall
 * 방의 5면을 모두 렌더: 뒤벽(직사각) + 좌/우 벽(사다리꼴) + 바닥 + 천장
 *
 * 좌표:
 *   뒤벽 (rectangle): 120,90 → 280,90 → 280,240 → 120,240
 *   천장:   0,0   → 120,90   → 280,90   → 400,0
 *   바닥:   0,400 → 120,240  → 280,240  → 400,400
 *   왼쪽벽: 0,0   → 120,90   → 120,240  → 0,400
 *   오른쪽벽: 400,0 → 280,90 → 280,240  → 400,400
 */
export default function IsometricRoom({ character, children }) {
  const themeColor = character?.themeColor || '#FF6B9D';
  const accent = themeColor;
  const accentDark = shade(accent, -0.3);

  // 팔레트
  const wallBack  = '#F5E6D3';          // 뒤벽 (가장 밝음)
  const wallSide  = shade(wallBack, -0.08); // 측벽 (살짝 어두움)
  const ceiling   = shade(wallBack, 0.05);
  const floorColor = '#C9A878';
  const floorDark  = '#8B6B45';

  return (
    <svg
      viewBox="0 0 400 400"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      style={{ display: 'block', aspectRatio: '1 / 1' }}
    >
      {/* ===== 천장 ===== */}
      <polygon
        points="0,0 120,90 280,90 400,0"
        fill={ceiling}
        stroke={floorDark}
        strokeWidth="1"
      />

      {/* ===== 왼쪽 벽 ===== */}
      <polygon
        points="0,0 120,90 120,240 0,400"
        fill={wallSide}
        stroke={floorDark}
        strokeWidth="1"
      />

      {/* ===== 오른쪽 벽 ===== */}
      <polygon
        points="400,0 280,90 280,240 400,400"
        fill={wallSide}
        stroke={floorDark}
        strokeWidth="1"
      />

      {/* ===== 뒤 벽 (rectangle) ===== */}
      <rect
        x="120" y="90" width="160" height="150"
        fill={wallBack}
        stroke={floorDark}
        strokeWidth="1"
      />

      {/* ===== 바닥 ===== */}
      <polygon
        points="0,400 120,240 280,240 400,400"
        fill={floorColor}
        stroke={floorDark}
        strokeWidth="1.5"
      />
      {/* 바닥 depth 라인 (원근 수렴) */}
      <g stroke={floorDark} strokeWidth="1" opacity="0.3">
        <line x1="0"   y1="400" x2="120" y2="240" />
        <line x1="400" y1="400" x2="280" y2="240" />
      </g>
      {/* 바닥 가로선 (깊이감) */}
      <g stroke={floorDark} strokeWidth="1" opacity="0.25">
        <line x1="60"  y1="320" x2="340" y2="320" />
        <line x1="30"  y1="360" x2="370" y2="360" />
      </g>

      {/* ===== 창문 (뒤 벽 중앙에) ===== */}
      <g>
        <rect
          x="155" y="120" width="90" height="95"
          fill="#FFF8F0"
          stroke={accentDark}
          strokeWidth="2"
        />
        <rect
          x="159" y="124" width="82" height="87"
          fill="#B5E0FA"
        />
        {/* 구름 */}
        <ellipse cx="180" cy="148" rx="10" ry="3" fill="white" opacity="0.9" />
        <ellipse cx="215" cy="170" rx="12" ry="3" fill="white" opacity="0.8" />
        {/* 창틀 십자 */}
        <line x1="159" y1="167" x2="241" y2="167" stroke={accentDark} strokeWidth="1.5" />
        <line x1="200" y1="124" x2="200" y2="211" stroke={accentDark} strokeWidth="1.5" />
      </g>

      {/* ===== 오버레이 (캐릭터 등) ===== */}
      {children && (
        <g>{children}</g>
      )}
    </svg>
  );
}
