import {
  SPRITE_W, SPRITE_H,
  buildPalette, composeLayers,
} from '../data/pixelParts';

/**
 * Renders a pixel-art chibi avatar using composed sprite layers.
 * Each "pixel" is an SVG <rect> to preserve crisp edges at any scale.
 *
 * selections: {
 *   parts:  { hair, eyes, mouth, outfit, accessory },
 *   colors: { skin, hair, outfit, accent },
 * }
 * size: target rendered width in px (height auto-computed by aspect ratio)
 */
export default function PixelAvatar({
  selections, sprite, size = 96,
  hairOverlay, hairTransform,
}) {
  // PNG sprite path wins over parts-based rendering.
  if (sprite) {
    const imgStyle = {
      display: 'block',
      imageRendering: 'pixelated',
      width: size,
      height: 'auto',
      userSelect: 'none',
    };
    const baseImg = (
      <img src={sprite} alt="" width={size} style={imgStyle} draggable={false} />
    );
    // Hair overlay stacks on top via absolute positioning (same canvas size).
    if (hairOverlay) {
      const t = hairTransform || { x: 0, y: 0, scale: 1 };
      const overlayStyle = {
        ...imgStyle,
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        transform: `translate(${t.x}%, ${t.y}%) scale(${t.scale})`,
        transformOrigin: 'center center',
      };
      return (
        <div style={{ position: 'relative', width: size, display: 'inline-block' }}>
          {baseImg}
          <img
            src={hairOverlay}
            alt=""
            width={size}
            style={overlayStyle}
            draggable={false}
          />
        </div>
      );
    }
    return baseImg;
  }

  const palette = buildPalette(selections.colors);
  const merged = composeLayers(selections);

  // Build run-length-encoded horizontal rects per row for fewer DOM nodes.
  // (24×32 = 768 pixels; RLE typically reduces to 100-200 rects.)
  const rects = [];
  for (let y = 0; y < SPRITE_H; y++) {
    const row = merged[y];
    let x = 0;
    while (x < SPRITE_W) {
      const c = row[x];
      if (c === '.') {
        x++;
        continue;
      }
      let run = 1;
      while (x + run < SPRITE_W && row[x + run] === c) run++;
      const fill = palette[c];
      if (fill) {
        rects.push({ x, y, w: run, fill, key: `${x}_${y}` });
      }
      x += run;
    }
  }

  const height = size * SPRITE_H / SPRITE_W;

  return (
    <svg
      viewBox={`0 0 ${SPRITE_W} ${SPRITE_H}`}
      width={size}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      style={{ display: 'block', imageRendering: 'pixelated' }}
    >
      {rects.map(r => (
        <rect
          key={r.key}
          x={r.x}
          y={r.y}
          width={r.w}
          height={1}
          fill={r.fill}
        />
      ))}
    </svg>
  );
}
