// 임시 비밀번호 생성 — 라이버에게 초기 발급용
// 형식: adjective-noun-2digit (e.g., "pink-bunny-42")

const ADJECTIVES = [
  'pink', 'sparkle', 'kawaii', 'shiny', 'sunny', 'happy',
  'cute', 'fluffy', 'magic', 'dreamy', 'candy', 'lucky',
];

const NOUNS = [
  'bunny', 'heart', 'cloud', 'moon', 'star', 'bell',
  'flower', 'ribbon', 'cherry', 'angel', 'crown', 'wish',
];

export function generateTempPassword() {
  const a = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const n = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = 10 + Math.floor(Math.random() * 90); // 10~99
  return `${a}-${n}-${num}`;
}

// 라이버 username 생성 — 이름 기반 slug + 짧은 랜덤 서픽스
export function generateLiverUsername(displayName) {
  const base = (displayName || 'liver')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 10) || 'liver';
  const suffix = Math.random().toString(36).slice(2, 5);
  return `${base}_${suffix}`;
}
