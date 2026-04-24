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

// 크레인 드롭 범위 (playfield 높이 % 기준)
// 시작: 14% (상단 라이트 아래 레일)
// 끝: 14% + 51% = 65% (shelf 위 인형에 닿는 위치)
const DROP_MAX_PCT = 51;

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
  const [craneDropY, setCraneDropY] = useState(0); // 0~1 (0 = 윗쪽, 1 = 바닥)
  const [confetti, setConfetti] = useState([]); // 성공 시 파티클

  const canFree = Date.now() - lastFreeAt > CRANE_FREE_INTERVAL_MS;
  const canPlay = canFree || points >= CRANE_COST;

  // 크레인 좌우 움직임 (사인파 기반 자연 감속/관성)
  // pos(t) = CENTER + AMPLITUDE * sin(phase)
  // 모서리에서 자연히 감속, 중앙에서 최고 속도
  useEffect(() => {
    if (state !== 'moving') return;
    const CENTER = 50;
    const AMPLITUDE = 40;          // 10% ~ 90% 사이
    const ANGULAR_SPEED = 2.3;     // rad/sec → 한 사이클 약 2.7초
    let lastT = performance.now();
    const loop = () => {
      const now = performance.now();
      const dt = (now - lastT) / 1000;
      lastT = now;
      phaseRef.current += dt * ANGULAR_SPEED;
      const pos = CENTER + AMPLITUDE * Math.sin(phaseRef.current);
      setCranePos(pos);
      animationRef.current = requestAnimationFrame(loop);
    };
    animationRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationRef.current);
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

    // 크레인 내려가기 애니메이션 (1초)
    const startTime = Date.now();
    const dropAnim = () => {
      const t = Math.min(1, (Date.now() - startTime) / 900);
      setCraneDropY(easeInOut(t));
      if (t < 1) {
        requestAnimationFrame(dropAnim);
      } else {
        // 집기 판정
        resolveGrab();
      }
    };
    requestAnimationFrame(dropAnim);
  };

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

    // 성공 판정
    const successProb = calcSuccessProb(minDist);
    const success = Math.random() < successProb;

    if (success && closest) {
      // 인형 판정: 가장 가까운 인형의 희귀도에 따라, 단 랜덤 편차 있음
      // 간단히: 잡힌 인형 = 보드에 있던 그 인형 그대로 사용
      const rarityInfo = RARITY_INFO[closest.rarity];

      // 보상 계산
      let reward = rarityInfo.reward || 0;
      setGrabbedDoll(closest);
      setLastResult({ doll: closest, reward, success: true });

      // 보드에서 제거하고 애니메이션용으로 띄움
      setDolls(ds => ds.filter(d => d.id !== closest.id));

      // 포인트 지급
      if (reward > 0) setPoints(p => p + reward);

      // 🎉 컨페티 파티클 (희귀도에 따라 개수 조정)
      const confettiCount = { N: 20, R: 28, SR: 40, SSR: 55 }[closest.rarity] || 24;
      spawnConfetti(closest.x, 70, confettiCount, closest.rarity);

      // 효과음
      sfx.success();

      // 이력 저장
      setHistory(h => [
        { ts: Date.now(), doll: closest, success: true, reward },
        ...h.slice(0, 49),
      ]);
    } else {
      sfx.miss();
      setLastResult({ doll: closest, reward: 0, success: false });
      setHistory(h => [
        { ts: Date.now(), doll: closest, success: false, reward: 0 },
        ...h.slice(0, 49),
      ]);
    }

    setTimeout(() => setState('result'), 600);
  };

  const nextRound = () => {
    // 인형이 부족하면 보충
    setDolls(ds => ds.length < 3 ? generateDolls() : ds);
    setState('idle');
    setCraneDropY(0);
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
          ← 戻る
        </button>
        <button
          onClick={() => setSoundOn(v => !v)}
          aria-label={soundOn ? 'サウンドをオフ' : 'サウンドをオン'}
          className="w-8 h-8 rounded-full bg-white/70 border border-oshi-sub/50 flex items-center justify-center text-base active:scale-95 transition-transform"
          title={soundOn ? 'サウンド ON' : 'サウンド OFF'}
        >
          {soundOn ? '🔊' : '🔇'}
        </button>
      </div>

      <h2 className="text-lg font-black text-oshi-dark text-center mb-2">
        🪝 クレーンゲーム
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
            className="absolute left-[3%] right-[3%] top-[14%] h-[2px] bg-gray-500/40 rounded-full"
            style={{ zIndex: 3 }}
          />

          {/* 케이블 (레일 → 집게 상단까지 직선) */}
          <div
            className="absolute bg-gray-400/90"
            style={{
              left: `${cranePos}%`,
              top: '14%',
              width: 2,
              height: `calc(${craneDropY * DROP_MAX_PCT}% + 4px)`,
              transform: 'translateX(-1px)',
              zIndex: 4,
            }}
          />

          {/* 집게 이미지 */}
          <img
            src={state === 'dropping' && craneDropY > 0.85 ? CLAW_CLOSED : CLAW_OPEN}
            alt=""
            className="absolute select-none pointer-events-none"
            style={{
              left: `${cranePos}%`,
              top: `calc(14% + ${craneDropY * DROP_MAX_PCT}%)`,
              transform: 'translateX(-50%)',
              width: 46,
              imageRendering: 'pixelated',
              zIndex: 5,
            }}
            draggable={false}
          />

          {/* 잡힌 인형 (집게 아래에서 살짝 위로 lift) */}
          {grabbedDoll && state === 'result' && (
            <img
              src={grabbedDoll.image}
              alt={grabbedDoll.name}
              className="absolute select-none pointer-events-none"
              style={{
                left: `${cranePos}%`,
                top: `calc(14% + ${craneDropY * DROP_MAX_PCT}% + 48px)`,
                transform: 'translateX(-50%)',
                width: 44,
                height: 'auto',
                imageRendering: 'pixelated',
                animation: 'lift 0.8s ease-out forwards',
                filter: `drop-shadow(0 3px 4px rgba(0,0,0,0.25))`,
                zIndex: 6,
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
            {history.slice(0, 12).map((h, i) => (
              <div
                key={i}
                className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                  h.success ? 'bg-white border border-oshi-sub' : 'bg-gray-100 opacity-50 text-xl'
                }`}
                title={h.success ? `${h.doll?.name} ×1` : 'miss'}
              >
                {h.success && h.doll?.image ? (
                  <img
                    src={h.doll.image}
                    alt={h.doll.name}
                    className="select-none pointer-events-none"
                    style={{ width: 28, height: 'auto', imageRendering: 'pixelated' }}
                    draggable={false}
                  />
                ) : '❌'}
              </div>
            ))}
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
  const { doll, reward, success } = result;

  if (!success) {
    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div className="bg-white rounded-2xl p-5 max-w-xs text-center shadow-2xl">
          <div className="text-5xl mb-2">😢</div>
          <div className="text-lg font-black text-oshi-dark mb-1">ざんねん！</div>
          <div className="text-xs text-oshi-dark/70 mb-3">あと少しだったね...</div>
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
