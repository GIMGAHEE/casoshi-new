/**
 * 사운드 토글 버튼 — 우상단 헤더에 배치.
 * ON: sound.png 정상 표시
 * OFF: 회색조 + 슬래시 줄
 *
 * 톤은 ← 뒤로가기 버튼이랑 동일한 산리오 픽셀 카드 스타일 (흰 BG, 핑크 보더, 단색 그림자).
 */
export default function SoundToggle({ enabled, onToggle, className = '' }) {
  const cardStyle = {
    backgroundColor: enabled ? '#fffafd' : '#f0e6ec',
    border: '2px solid #ffc4dc',
    borderRadius: '10px',
    boxShadow: '0 2px 0 0 #ffc4dc',
  };

  return (
    <button
      onClick={() => onToggle(!enabled)}
      aria-label={enabled ? 'サウンド ON' : 'サウンド OFF'}
      className={`relative w-10 h-10 flex items-center justify-center active:translate-y-0.5 transition ${className}`}
      style={cardStyle}
    >
      <img
        src="/icons/sound.png"
        alt=""
        className="w-6 h-6 object-contain"
        style={{
          imageRendering: 'pixelated',
          filter: enabled ? 'none' : 'grayscale(1) opacity(0.5)',
        }}
        draggable={false}
      />
      {/* OFF 시 빨간 슬래시 */}
      {!enabled && (
        <span
          aria-hidden
          className="absolute"
          style={{
            top: '50%',
            left: '15%',
            right: '15%',
            height: '2.5px',
            background: '#ff5fa2',
            transform: 'rotate(-30deg)',
            borderRadius: '2px',
            boxShadow: '0 1px 0 0 rgba(0,0,0,0.15)',
          }}
        />
      )}
    </button>
  );
}
