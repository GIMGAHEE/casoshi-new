import { useState, useEffect } from 'react';
import {
  SPRITE_W, SPRITE_H,
  buildPalette, composeLayers,
} from '../data/pixelParts';
import { recolorHair } from '../utils/colorSwap';

/**
 * Renders a pixel-art chibi avatar.
 *
 * If `sprite` (PNG path) is given, renders as <img>.
 *   - When `hairColor` + `baseHairColor` provided, canvas-recolors pixels
 *     matching baseHairColor → hairColor (preserving shading).
 *
 * Otherwise falls back to SVG pixel-parts composition using `selections`.
 */
export default function PixelAvatar({
  selections, sprite, size = 96,
  hairColor, baseHairColor,
}) {
  const [recoloredUrl, setRecoloredUrl] = useState(null);

  useEffect(() => {
    if (!sprite || !hairColor || !baseHairColor) {
      setRecoloredUrl(null);
      return;
    }
    let cancelled = false;
    recolorHair(sprite, baseHairColor, hairColor)
      .then(url => { if (!cancelled) setRecoloredUrl(url); })
      .catch(() => { if (!cancelled) setRecoloredUrl(null); });
    return () => { cancelled = true; };
  }, [sprite, hairColor, baseHairColor]);

  if (sprite) {
    return (
      <img
        src={recoloredUrl || sprite}
        alt=""
        width={size}
        style={{
          display: 'block',
          imageRendering: 'pixelated',
          width: size,
          height: 'auto',
          userSelect: 'none',
        }}
        draggable={false}
      />
    );
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
