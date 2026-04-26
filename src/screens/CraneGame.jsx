import { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  DOLL_POOL, RARITY_INFO, CRANE_COST, CRANE_FREE_INTERVAL_MS,
  calcSuccessProb, rollRarity, rollDoll,
} from '../data/crane';
import { sfx, setSoundEnabled } from '../utils/sound';

// 기계 이미지 에셋 (public/crane/)
const MACHINE_IMG = '/crane/machine.png';
const CLAW_OPEN   = '/crane/claw_open.png';
const CLAW_CLOSED = '/crane/claw_closed.png';
const MACHINE_ASPECT = 494 / 800;  // machine.png 비율

// 유리 영역 (machine.png 기준 % 위치)
// 좌표 측정: 유리 내부 박스
const GLASS = {
  top:    '29%',
  bottom: '27%',  // = 100% - 73%  (핑크 바닥까지 포함)
  left:   '17%',
  right:  '17%',
};

// 크레인 레이아웃 (playfield 높이 % 기준)
const RAIL_TOP_PCT = 14;       // 레일 위치 (glass_bg 라이트 바로 아래)
const CLAW_IDLE_OFFSET = 6;    // idle 시 클로가 레일에서 내려와 있는 거리
const DROP_MAX_PCT = 45;       // 추가 드롭 거리 (idle → 바닥)
// 결과: idle 클로 top = 20%, 최대 드롭 top = 65%

const MACHINE_WIDTH_PX = 320;
const DOLL_SIZE = 56;

// 게임 상태: 'idle' | 'moving' | 'dropping' | 'result'
// idle     : 초기 / 결과 확인 후 다음 판 대기
// moving   : 크레인 좌우 왕복 중, STOP 대기
// dropping : 크레인 내려가는 애니메이션
// result   : 결과 표시

