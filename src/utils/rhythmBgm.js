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

// === BGM 엔진 ===
// level: 0 = kick only / 1 = +hat / 2 = +snare / 3 = +bass(always-on)
// fever: true 시 bass + crowd cheer 추가
export function createBgmEngine({ bpm = 120 } = {}) {
  let timer = null;
  let subbeatIdx = 0;
  let level = 0;
  let fever = false;
  let enabled = true;

  const SUBBEAT_MS = 60000 / bpm / 4; // 16분음표 간격

  const tick = () => {
    if (!enabled) return;
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const i = subbeatIdx % 16; // 4/4 한 마디 16 subbeat

    // Kick: 1박 + 3박 (i=0, 8)
    if (i === 0 || i === 8) playKick(ctx, now);
    // Hi-hat: 짝수 subbeat (매 8분음표)
    if (level >= 1 && (i % 2 === 0)) playHat(ctx, now);
    // Snare: 2박 + 4박 (i=4, 12)
    if (level >= 2 && (i === 4 || i === 12)) playSnare(ctx, now);
    // Bass: 페버나 level 3일 때 베이스 라인
    if (fever || level >= 3) {
      if (i === 0) playBass(ctx, now, 82);
      else if (i === 6) playBass(ctx, now, 110);
      else if (i === 8) playBass(ctx, now, 82);
      else if (i === 14) playBass(ctx, now, 123);
    }
    // Crowd cheer: 페버 시 마디 시작마다
    if (fever && i === 0) playCheer(ctx, now);

    subbeatIdx++;
  };

  return {
    start() {
      if (timer) return;
      subbeatIdx = 0;
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
