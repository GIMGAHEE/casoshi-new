export default function PointsBar({ points, onReset }) {
  // Home과 동일한 픽셀 산리오 톤
  const pixelStyle = {
    background: '#fff0f6',
    border: '2px solid #ff7eb6',
    borderRadius: '12px',
    boxShadow: '0 3px 0 0 #ff5fa2',
  };

  return (
    <div
      className="sticky top-0 z-10 backdrop-blur-sm"
      style={{
        background: 'rgba(255, 238, 246, 0.85)',
        borderBottom: '2px solid #ff7eb6',
      }}
    >
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        {/* 포인트 박스 */}
        <div className="flex items-center gap-2 px-3 py-1.5" style={pixelStyle}>
          <img
            src="/icons/heart.png"
            alt=""
            className="w-7 h-7"
            style={{ imageRendering: 'pixelated' }}
          />
          <div>
            <div className="text-[10px] leading-none" style={{ color: '#a888a4' }}>
              ポイント
            </div>
            <div className="text-lg font-black leading-tight" style={{ color: '#ff5fa2' }}>
              {points.toLocaleString()}
            </div>
          </div>
        </div>

        {/* 리셋 버튼 */}
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-[11px] font-bold px-3 py-2 active:translate-y-0.5 transition"
          style={{ ...pixelStyle, color: '#ff5fa2' }}
        >
          <span className="text-sm leading-none">↻</span>
          リセット
        </button>
      </div>
    </div>
  );
}
