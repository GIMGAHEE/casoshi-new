/**
 * 사운드 토글 버튼 — back.png 처럼 그냥 아이콘 그대로.
 * ON: sound.png 정상
 * OFF: 회색조 + 핑크 슬래시 (기능 가시성)
 */
export default function SoundToggle({ enabled, onToggle, className = '' }) {
  return (
    <button
      onClick={() => onToggle(!enabled)}
      aria-label={enabled ? 'サウンド ON' : 'サウンド OFF'}
      className={`relative active:scale-95 transition-transform ${className}`}
    >
      <img
        src="/icons/sound.png"
        alt=""
        className="w-10 h-10 object-contain"
        style={{
          imageRendering: 'pixelated',
          filter: enabled ? 'none' : 'grayscale(1)',
          opacity: enabled ? 1 : 0.4,
        }}
        draggable={false}
      />
      {/* OFF 시 핑크 슬래시 */}
      {!enabled && (
        <span
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            top: '50%',
            left: '15%',
            right: '15%',
            height: '2.5px',
            background: '#ff5fa2',
            transform: 'rotate(-30deg)',
            borderRadius: '2px',
          }}
        />
      )}
    </button>
  );
}
