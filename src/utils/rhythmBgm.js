// 리듬모드 BGM 레이어 엔진 — Web Audio 신디사이즈
// 레벨에 따라 레이어가 쌓임: kick → +hat → +snare → +bass(fever)

let _ctx = null;
function getCtx() {
  if (typeof window === 'undefined') return null;
  if (!_ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    _ctx = new AC();
  }
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

// === 개별 드럼 사운드 ===
function playKick(ctx, time) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.connect(g).connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(130, time);
  osc.frequency.exponentialRampToValueAtTime(42, time + 0.13);
  g.gain.setValueAtTime(0.22, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.17);
  osc.start(time);
  osc.stop(time + 0.2);
}

function playHat(ctx, time, gain = 0.035) {
  const bufferSize = ctx.sampleRate * 0.035;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 6500;
  const g = ctx.createGain();
  g.gain.value = gain;
  src.connect(hp).connect(g).connect(ctx.destination);
  src.start(time);
}

function playSnare(ctx, time) {
  // noise burst + tonal
  const bufferSize = ctx.sampleRate * 0.09;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 2000;
  const g = ctx.createGain();
  g.gain.value = 0.07;
  src.connect(bp).connect(g).connect(ctx.destination);
  src.start(time);
  // 톤 성분
  const osc = ctx.createOscillator();
  const og = ctx.createGain();
  osc.connect(og).connect(ctx.destination);
  osc.type = 'triangle';
  osc.frequency.value = 180;
  og.gain.setValueAtTime(0.04, time);
  og.gain.exponentialRampToValueAtTime(0.001, time + 0.07);
  osc.start(time);
  osc.stop(time + 0.1);
}

function playBass(ctx, time, freq = 82) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 400;
  osc.connect(lp).connect(g).connect(ctx.destination);
  osc.type = 'sawtooth';
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.065, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.22);
  osc.start(time);
  osc.stop(time + 0.26);
}

function playCheer(ctx, time) {
  const bufferSize = ctx.sampleRate * 0.75;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    const env = Math.sin((i / bufferSize) * Math.PI); // 페이드 인/아웃
    data[i] = (Math.random() * 2 - 1) * env * 0.35;
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 1400;
  bp.Q.value = 0.5;
  const g = ctx.createGain();
  g.gain.value = 0.06;
  src.connect(bp).connect(g).connect(ctx.destination);
  src.start(time);
}

// 멜로디 리드 (pluck-like 합성 사운드)
function playLead(ctx, time, freq, duration = 0.22, gain = 0.05) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(3200, time);
  lp.frequency.exponentialRampToValueAtTime(700, time + duration * 0.7);
  osc.connect(lp).connect(g).connect(ctx.destination);
  osc.type = 'sawtooth';
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, time);
  g.gain.linearRampToValueAtTime(gain, time + 0.008);
  g.gain.exponentialRampToValueAtTime(0.001, time + duration);
  osc.start(time);
  osc.stop(time + duration + 0.04);
}

// 코드 스탭 (3음 동시)
function playChord(ctx, time, freqs, duration = 0.28, gain = 0.028) {
  freqs.forEach(f => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2200;
    osc.connect(lp).connect(g).connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.value = f;
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(gain, time + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, time + duration);
    osc.start(time);
    osc.stop(time + duration + 0.02);
  });
}

// 박수 (3연발 짧은 노이즈)
function playClap(ctx, time) {
  [0, 0.011, 0.022].forEach(offset => {
    const bufferSize = Math.floor(ctx.sampleRate * 0.035);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1600;
    bp.Q.value = 1.2;
    const g = ctx.createGain();
    g.gain.value = 0.028;
    src.connect(bp).connect(g).connect(ctx.destination);
    src.start(time + offset);
  });
}

// D 메이저 펜타토닉 리프 (16 subbeat = 1마디) — 밝은 J-pop 느낌
// null = 쉼표
const LEAD_RIFF_A = [
  587, null, null, null, 880, null, 740, null,   // D5, A5, F#5
  587, null, 659, null, 740, null, 880, null,    // D5, E5, F#5, A5
];
const LEAD_RIFF_B = [
  740, null, 880, null, 988, null, 880, null,    // F#5, A5, B5, A5 (훅)
  740, null, 659, null, 587, null, null, null,   // F#5, E5, D5
];

// 코드 스탭 (fever 시)
const CHORD_D = [293.66, 440, 587];              // D3 A3 D4 (D major 강조)
const CHORD_A = [277.18, 440, 554.37];           // C#3 A3 C#4 (A major)

// === BGM 엔진 ===
// level: 0 = kick only / 1 = +hat+lead / 2 = +snare+clap / 3 = +bass/chord
// fever: true 시 bass + crowd cheer + chord stab 추가
export function createBgmEngine({ bpm = 128 } = {}) {
  let timer = null;
  let subbeatIdx = 0;
  let measureIdx = 0;   // 2마디마다 리프 교체
  let level = 0;
  let fever = false;
  let enabled = true;

  const SUBBEAT_MS = 60000 / bpm / 4; // 16분음표 간격

  const tick = () => {
    if (!enabled) return;
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const i = subbeatIdx % 16;

    // 마디 카운트
    if (i === 0 && subbeatIdx > 0) measureIdx++;

    // Kick: 1박 + 3박 (i=0, 8) + 고레벨에선 살짝 신코페이션 (i=10)
    if (i === 0 || i === 8) playKick(ctx, now);
    if (level >= 3 && i === 10) playKick(ctx, now);

    // Hi-hat: 짝수 subbeat (매 8분음표)
    if (level >= 1 && (i % 2 === 0)) playHat(ctx, now);

    // Snare: 2박 + 4박 (i=4, 12)
    if (level >= 2 && (i === 4 || i === 12)) playSnare(ctx, now);
    // Clap: snare 와 함께 (레벨 2부터)
    if (level >= 2 && (i === 4 || i === 12)) playClap(ctx, now);

    // 🎵 멜로디 리드: level 1부터 등장, 2마디마다 리프 교체
    if (level >= 1) {
      const riff = (measureIdx % 2 === 0) ? LEAD_RIFF_A : LEAD_RIFF_B;
      const leadFreq = riff[i];
      if (leadFreq) {
        // 페버/사비는 좀 더 강조
        const leadGain = fever ? 0.065 : level >= 2 ? 0.055 : 0.045;
        playLead(ctx, now, leadFreq, 0.2, leadGain);
      }
    }

    // Bass: 페버 / 높은 레벨 시 활발한 베이스 라인
    if (fever || level >= 3) {
      if (i === 0) playBass(ctx, now, 73.42);   // D2
      else if (i === 6) playBass(ctx, now, 110); // A2
      else if (i === 8) playBass(ctx, now, 73.42);
      else if (i === 14) playBass(ctx, now, 138.59); // C#3
    }

    // 🎹 코드 스탭: 페버 시 마디 시작마다 화음 폭발
    if (fever) {
      if (i === 0) playChord(ctx, now, CHORD_D, 0.32);
      if (i === 8) playChord(ctx, now, CHORD_A, 0.32);
    }

    // Crowd cheer: 페버 시 마디 시작마다
    if (fever && i === 0) playCheer(ctx, now);

    subbeatIdx++;
  };

  return {
    start() {
      if (timer) return;
      subbeatIdx = 0;
      measureIdx = 0;
      tick();
      timer = setInterval(tick, SUBBEAT_MS);
    },
    stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    },
    setLevel(n) { level = Math.max(0, Math.min(3, n)); },
    setFever(f) { fever = !!f; },
    setEnabled(e) { enabled = !!e; },
  };
}
