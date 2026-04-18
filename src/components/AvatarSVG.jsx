import {
  renderBase,
  HAIR_PARTS, EYE_PARTS, MOUTH_PARTS, OUTFIT_PARTS, ACCESSORY_PARTS,
  findPart,
} from '../data/avatarParts';

// selections: { parts: {hair, eyes, mouth, outfit, accessory}, colors: {skin, hair, outfit, accent} }
export default function AvatarSVG({ selections, size = 120, showBg = false, bgColor }) {
  const { parts, colors } = selections;

  const hair = findPart(HAIR_PARTS, parts.hair);
  const eyes = findPart(EYE_PARTS, parts.eyes);
  const mouth = findPart(MOUTH_PARTS, parts.mouth);
  const outfit = findPart(OUTFIT_PARTS, parts.outfit);
  const accessory = findPart(ACCESSORY_PARTS, parts.accessory);

  return (
    <svg
      viewBox="0 0 200 240"
      width={size}
      height={size * 240 / 200}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      {showBg && (
        <rect width="200" height="240" fill={bgColor || '#FFE5EC'} />
      )}

      {/* 옷(몸통 + 팔)은 얼굴보다 뒤에 */}
      {outfit.render(colors)}

      {/* 얼굴 베이스 (+볼터치) */}
      {renderBase(colors)}

      {/* 얼굴 디테일 */}
      {eyes.render(colors)}
      {mouth.render(colors)}

      {/* 헤어는 얼굴 위 */}
      {hair.render(colors)}

      {/* 액세서리는 최상단 */}
      {accessory.render(colors)}
    </svg>
  );
}
