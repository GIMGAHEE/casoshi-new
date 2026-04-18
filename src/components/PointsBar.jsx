export default function PointsBar({ points, onReset }) {
  return (
    <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b-2 border-oshi-sub">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💖</span>
          <div>
            <div className="text-xs text-oshi-dark/60 leading-none">ポイント</div>
            <div className="text-xl font-black text-oshi-main leading-tight">
              {points.toLocaleString()}
            </div>
          </div>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-oshi-dark/40 hover:text-oshi-dark/70 underline"
        >
          リセット
        </button>
      </div>
    </div>
  );
}
