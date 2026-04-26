// 推しリズム 트랙 정의
// 각 트랙은 BPM, 키, 리드 멜로디(2마디 ABAB), 베이스 패턴, 코드, 사운드 톤을 가짐.
// 게임 시작 전 사용자가 선택. selected track 은 localStorage 에 저장.
//
// freq 단위: Hz (오실레이터 직접 주파수)
// riff: 16-subbeat (16분음표) 배열, null = 쉼표
// bassPattern: { subbeatIndex: freq } — 한 마디(16subbeat) 안의 베이스 트리거
// chord1/chord2: fever 시 마디 시작/중간에 폭발하는 화음 (3음)
// kickExtraI: level 3 에서 추가 킥 subbeat 위치 (단조로움 방지). null 이면 추가 X
// leadShape: 'sawtooth'(밝고 풀) / 'square'(8bit) / 'triangle'(부드러움) / 'sine'(맑음)

export const TRACKS = [
  {
    id: 'sugar_rush',
    name: 'シュガーラッシュ',
    subtitle: '王道 J-POP',
    genre: 'J-POP',
    bpm: 128,
    accentColor: '#FF6B9D',
    leadShape: 'sawtooth',
    // D major pentatonic
    riffA: [
      587, null, null, null, 880, null, 740, null,
      587, null, 659, null, 740, null, 880, null,
    ],
    riffB: [
      740, null, 880, null, 988, null, 880, null,
      740, null, 659, null, 587, null, null, null,
    ],
    chord1: [293.66, 440, 587],     // D major
    chord2: [277.18, 440, 554.37],  // A major
    bassPattern: { 0: 73.42, 6: 110, 8: 73.42, 14: 138.59 },
    kickExtraI: 10,
  },
  {
    id: 'pixel_heart',
    name: 'ピクセルハート',
    subtitle: '8bit ゲームボーイ',
    genre: '8BIT',
    bpm: 144,
    accentColor: '#A879F0',
    leadShape: 'square',
    // A minor pentatonic — 빠르고 통통
    riffA: [
      440, 523.25, 659.25, 523.25, 440, null, 392, null,
      349.23, 440, 523.25, 440, 392, null, 440, null,
    ],
    riffB: [
      659.25, 783.99, 880, 783.99, 659.25, null, 523.25, null,
      440, 523.25, 659.25, 523.25, 440, null, null, null,
    ],
    chord1: [220, 261.63, 329.63],  // Am (A C E)
    chord2: [196, 246.94, 392],     // G (G B D)
    bassPattern: { 0: 55, 4: 65.41, 8: 55, 12: 65.41 },
    kickExtraI: 6,
  },
  {
    id: 'lavender_sky',
    name: 'ラベンダースカイ',
    subtitle: 'チル系シティポップ',
    genre: 'CHILL',
    bpm: 96,
    accentColor: '#9D7BD9',
    leadShape: 'triangle',
    // F major — 느리고 부드러움
    riffA: [
      523.25, null, null, 587.33, null, 698.46, null, null,
      587.33, null, 698.46, null, null, 523.25, null, null,
    ],
    riffB: [
      698.46, null, null, 880, null, 783.99, null, null,
      698.46, null, 587.33, null, 523.25, null, null, null,
    ],
    chord1: [174.61, 220, 261.63],  // F major
    chord2: [146.83, 220, 261.63],  // Dm
    bassPattern: { 0: 87.31, 8: 73.42 },
    kickExtraI: null,
  },
  {
    id: 'neon_beat',
    name: 'ネオンビート',
    subtitle: 'ハードEDM',
    genre: 'EDM',
    bpm: 150,
    accentColor: '#FF3D7F',
    leadShape: 'sawtooth',
    // E minor — 강하고 어두움
    riffA: [
      329.63, null, 392, null, 440, null, 392, null,
      329.63, null, 293.66, null, 246.94, null, 293.66, null,
    ],
    riffB: [
      493.88, null, 587.33, null, 659.25, null, 587.33, null,
      493.88, 440, 392, null, 329.63, null, null, null,
    ],
    chord1: [164.81, 196, 246.94],  // Em
    chord2: [196, 246.94, 293.66],  // G
    bassPattern: { 0: 41.20, 4: 41.20, 6: 49, 8: 41.20, 10: 41.20, 12: 55, 14: 49 },
    kickExtraI: 6,
  },
  {
    id: 'bubblegum',
    name: 'バブルガム',
    subtitle: 'ハイパーポップ',
    genre: 'HYPER POP',
    bpm: 160,
    accentColor: '#FFB840',
    leadShape: 'sawtooth',
    // G major — 가장 빠르고 통통
    riffA: [
      392, 493.88, 587.33, 493.88, 783.99, null, 659.25, null,
      587.33, 493.88, 392, null, 493.88, 587.33, 659.25, null,
    ],
    riffB: [
      783.99, null, 880, 987.77, 880, null, 783.99, 659.25,
      587.33, null, 493.88, null, 392, null, null, null,
    ],
    chord1: [196, 246.94, 293.66],  // G
    chord2: [220, 277.18, 329.63],  // A
    bassPattern: { 0: 49, 6: 73.42, 8: 49, 14: 82.41 },
    kickExtraI: 10,
  },
];

export const DEFAULT_TRACK_ID = 'sugar_rush';

export function findTrack(id) {
  return TRACKS.find(t => t.id === id) || TRACKS[0];
}

export function getTrackIndex(id) {
  const i = TRACKS.findIndex(t => t.id === id);
  return i === -1 ? 0 : i;
}
