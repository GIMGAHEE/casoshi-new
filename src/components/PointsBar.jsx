export default function PointsBar({ points, onReset }) {
  return (
    <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b-2 border-oshi-sub">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src="/icons/heart.png"
            alt=""
            className="w-8 h-8"
            style={{ imageRendering: 'pixelated' }}
          />
          <div>
            <div className="text-[11px] text-oshi-dark/60 leading-none">ポイント</div>
            <div className="text-xl font-black text-oshi-main leading-tight">
              {points.toLocaleString()}
            </div>
          </div>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-[11px] font-bold text-oshi-dark/60 hover:text-oshi-dark bg-white border-2 border-oshi-sub rounded-full px-3 py-1.5 active:scale-95 transition"
        >
          <span className="text-sm leading-none">↻</span>
          リセット
        </button>
      </div>
    </div>
  );
}
