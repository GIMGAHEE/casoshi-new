// ===== 推しコール 리듬모드 데이터 =====

// 콜 문구 (화면에 뜨는 텍스트)
export const CALL_PHRASES = {
  N: ['ヘーイ！', 'コイ！', 'せーの', 'いいぞ', 'はい！', 'そーれ'],
  R: ['FIRE！', 'キラキラ', 'かわいい', 'ファイト', 'がんばれ', 'いくよ！'],
  SR: ['推しカワイイ', '神ってる！', 'あがる〜', 'ヤバい！', '世界一！'],
  SSR: ['推ししか勝たん', '現場最高！', '優勝！', 'レジェンド！'],
};

// 희귀도 가중치 (노트 생성 시 뽑기)
export const RARITY_WEIGHTS = {
  N:   70,
  R:   20,
  SR:  8,
  SSR: 2,
};

// 희귀도별 시각/점수 정보
export const RARITY_INFO = {
  N:   { color: '#FF6B9D', glow: 'none',                                  scoreMult: 1 },
  R:   { color: '#5BA4E0', glow: '0 0 10px rgba(91,164,224,0.5)',         scoreMult: 1.5 },
  SR:  { color: '#B77EE0', glow: '0 0 14px rgba(183,126,224,0.7)',        scoreMult: 2.5 },
  SSR: { color: '#FFB800', glow: '0 0 20px rgba(255,184,0,0.9)',          scoreMult: 5 },
};

// 방향 (노트가 어디에서 날아오는지) — 3방향
export const DIRECTIONS = ['top', 'left', 'right'];

// 판정 윈도우 (ms) — 노트의 이상적 히트 시각과 실제 탭 시각의 차이
export const JUDGMENT = {
  PERFECT:  80,   // ±80ms
  GOOD:    200,   // ±200ms (PERFECT 외)
  // 그 외 = MISS
};

// 판정별 점수 (희귀도 × 타이밍)
export const JUDGMENT_SCORE = {
  PERFECT: 30,
  GOOD:    10,
  MISS:    0,
};

// 노트 비행 시간 (spawn → hit 까지)
export const NOTE_TRAVEL_MS = 1400;  // 1.4초 동안 날아옴

// 세션 시간/노트 수
export const SESSION_DURATION_MS = 30_000;  // 30초 플레이
export const TOTAL_NOTES = 24;              // 총 노트 수
// = 평균 1.07초에 하나 → 살짝 변동 추가

// 희귀도 뽑기
export function rollNoteRarity() {
  const total = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (const [rarity, w] of Object.entries(RARITY_WEIGHTS)) {
    r -= w;
    if (r <= 0) return rarity;
  }
  return 'N';
}

// 문구 뽑기
export function rollPhrase(rarity) {
  const arr = CALL_PHRASES[rarity] || CALL_PHRASES.N;
  return arr[Math.floor(Math.random() * arr.length)];
}

// 방향 뽑기
export function rollDirection() {
  return DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
}

// 세션 타임라인 생성 — [{ id, hitTime, rarity, phrase, direction }]
// hitTime은 0 ~ SESSION_DURATION_MS 사이
// (NOTE_TRAVEL_MS 이전에 스폰되어야 함)
export function generateTimeline() {
  const notes = [];
  const startBuffer = NOTE_TRAVEL_MS + 500;             // 시작 후 첫 노트까지 여유
  const endBuffer = 2500;                                // 마지막 노트 이후 여유
  const activeRange = SESSION_DURATION_MS - startBuffer - endBuffer;
  const avgInterval = activeRange / TOTAL_NOTES;
  // 약간의 지터 (±30%)
  for (let i = 0; i < TOTAL_NOTES; i++) {
    const base = startBuffer + i * avgInterval;
    const jitter = (Math.random() - 0.5) * avgInterval * 0.6;
    const hitTime = Math.round(base + jitter);
    notes.push({
      id: `note_${i}`,
      hitTime,
      spawnTime: hitTime - NOTE_TRAVEL_MS,
      rarity: rollNoteRarity(),
      phrase: null,   // lazy fill
      direction: rollDirection(),
    });
  }
  // 문구 채우기
  notes.forEach(n => { n.phrase = rollPhrase(n.rarity); });
  // 시간 순 정렬
  notes.sort((a, b) => a.hitTime - b.hitTime);
  return notes;
}
