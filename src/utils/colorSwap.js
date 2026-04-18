// 헤어 색상 치환 유틸
// Canvas로 특정 base 색에 가까운 픽셀들을 target 색으로 치환
// 결과는 Promise<data URL> — 동일 (sprite, base, target) 조합은 캐시됨

const cache = new Map();

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s;
  const l = (max + min) / 2;
  if (max === min) { h = 0; s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, l];
}

function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * 스프라이트의 baseHex와 유사한 픽셀을 targetHex로 치환.
 * 명암(lightness) 은 원본 픽셀값 기준 상대치를 유지해서 자연스러운 그림자/하이라이트 보존.
 *
 * @param {string} spriteUrl — PNG 스프라이트 경로
 * @param {string} baseHex — 원본 머리색 (예: '#000000')
 * @param {string} targetHex — 바꿀 머리색 (예: '#FFD166')
 * @param {number} tolerance — RGB 거리 임계치 (기본 60)
 * @returns {Promise<string>} data URL
 */
export async function recolorHair(spriteUrl, baseHex, targetHex, tolerance = 60) {
  const cacheKey = `${spriteUrl}|${baseHex}|${targetHex}|${tolerance}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const promise = new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const [br, bg, bb] = hexToRgb(baseHex);
      const [tr, tg, tb] = hexToRgb(targetHex);
      const [, , baseL] = rgbToHsl(br, bg, bb);
      const [tH, tS] = rgbToHsl(tr, tg, tb);

      for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3];
        if (a === 0) continue;

        const r = data[i], g = data[i + 1], b = data[i + 2];
        const dr = r - br, dg = g - bg, db = b - bb;
        const dist = Math.sqrt(dr * dr + dg * dg + db * db);

        if (dist < tolerance) {
          // 픽셀의 lightness offset 유지하면서 target의 hue/saturation 적용
          const [, , origL] = rgbToHsl(r, g, b);
          const offset = origL - baseL;
          const finalL = Math.max(0, Math.min(1, 0.5 + offset)); // mid-L + original offset
          const [nr, ng, nb] = hslToRgb(tH, tS, finalL);
          data[i] = nr;
          data[i + 1] = ng;
          data[i + 2] = nb;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = spriteUrl;
  });

  cache.set(cacheKey, promise);
  return promise;
}
