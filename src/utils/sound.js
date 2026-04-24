// 효과음 — Web Audio API 신디사이즈 (오디오 파일 없음)
// 사용: import { sfx } from '@/utils/sound';  sfx.click();

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

// 한 음을 envelope와 함께 재생
function playNote({ freq, duration = 0.15, type = 'sine', gain = 0.18, delay = 0 }) {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.connect(g).connect(ctx.destination);
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = ctx.currentTime + delay;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.008);           // attack
  g.gain.exponentialRampToValueAtTime(0.001, t0 + duration);  // decay
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

// 주파수 스윕 (descending whir 등)
function playSweep({ from, to, duration = 0.8, type = 'sawtooth', gain = 0.05 }) {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.connect(g).connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(from, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(to, ctx.currentTime + duration);
  g.gain.setValueAtTime(gain, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.start();
  osc.stop(ctx.currentTime + duration + 0.02);
}

let _enabled = true;

export const setSoundEnabled = (v) => { _enabled = !!v; };
export const isSoundEnabled = () => _enabled;

// 조건부 실행 래퍼
const gated = (fn) => (...args) => { if (_enabled) fn(...args); };

export const sfx = {
  // 버튼 클릭: 짧은 square 비프
  click: gated(() => {
    playNote({ freq: 880, duration: 0.07, type: 'square', gain: 0.10 });
  }),
  // 코인 투입: 청아한 2음
  coin: gated(() => {
    playNote({ freq: 1047, duration: 0.09, type: 'sine', gain: 0.18 });
    playNote({ freq: 1568, duration: 0.13, type: 'sine', gain: 0.16, delay: 0.06 });
  }),
  // 크레인 하강: 낮아지는 sawtooth
  whir: gated(() => {
    playSweep({ from: 420, to: 160, duration: 0.85, type: 'sawtooth', gain: 0.05 });
  }),
  // 성공: 상승 아르페지오 (C major: C E G C)
  success: gated(() => {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      playNote({ freq: f, duration: 0.22, type: 'sine', gain: 0.18, delay: i * 0.09 });
    });
  }),
  // 미스: 하강 3음
  miss: gated(() => {
    [440, 349.23, 277.18].forEach((f, i) => {
      playNote({ freq: f, duration: 0.25, type: 'triangle', gain: 0.14, delay: i * 0.12 });
    });
  }),
  // 놓침: 빠르게 떨어지는 wobble + 아쉬운 느낌
  drop: gated(() => {
    playSweep({ from: 520, to: 130, duration: 0.42, type: 'triangle', gain: 0.13 });
    // 낙하 끝 thud
    playNote({ freq: 90, duration: 0.2, type: 'sine', gain: 0.18, delay: 0.42 });
  }),
};
