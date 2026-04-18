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
export default function PixelAvatar({ selections, size = 96 }) {
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
