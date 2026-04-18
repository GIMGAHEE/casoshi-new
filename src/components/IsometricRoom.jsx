/**
 * 방 배경 이미지 위에 캐릭터/그림자 등을 오버레이하는 컨테이너.
 * - 기본 배경: /bg/room_default.png (1536×1024, 3:2 비율)
 * - children은 position:absolute로 배치된 DOM 노드
 *   (MiniHome에서 top/left/% 단위로 배치)
 */
export default function IsometricRoom({ character, children, bg }) {
  const bgUrl = bg || character?.roomBg || '/bg/room_default.png';

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '3 / 2',
        backgroundImage: `url(${bgUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
}
