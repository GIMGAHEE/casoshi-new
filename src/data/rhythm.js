// ===== 推しリズム 리듬모드 데이터 =====

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

// 레인 (노트가 어느 컬럼에서 떨어지는지) — 5레인
// pink / blue / purple / green / orange (이미지 레퍼런스 톤)
export const LANES = ['pink', 'blue', 'purple', 'green', 'orange'];

// 레인별 시각 정보
export const LANE_INFO = {
  pink:   { color: '#FF6BAA', glow: 'rgba(255,107,170,0.6)', label: '↙' },
  blue:   { color: '#5BB4FF', glow: 'rgba(91,180,255,0.6)',  label: '↖' },
  purple: { color: '#B07BFF', glow: 'rgba(176,123,255,0.6)', label: '🔄' },
  green:  { color: '#7DDC6E', glow: 'rgba(125,220,110,0.6)', label: '↗' },
  orange: { color: '#FFA94D', glow: 'rgba(255,169,77,0.6)',  label: '↘' },
};

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
export const TOTAL_NOTES = 28;              // 총 노트 수 (사비에서 몰아치므로 기존보다 살짝 증가)

// ===== サビ (클라이맥스) 구간 =====
// 세션 30초의 중간 부분 = 한바탕 몰아치는 5초 구간
export const SABI_START_MS = 13_000;  // 13s
export const SABI_END_MS   = 18_000;  // 18s (5초간)
export const SABI_BANNER_LEAD_MS = 1_500;  // 사비 시작 1.5s 전 배너 등장
export const SABI_SCORE_MULT = 1.5;        // 사비 중 점수 배수
// 사비 구간 노트 수 (나머지는 pre/post에 분배)
export const SABI_NOTES = 11;           // 5초 동안 11개 = 0.45s 간격 (러시)
// 남은 17개 = 17s (0~13s pre, 18~28s post, 제외 버퍼 포함)

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

// 레인 뽑기
export function rollLane() {
  return LANES[Math.floor(Math.random() * LANES.length)];
}

// 호환용 alias (옛 코드가 rollDirection 호출시)
export const rollDirection = rollLane;

// 세션 타임라인 생성 — [{ id, hitTime, rarity, phrase, direction, isSabi }]
// 3구간 분배: pre(0~SABI_START) · sabi(SABI_START~SABI_END, 밀도↑) · post(SABI_END~)
export function generateTimeline() {
  const notes = [];
  const startBuffer = NOTE_TRAVEL_MS + 500;   // 첫 노트 등장 여유
  const endBuffer = 2000;                      // 마지막 노트 이후 여유

  // 전체 28 중 11개는 사비. 나머지 17개를 pre/post에 적절 분배
  const preRange = SABI_START_MS - startBuffer;                     // 약 10.1s
  const postRange = SESSION_DURATION_MS - SABI_END_MS - endBuffer;  // 약 10s
  const totalNonSabiRange = preRange + postRange;
  const nonSabiCount = TOTAL_NOTES - SABI_NOTES;
  const preCount = Math.round(nonSabiCount * (preRange / totalNonSabiRange));
  const postCount = nonSabiCount - preCount;

  // Helper: 구간 내 균등 분배 + 지터
  const spread = (count, rangeStart, rangeEnd, jitterRatio = 0.5, isSabi = false) => {
    const span = rangeEnd - rangeStart;
    const step = span / count;
    for (let i = 0; i < count; i++) {
      const base = rangeStart + (i + 0.5) * step;
      const jitter = (Math.random() - 0.5) * step * jitterRatio;
      const hitTime = Math.max(startBuffer, Math.round(base + jitter));
      const lane = rollLane();
      notes.push({
        id: `note_${notes.length}`,
        hitTime,
        spawnTime: hitTime - NOTE_TRAVEL_MS,
        rarity: rollNoteRarity(),
        phrase: null,
        lane,
        direction: lane,  // 옛 코드 호환
        isSabi,
      });
    }
  };

  // 1) Pre (0 ~ 13s)
  spread(preCount, startBuffer, SABI_START_MS - 200, 0.55, false);
  // 2) Sabi (13 ~ 18s) — 밀도↑, 지터 낮춰서 박자감 강조
  spread(SABI_NOTES, SABI_START_MS, SABI_END_MS, 0.25, true);
  // 3) Post (18 ~ 28s)
  spread(postCount, SABI_END_MS + 200, SESSION_DURATION_MS - endBuffer, 0.55, false);

  // 문구 채우기
  notes.forEach(n => { n.phrase = rollPhrase(n.rarity); });
  // 시간 순 정렬
  notes.sort((a, b) => a.hitTime - b.hitTime);
  return notes;
}
