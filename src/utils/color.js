// 헥스 컬러 밝기 조정 유틸
// amount: -1 (완전 검정) ~ +1 (완전 흰색)

export function shade(hex, amount) {
  const n = parseInt(hex.replace('#', ''), 16);
  let r = (n >> 16) & 0xff;
  let g = (n >> 8) & 0xff;
  let b = n & 0xff;

  if (amount < 0) {
    // darken
    const k = 1 + amount;
    r = Math.max(0, Math.round(r * k));
    g = Math.max(0, Math.round(g * k));
    b = Math.max(0, Math.round(b * k));
  } else {
    // lighten
    r = Math.min(255, Math.round(r + (255 - r) * amount));
    g = Math.min(255, Math.round(g + (255 - g) * amount));
    b = Math.min(255, Math.round(b + (255 - b) * amount));
  }

  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

// 대비 좋은 텍스트 컬러 선택 (흰 배경인지 어두운 배경인지)
export function contrastText(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  // YIQ 공식
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 160 ? '#2D1B2E' : '#FFFFFF';
}