export default function CraneGame({ points, setPoints, onBack }) {
  const [dolls, setDolls] = useState(() => generateDolls());
  const [state, setState] = useState('idle');
  const [cranePos, setCranePos] = useState(50); // % 0~100
  const [grabbedDoll, setGrabbedDoll] = useState(null); // 성공 시 잡힌 인형
  const [lastResult, setLastResult] = useState(null); // {doll, reward, success}
  const [lastFreeAt, setLastFreeAt] = useLocalStorage('casoshi:craneFreeAt', 0);
  const [history, setHistory] = useLocalStorage('casoshi:craneHistory', []);
  const [soundOn, setSoundOn] = useLocalStorage('casoshi:craneSound', true);

  // soundOn 변경을 sound util에 동기화
  useEffect(() => { setSoundEnabled(soundOn); }, [soundOn]);

  const animationRef = useRef(null);
  const boardRef = useRef(null);
  const phaseRef = useRef(-Math.PI / 2); // 사인파 위상 (-π/2 = 왼쪽 끝)
  const grabInfoRef = useRef(null); // { doll, dropAtProgress } — drop 시나리오 제어
  const [craneDropY, setCraneDropY] = useState(0); // 0~1 (0 = 윗쪽, 1 = 바닥)
  const [clawPhase, setClawPhase] = useState('open'); // 'open' | 'closed'
  const [confetti, setConfetti] = useState([]); // 성공 시 파티클
  const [fallingDoll, setFallingDoll] = useState(null); // { id, doll, left, top, fallDistPx }

  const canFree = Date.now() - lastFreeAt > CRANE_FREE_INTERVAL_MS;
  const canPlay = canFree || points >= CRANE_COST;

  // 크레인 좌우 움직임 (사인파 기반 자연 감속/관성)
  // pos(t) = CENTER + AMPLITUDE * sin(phase)
  // 모서리에서 자연히 감속, 중앙에서 최고 속도
  useEffect(() => {
    if (state !== 'moving') return;
    const CENTER = 50;
    const AMPLITUDE = 40;          // 10% ~ 90% 사이
    const ANGULAR_SPEED = 1.8;     // rad/sec → 한 사이클 약 3.5초 (느리게)
    let lastT = performance.now();
    let rafId;                     // 로컬: 다른 애니메이션(드롭)과 공유 금지
    const loop = () => {
      const now = performance.now();
      const dt = (now - lastT) / 1000;
      lastT = now;
      phaseRef.current += dt * ANGULAR_SPEED;
      const pos = CENTER + AMPLITUDE * Math.sin(phaseRef.current);
      setCranePos(pos);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [state]);

  // 게임판 실제 width 측정 (거리 판정용)
  const getActualWidth = () => boardRef.current?.offsetWidth || MACHINE_WIDTH_PX;

  // 🎉 컨페티 파티클 생성 (x,y: playfield % 기준)
  const spawnConfetti = (x, y, count = 25, rarity = 'R') => {
    // 기본 파스텔 팔레트 + 희귀도별 강조색
    const basePalette = ['#FF6B9D', '#FFC1D8', '#FFD93D', '#A0D8F1', '#C8A4E8', '#B5E8D6', '#FFFFFF'];
    const accent = { N: null, R: '#5BA4E0', SR: '#B77EE0', SSR: '#FFB800' }[rarity];
    const palette = accent ? [...basePalette, accent, accent] : basePalette;

    const pieces = Array.from({ length: count }, (_, i) => {
      // 각도: 위쪽 반원 (-π ~ 0) 분포, 약간 상방 편향
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
      const speed = 60 + Math.random() * 110;
      const isStrip = Math.random() < 0.4;
      return {
        id: `confetti_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
        startX: x + (Math.random() - 0.5) * 6,  // 살짝 흩어짐
        startY: y,
        tx: Math.cos(angle) * speed,
        ty: Math.sin(angle) * speed,
        color: palette[Math.floor(Math.random() * palette.length)],
        shape: isStrip ? 'strip' : (Math.random() < 0.5 ? 'circle' : 'square'),
        size: 4 + Math.random() * 6,
        rotation: Math.random() * 720 - 360,
        delay: Math.random() * 80,
      };
    });
    setConfetti(prev => [...prev, ...pieces]);
    // 2초 뒤 정리
    const ids = new Set(pieces.map(p => p.id));
    setTimeout(() => {
      setConfetti(prev => prev.filter(p => !ids.has(p.id)));
    }, 2000);
  };

  const startGame = () => {
    if (state !== 'idle') return;
    // 비용 처리
    if (canFree) {
      setLastFreeAt(Date.now());
    } else {
      if (points < CRANE_COST) return;
      setPoints(p => p - CRANE_COST);
    }
    sfx.coin();
    setGrabbedDoll(null);
    setLastResult(null);
    setCraneDropY(0);
    phaseRef.current = -Math.PI / 2;   // 왼쪽 끝에서 시작 (사인파 -π/2)
    setCranePos(10);
    setState('moving');
  };

  const stopAndGrab = () => {
    if (state !== 'moving') return;
    cancelAnimationFrame(animationRef.current);
    sfx.click();
    sfx.whir();
    setState('dropping');
    setClawPhase('open');

    // 3단계 애니메이션:
    // (1) DOWN_MS : 하강 (open claw, craneDropY 0→1)
    // (2) PAUSE_MS: 바닥에서 집게 닫힘 + grab 판정
    // (3) UP_MS   : 상승 (closed claw, craneDropY 1→0, 성공 시 인형 동반, 일정 확률로 중간에 drop)
    const DOWN_MS = 1200;    // 하강 속도 느리게 (900 → 1200)
    const PAUSE_MS = 380;
    const UP_MS = 900;
    const startTime = Date.now();
    let grabResolved = false;
    let dropHappened = false;   // drop 발생 시 result state 설정은 fall 애니메이션 이후로 지연

    const animate = () => {
      const t = Date.now() - startTime;

      if (t < DOWN_MS) {
        // Phase 1: 하강
        setCraneDropY(easeInOut(t / DOWN_MS));
        animationRef.current = requestAnimationFrame(animate);
      } else if (t < DOWN_MS + PAUSE_MS) {
        // Phase 2: 바닥에서 잠시 멈춤 → 집게 닫기 + 판정 (한 번만)
        setCraneDropY(1);
        if (!grabResolved) {
          grabResolved = true;
          setClawPhase('closed');
          resolveGrab();
        }
        animationRef.current = requestAnimationFrame(animate);
      } else if (t < DOWN_MS + PAUSE_MS + UP_MS) {
        // Phase 3: 상승 (closed claw, 인형 동반)
        const p = (t - DOWN_MS - PAUSE_MS) / UP_MS;
        const currentDropY = 1 - easeInOut(p);
        setCraneDropY(currentDropY);

        // 🔽 drop 시나리오: 특정 시점에 인형 놓침
        const info = grabInfoRef.current;
        if (info && info.dropAtProgress != null && p >= info.dropAtProgress) {
          grabInfoRef.current = null;   // 재트리거 방지
          dropHappened = true;
          triggerDrop(info.doll, currentDropY);
        }
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Phase 4: 종료
        setCraneDropY(0);
        // drop이 발생한 경우 fall 애니메이션 완료 후 triggerDrop 내부 setTimeout으로 result 설정
        if (!dropHappened) {
          setState('result');
        }
      }
    };
    animationRef.current = requestAnimationFrame(animate);
  };

  // 희귀도별 drop 확률 (rare할수록 놓칠 확률↑)
  const DROP_CHANCE = { N: 0.15, R: 0.15, SR: 0.25, SSR: 0.40 };

  const resolveGrab = () => {
    const boardW = getActualWidth();
    const craneX = (cranePos / 100) * boardW;

    // 가장 가까운 인형 찾기
    let closest = null;
    let minDist = Infinity;
    for (const d of dolls) {
      const dollX = (d.x / 100) * boardW;
      const dist = Math.abs(dollX - craneX);
      if (dist < minDist) {
        minDist = dist;
        closest = d;
      }
    }

    // 1단계: miss 여부 (거리 기반)
    const successProb = calcSuccessProb(minDist);
    const gotSomething = Math.random() < successProb;

    if (!gotSomething || !closest) {
      // 🔴 MISS
      sfx.miss();
      setLastResult({ doll: closest, reward: 0, outcome: 'miss' });
      setHistory(h => [
        { ts: Date.now(), doll: closest, outcome: 'miss', reward: 0 },
        ...h.slice(0, 49),
      ]);
      grabInfoRef.current = null;
      return;
    }

    // 2단계: 일단 집긴 했는데 도중에 놓칠지 판정
    const willDrop = Math.random() < (DROP_CHANCE[closest.rarity] ?? 0.15);

    // 보드에서 제거 + 집게에 붙이기 (공통)
    setGrabbedDoll(closest);
    setDolls(ds => ds.filter(d => d.id !== closest.id));

    if (willDrop) {
      // 🟡 상승 도중 놓침 — 결과는 triggerDrop에서 처리
      grabInfoRef.current = {
        doll: closest,
        dropAtProgress: 0.30 + Math.random() * 0.40,  // rise 30~70% 지점
      };
      // 사운드/보상/컨페티/결과 없음 (drop 시점에 처리)
    } else {
      // 🟢 성공
      const rarityInfo = RARITY_INFO[closest.rarity];
      const reward = rarityInfo.reward || 0;
      if (reward > 0) setPoints(p => p + reward);

      const confettiCount = { N: 20, R: 28, SR: 40, SSR: 55 }[closest.rarity] || 24;
      spawnConfetti(closest.x, 70, confettiCount, closest.rarity);

      sfx.success();
      setLastResult({ doll: closest, reward, outcome: 'grabbed' });
      setHistory(h => [
        { ts: Date.now(), doll: closest, outcome: 'grabbed', reward },
        ...h.slice(0, 49),
      ]);
      grabInfoRef.current = null;
    }
  };

  // 🔽 상승 중에 인형을 놓침: 집게에서 떼어내고 바닥으로 낙하
  const triggerDrop = (doll, currentDropY) => {
    // 현재 집게 위치 계산 (% of playfield)
    const clawTopPct = RAIL_TOP_PCT + CLAW_IDLE_OFFSET + currentDropY * DROP_MAX_PCT;
    const dollTopPct = clawTopPct + 7;   // 집게 바로 아래에 붙어있던 인형 위치
    const shelfTargetPct = 86;           // 바닥 shelf 안착 지점
    const pfHeight = boardRef.current?.offsetHeight || 230;
    const fallDistPx = Math.max(20, (shelfTargetPct - dollTopPct) / 100 * pfHeight);

    // 집게 오픈 (놓침을 시각적으로 표현)
    setGrabbedDoll(null);
    setClawPhase('open');

    // 낙하 비주얼 스폰
    setFallingDoll({
      id: `fall_${Date.now()}`,
      doll,
      left: cranePos,
      top: dollTopPct,
      fallDistPx,
    });

    sfx.drop();

    // 결과 lastResult + history 설정
    setLastResult({ doll, reward: 0, outcome: 'dropped' });
    setHistory(h => [
      { ts: Date.now(), doll, outcome: 'dropped', reward: 0 },
      ...h.slice(0, 49),
    ]);

    // 낙하 애니메이션 종료(~900ms) 후: 인형을 보드에 복귀 + result state 전환
    const landedX = cranePos + (Math.random() - 0.5) * 8;
    setTimeout(() => {
      setDolls(ds => [
        ...ds,
        {
          ...doll,
          id: `doll_returned_${Date.now()}`,
          x: Math.max(14, Math.min(86, landedX)),
          yOffset: Math.random() * 3,
          scale: 1.0,
          rotation: (Math.random() - 0.5) * 28,  // 충격으로 기울어짐
          row: 'front',
        },
      ]);
      setFallingDoll(null);
      setState('result');
    }, 900);
  };

  const nextRound = () => {
    // 인형이 부족하면 보충
    setDolls(ds => ds.length < 3 ? generateDolls() : ds);
    setState('idle');
    setCraneDropY(0);
    setClawPhase('open');
  };

  // 24시간 다음 무료까지 남은 시간
  const freeRemainMs = CRANE_FREE_INTERVAL_MS - (Date.now() - lastFreeAt);
  const freeRemainStr = freeRemainMs > 0
    ? `${Math.floor(freeRemainMs / 3600000)}h ${Math.floor((freeRemainMs % 3600000) / 60000)}m`
    : '';

  return (
    <div className="max-w-md mx-auto px-4 py-3 min-h-[calc(100vh-64px)] flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={onBack}
          className="text-sm text-oshi-dark/70 hover:text-oshi-dark"
        >
          <img src="/icons/back.png" alt="戻る" className="w-10 h-10 object-contain" style={{ imageRendering: "pixelated" }} draggable={false} />
        </button>
        <button
          onClick={() => setSoundOn(v => !v)}
          aria-label={soundOn ? 'サウンドをオフ' : 'サウンドをオン'}
          className="active:scale-95 transition-transform"
          title={soundOn ? 'サウンド ON' : 'サウンド OFF'}
        >
          <img
            src="/icons/sound.png"
            alt=""
            className="w-10 h-10 object-contain"
            style={{
              imageRendering: 'pixelated',
              filter: soundOn ? 'none' : 'grayscale(1)',
              opacity: soundOn ? 1 : 0.4,
            }}
            draggable={false}
          />
        </button>
      </div>

      <h2 className="text-3xl text-oshi-main text-center mb-2 flex items-center justify-center gap-2 font-display">
        <img
          src="/icons/crane.png"
          alt=""
          className="w-6 h-6"
          style={{ imageRendering: 'pixelated' }}
        />
        クレーンゲーム
      </h2>

      {/* 기계 본체 */}
      <div
        className="relative mx-auto"
        style={{
          width: '100%',
          maxWidth: MACHINE_WIDTH_PX,
          aspectRatio: `${MACHINE_ASPECT}`,
        }}
      >
        {/* 기계 배경 이미지 */}
        <img
          src={MACHINE_IMG}
          alt=""
          className="absolute inset-0 w-full h-full pointer-events-none select-none"
          style={{ imageRendering: 'pixelated' }}
          draggable={false}
        />

        {/* 유리 내부 플레이필드 */}
        <div
          ref={boardRef}
          className="absolute overflow-hidden"
          style={{
            top: GLASS.top,
            bottom: GLASS.bottom,
            left: GLASS.left,
            right: GLASS.right,
          }}
        >
          {/* 배경: 유리 내부 이미지 (gradient + 반사 + 상단 라이트 + 하단 선반) */}
          <img
            src="/crane/glass_bg.png"
            alt=""
            className="absolute inset-0 w-full h-full pointer-events-none select-none"
            draggable={false}
          />

          {/* 크레인 레일 (glass_bg 상단 라이트 바로 아래에 얇게) */}
          <div
            className="absolute left-[3%] right-[3%] h-[2px] bg-gray-500/60 rounded-full"
            style={{ top: `${RAIL_TOP_PCT}%`, zIndex: 3 }}
          />

          {/* 케이블 (레일 → 집게 상단까지, idle에도 항상 보이게) */}
          <div
            className="absolute bg-slate-600"
            style={{
              left: `${cranePos}%`,
              top: `${RAIL_TOP_PCT}%`,
              width: 3,
              // idle: 6% + 4px / drop: 6% + 45% + 4px
              height: `calc(${CLAW_IDLE_OFFSET + craneDropY * DROP_MAX_PCT}% + 4px)`,
              transform: 'translateX(-1.5px)',
              boxShadow: '0 0 2px rgba(0,0,0,0.25)',
              zIndex: 4,
            }}
          />

          {/* 집게 이미지 (clawPhase에 따라 open/closed 전환)
              - 높이 고정, 너비 auto: open/closed 이미지 종횡비가 달라도 body 크기 일정 */}
          <img
            src={clawPhase === 'closed' ? CLAW_CLOSED : CLAW_OPEN}
            alt=""
            className="absolute select-none pointer-events-none"
            style={{
              left: `${cranePos}%`,
              top: `calc(${RAIL_TOP_PCT + CLAW_IDLE_OFFSET}% + ${craneDropY * DROP_MAX_PCT}%)`,
              transform: 'translateX(-50%)',
              height: 52,
              width: 'auto',
              imageRendering: 'pixelated',
              zIndex: 5,
            }}
            draggable={false}
          />

          {/* 잡힌 인형: clawPhase = 'closed' 일 때 집게에 붙어서 같이 이동 */}
          {grabbedDoll && clawPhase === 'closed' && (
            <img
              src={grabbedDoll.image}
              alt={grabbedDoll.name}
              className="absolute select-none pointer-events-none"
              style={{
                left: `${cranePos}%`,
                top: `calc(${RAIL_TOP_PCT + CLAW_IDLE_OFFSET}% + ${craneDropY * DROP_MAX_PCT}% + 40px)`,
                transform: 'translateX(-50%)',
                width: 46,
                height: 'auto',
                imageRendering: 'pixelated',
                filter: `drop-shadow(0 3px 4px rgba(0,0,0,0.25))`,
                zIndex: 4,  // 집게(5)보다 뒤 → 집게 prong이 인형 위를 덮음
              }}
              draggable={false}
            />
          )}

          {/* 🫳 놓친 인형 — 집게에서 떨어져 바닥으로 낙하 */}
          {fallingDoll && (
            <img
              key={fallingDoll.id}
              src={fallingDoll.doll.image}
              alt=""
              className="absolute select-none pointer-events-none doll-falling"
              style={{
                left: `${fallingDoll.left}%`,
                top: `${fallingDoll.top}%`,
                width: 46,
                height: 'auto',
                imageRendering: 'pixelated',
                filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.25))',
                zIndex: 4,
                '--fall-px': `${fallingDoll.fallDistPx}px`,
              }}
              draggable={false}
            />
          )}

          {/* 인형들 (glass_bg 하단 shelf 위, 2줄 쌓기) */}
          {dolls.map(d => (
            <div
              key={d.id}
              className="absolute"
              style={{
                left: `${d.x}%`,
                bottom: `calc(14% + ${d.yOffset || 0}px)`,
                transform: `translateX(-50%) rotate(${d.rotation || 0}deg) scale(${d.scale || 1})`,
                transformOrigin: 'center bottom',
                zIndex: d.row === 'front' ? 3 : 2,
                filter: d.row === 'back'
                  ? 'drop-shadow(0 2px 2px rgba(0,0,0,0.15)) brightness(0.94)'
                  : 'drop-shadow(0 2px 2px rgba(0,0,0,0.22))',
              }}
            >
              <div className="relative">
                <img
                  src={d.image}
                  alt={d.name}
                  className="select-none pointer-events-none block"
                  style={{
                    width: DOLL_SIZE,
                    height: 'auto',
                    imageRendering: 'pixelated',
                  }}
                  draggable={false}
                />
                {d.rarity !== 'N' && (
                  <span
                    className="absolute -top-1 -right-1 font-black text-white rounded-full"
                    style={{
                      background: RARITY_INFO[d.rarity].color,
                      fontSize: 9,
                      padding: '1px 4px',
                      lineHeight: 1,
                    }}
                  >
                    {d.rarity}
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* 🎉 컨페티 파티클 */}
          {confetti.map(p => (
            <div
              key={p.id}
              className="confetti-piece absolute pointer-events-none"
              style={{
                left: `${p.startX}%`,
                top: `${p.startY}%`,
                width: p.size,
                height: p.shape === 'strip' ? p.size * 0.4 : p.size,
                background: p.color,
                borderRadius: p.shape === 'circle' ? '50%' : '1px',
                '--tx': `${p.tx}px`,
                '--ty': `${p.ty}px`,
                '--rot': `${p.rotation}deg`,
                animationDelay: `${p.delay}ms`,
                zIndex: 10,
                willChange: 'transform, opacity',
              }}
            />
          ))}
        </div>

        {/* 투명 탭 영역: 기계 하단 컨트롤 패널 위 전체를 덮음 → 핑크 별 버튼을 누르는 느낌 */}
        {state !== 'dropping' && (
          <button
            onClick={
              state === 'idle' ? startGame :
              state === 'moving' ? stopAndGrab :
              nextRound
            }
            disabled={state === 'idle' && !canPlay}
            aria-label={
              state === 'idle' ? 'Start' :
              state === 'moving' ? 'Stop' :
              'Next'
            }
            className="absolute left-0 right-0 cursor-pointer active:scale-95 transition-transform disabled:cursor-not-allowed disabled:opacity-0"
            style={{
              top: '74%',
              bottom: 0,
              background: 'transparent',
            }}
          />
        )}
      </div>

      {/* 상태 안내 라벨 (기계 아래) */}
      <div className="mt-3 text-center">
        {state === 'idle' && (
          <div className={`inline-block px-4 py-2 rounded-full font-black text-sm shadow ${
            canPlay ? 'bg-oshi-main text-white' : 'bg-gray-300 text-gray-500'
          }`}>
            {canFree ? '🎁 無料でプレイ！タップ' : `▶ スタート (${CRANE_COST}pt) — タップ`}
          </div>
        )}
        {state === 'moving' && (
          <div className="inline-block px-4 py-2 rounded-full bg-red-500 text-white font-black text-base shadow animate-pulse">
            ⏹ STOP！ タップ
          </div>
        )}
        {state === 'dropping' && (
          <div className="inline-block px-4 py-2 rounded-full bg-pink-200 text-pink-700 font-bold text-sm shadow">
            つかめるかな？...
          </div>
        )}
        {state === 'result' && (
          <div className="inline-block px-4 py-2 rounded-full bg-oshi-main text-white font-black text-sm shadow">
            ▶ もう一回 — タップ
          </div>
        )}
      </div>

      {/* 결과 오버레이 */}
      {state === 'result' && lastResult && (
        <ResultOverlay result={lastResult} onClose={nextRound} />
      )}

      {/* 안내/이력 */}
      <div className="mt-3 text-center text-[10px] text-oshi-dark/60">
        {canFree
          ? '🎁 今日の無料プレイ利用可能！'
          : `次の無料まで ${freeRemainStr}`}
      </div>

      {/* 최근 이력 */}
      {history.length > 0 && (
        <div className="mt-3 bg-white/70 rounded-xl border border-oshi-sub p-2">
          <div className="text-[10px] font-bold text-oshi-dark/60 mb-1">最近のプレイ</div>
          <div className="flex gap-1 overflow-x-auto">
            {history.slice(0, 12).map((h, i) => {
              const out = h.outcome || (h.success ? 'grabbed' : 'miss');
              const bgClass = out === 'grabbed'
                ? 'bg-white border border-oshi-sub'
                : out === 'dropped'
                  ? 'bg-yellow-50 border border-yellow-200'
                  : 'bg-gray-100 opacity-50';
              const title = out === 'grabbed'
                ? `${h.doll?.name} ×1`
                : out === 'dropped'
                  ? `${h.doll?.name ?? ''} (落とした)`
                  : 'miss';
              return (
                <div
                  key={i}
                  className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${bgClass}`}
                  title={title}
                >
                  {out === 'grabbed' && h.doll?.image && (
                    <img
                      src={h.doll.image}
                      alt={h.doll.name}
                      className="select-none pointer-events-none"
                      style={{ width: 28, height: 'auto', imageRendering: 'pixelated' }}
                      draggable={false}
                    />
                  )}
                  {out === 'dropped' && h.doll?.image && (
                    <img
                      src={h.doll.image}
                      alt={h.doll.name}
                      className="select-none pointer-events-none"
                      style={{
                        width: 24,
                        height: 'auto',
                        imageRendering: 'pixelated',
                        filter: 'grayscale(0.6) opacity(0.7)',
                        transform: 'rotate(-15deg)',
                      }}
                      draggable={false}
                    />
                  )}
                  {out === 'miss' && (
                    <img
                      src="/icons/miss.png"
                      alt="MISS"
                      className="w-6 h-6 object-contain"
                      style={{ imageRendering: 'pixelated' }}
                      draggable={false}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        @keyframes lift {
          0%   { transform: translate(-50%, 0) scale(0.8); opacity: 0.5; }
          30%  { transform: translate(-50%, -8px) scale(1.1); opacity: 1; }
          100% { transform: translate(-50%, -20px) scale(1); opacity: 1; }
        }
        /* 🎉 컨페티: 위로 터지면서 아치를 그리며 떨어짐 */
        .confetti-piece {
          transform: translate(-50%, -50%);
          opacity: 1;
          animation: confetti-fly 1.6s cubic-bezier(0.22, 0.7, 0.35, 1) forwards;
        }
        @keyframes confetti-fly {
          0% {
            transform: translate(-50%, -50%) rotate(0);
            opacity: 1;
          }
          35% {
            transform:
              translate(calc(-50% + var(--tx) * 0.75), calc(-50% + var(--ty) * 1.0))
              rotate(calc(var(--rot) * 0.4));
            opacity: 1;
          }
          100% {
            transform:
              translate(calc(-50% + var(--tx)), calc(-50% + var(--ty) + 90px))
              rotate(var(--rot));
            opacity: 0;
          }
        }
        /* 🫳 인형 낙하: 집게에서 떨어져 바닥으로 */
        .doll-falling {
          transform: translateX(-50%);
          animation: doll-fall 0.85s cubic-bezier(0.45, 0.02, 0.78, 0.5) forwards;
        }
        @keyframes doll-fall {
          0%   { transform: translate(-50%, 0) rotate(0); }
          60%  { transform: translate(calc(-50% + 6px), calc(var(--fall-px, 120px) * 0.75)) rotate(-18deg); }
          100% { transform: translate(calc(-50% + 4px), var(--fall-px, 120px)) rotate(-30deg); }
        }
      `}</style>
    </div>
  );
}

// ===== helpers =====
function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function generateDolls() {
  // 5~6마리 인형을 2줄 (뒤/앞) 로 쌓아 배치
  // 뒤줄: 살짝 위로 (y offset), 약간 작게, zIndex 낮음
  // 앞줄: 기본 위치, 정상 크기, zIndex 높음 → 뒤줄을 일부 가림
  const dolls = [];
  const baseTime = Date.now();

  const backCount = 2 + Math.floor(Math.random() * 2);   // 2~3
  const frontCount = 3;                                   // 3

  // 뒤줄
  for (let i = 0; i < backCount; i++) {
    const baseX = 18 + (i + 0.5) * (64 / backCount);  // 18~82% 고르게
    const rarity = rollRarity();
    const template = rollDoll(rarity);
    dolls.push({
      ...template,
      id: `doll_${baseTime}_b${i}`,
      x: baseX + (Math.random() - 0.5) * 6,
      yOffset: 14 + Math.random() * 6,      // 14~20px 위로
      scale: 0.85 + Math.random() * 0.06,   // 0.85~0.91
      rotation: (Math.random() - 0.5) * 14, // ±7°
      row: 'back',
    });
  }
  // 앞줄 (뒤줄과 교차되도록 offset)
  for (let i = 0; i < frontCount; i++) {
    const baseX = 15 + (i + 0.5) * (70 / frontCount);
    const rarity = rollRarity();
    const template = rollDoll(rarity);
    dolls.push({
      ...template,
      id: `doll_${baseTime}_f${i}`,
      x: baseX + (Math.random() - 0.5) * 5,
      yOffset: Math.random() * 3,           // 거의 바닥
      scale: 1.0,
      rotation: (Math.random() - 0.5) * 18, // ±9°
      row: 'front',
    });
  }
  return dolls;
}

// ===== 결과 오버레이 =====
function ResultOverlay({ result, onClose }) {
  const { doll, reward, outcome, success } = result;
  // outcome 기반이 우선, 없으면 기존 success 필드로 폴백 (히스토리 호환)
  const resolvedOutcome = outcome || (success ? 'grabbed' : 'miss');

  // 🔴 MISS — 집게가 빈 손으로 닫힘
  if (resolvedOutcome === 'miss') {
    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div className="bg-white rounded-2xl p-5 max-w-xs text-center shadow-2xl">
          <div className="text-5xl mb-2">😢</div>
          <div className="text-lg font-black text-oshi-dark mb-1">ざんねん！</div>
          <div className="text-xs text-oshi-dark/70 mb-3">うまく掴めなかった...</div>
          <button
            onClick={onClose}
            className="w-full py-2 rounded-full bg-oshi-main text-white font-bold text-sm"
          >
            もう一回
          </button>
        </div>
      </div>
    );
  }

  // 🟡 DROPPED — 잡았지만 상승 중 놓침
  if (resolvedOutcome === 'dropped') {
    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div className="bg-white rounded-2xl p-5 max-w-xs text-center shadow-2xl">
          <div className="text-4xl mb-1">💦</div>
          <div className="text-lg font-black text-oshi-dark mb-1">あと少し...！</div>
          <div className="text-xs text-oshi-dark/70 mb-3">落としちゃった</div>
          {doll && (
            <div className="flex justify-center mb-3">
              <img
                src={doll.image}
                alt={doll.name}
                className="select-none pointer-events-none"
                style={{
                  width: 90,
                  height: 'auto',
                  imageRendering: 'pixelated',
                  filter: 'grayscale(0.6) opacity(0.8)',
                  transform: 'rotate(-15deg)',
                }}
                draggable={false}
              />
            </div>
          )}
          <button
            onClick={onClose}
            className="w-full py-2 rounded-full bg-oshi-main text-white font-bold text-sm"
          >
            リベンジ！
          </button>
        </div>
      </div>
    );
  }

  // 🟢 GRABBED — 성공
  const info = RARITY_INFO[doll.rarity];
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-xs text-center shadow-2xl relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* 배경 그라데이션 */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at center, ${info.color} 0%, transparent 70%)`,
          }}
        />
        <div className="relative">
          <div className="text-xs font-black tracking-widest" style={{ color: info.color }}>
            ★ {info.label} ★
          </div>
          <div className="relative flex justify-center my-3">
            <img
              src={doll.image}
              alt={doll.name}
              className="select-none pointer-events-none"
              style={{
                width: 140,
                height: 'auto',
                imageRendering: 'pixelated',
                filter: info.glow !== 'none' ? `drop-shadow(${info.glow})` : undefined,
                animation: 'winPop 0.5s ease-out',
              }}
              draggable={false}
            />
          </div>
          <div className="text-lg font-black text-oshi-dark">{doll.name}</div>
          <div className="text-xs text-oshi-dark/60 mt-1">GET！</div>
          {reward > 0 && (
            <div className="mt-3 inline-block bg-oshi-bg px-3 py-1 rounded-full text-xs font-bold text-oshi-main">
              +{reward} ポイント
            </div>
          )}
          <button
            onClick={onClose}
            className="mt-4 w-full py-2 rounded-full bg-oshi-main text-white font-bold text-sm"
          >
            つづける
          </button>
        </div>
        <style>{`
          @keyframes winPop {
            0%   { transform: scale(0) rotate(-20deg); opacity: 0; }
            60%  { transform: scale(1.3) rotate(10deg); opacity: 1; }
            100% { transform: scale(1) rotate(0); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}
