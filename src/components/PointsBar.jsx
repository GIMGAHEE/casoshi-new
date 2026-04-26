export default function PointsBar({ points, onReset }) {
  // Home과 동일한 픽셀 산리오 톤 (연한 핑크)
  const pixelStyle = {
    background: '#fffafd',
    border: '2px solid #ffc4dc',
    borderRadius: '14px',
    boxShadow: '0 2px 0 0 #ffc4dc',
  };

  return (
    <div className="sticky top-0 z-10">
      <div className="max-w-md mx-auto px-3 py-2 flex items-center justify-between">
        {/* 포인트 박스 */}
        <div className="flex items-center gap-1.5 px-2 py-1" style={pixelStyle}>
          <img
            src="/icons/heart.png"
            alt=""
            className="w-5 h-5"
            style={{ imageRendering: 'pixelated' }}
          />
          <div>
            <div className="text-[9px] leading-none" style={{ color: '#a888a4' }}>
              ポイント
            </div>
            <div className="text-sm font-black leading-tight font-pixel" style={{ color: '#ff5fa2' }}>
              {points.toLocaleString()}
            </div>
          </div>
        </div>

        {/* 리셋 버튼 */}
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-[10px] font-bold px-2 py-1.5 active:translate-y-0.5 transition"
          style={{ ...pixelStyle, color: '#ff5fa2' }}
        >
          <span className="text-xs leading-none">↻</span>
          リセット
        </button>
      </div>
    </div>
  );
}
