import { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  DOLL_POOL, RARITY_INFO, CRANE_COST, CRANE_FREE_INTERVAL_MS,
  calcSuccessProb, rollRarity, rollDoll,
} from '../data/crane';

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

// 크레인 드롭 범위 (playfield 높이 % 기준, 집게 상단 기준)
const DROP_MAX_PCT = 62;

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
  const [craneDir, setCraneDir] = useState(1);   // 1 = 오른쪽, -1 = 왼쪽
  const [grabbedDoll, setGrabbedDoll] = useState(null); // 성공 시 잡힌 인형
  const [lastResult, setLastResult] = useState(null); // {doll, reward, success}
  const [lastFreeAt, setLastFreeAt] = useLocalStorage('casoshi:craneFreeAt', 0);
  const [history, setHistory] = useLocalStorage('casoshi:craneHistory', []);

  const animationRef = useRef(null);
  const boardRef = useRef(null);
  const [craneDropY, setCraneDropY] = useState(0); // 0~1 (0 = 윗쪽, 1 = 바닥)

  const canFree = Date.now() - lastFreeAt > CRANE_FREE_INTERVAL_MS;
  const canPlay = canFree || points >= CRANE_COST;

  // 크레인 좌우 움직임 애니메이션
  useEffect(() => {
    if (state !== 'moving') return;
    const loop = () => {
      setCranePos(p => {
        let next = p + craneDir * 1.8;
        if (next >= 90) { setCraneDir(-1); next = 90; }
        else if (next <= 10) { setCraneDir(1); next = 10; }
        return next;
      });
      animationRef.current = requestAnimationFrame(loop);
    };
    animationRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationRef.current);
  }, [state, craneDir]);

  // 게임판 실제 width 측정 (거리 판정용)
  const getActualWidth = () => boardRef.current?.offsetWidth || MACHINE_WIDTH_PX;

  const startGame = () => {
    if (state !== 'idle') return;
    // 비용 처리
    if (canFree) {
      setLastFreeAt(Date.now());
    } else {
      if (points < CRANE_COST) return;
      setPoints(p => p - CRANE_COST);
    }
    setGrabbedDoll(null);
    setLastResult(null);
    setCraneDropY(0);
    setCranePos(10);
    setCraneDir(1);
    setState('moving');
  };

  const stopAndGrab = () => {
    if (state !== 'moving') return;
    cancelAnimationFrame(animationRef.current);
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

      // 이력 저장
      setHistory(h => [
        { ts: Date.now(), doll: closest, success: true, reward },
        ...h.slice(0, 49),
      ]);
    } else {
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
      <button
        onClick={onBack}
        className="text-sm text-oshi-dark/70 hover:text-oshi-dark self-start mb-2"
      >
        ← 戻る
      </button>

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
          {/* 크레인 레일 */}
          <div className="absolute left-0 right-0 top-0 h-[2px] bg-gray-500/60 rounded-full" />

          {/* 크레인 (레일 → 집게) */}
          <div
            className="absolute top-0"
            style={{
              left: `${cranePos}%`,
              transform: 'translateX(-50%)',
              zIndex: 5,
            }}
          >
            {/* 케이블 */}
            <div
              className="absolute left-1/2 -translate-x-1/2 bg-gray-400"
              style={{
                top: 0,
                width: 2,
                height: `calc(${craneDropY * DROP_MAX_PCT}% + 2px)`,
              }}
            />
            {/* 집게 이미지 */}
            <img
              src={state === 'dropping' && craneDropY > 0.85 ? CLAW_CLOSED : CLAW_OPEN}
              alt=""
              className="absolute left-1/2 -translate-x-1/2 select-none pointer-events-none"
              style={{
                top: `${craneDropY * DROP_MAX_PCT}%`,
                width: 46,
                imageRendering: 'pixelated',
              }}
              draggable={false}
            />
            {/* 잡힌 인형 (집게 아래에서 살짝 위로 lift) */}
            {grabbedDoll && state === 'result' && (
              <div
                className="absolute left-1/2 -translate-x-1/2"
                style={{
                  top: `calc(${craneDropY * DROP_MAX_PCT}% + 40px)`,
                  fontSize: 36,
                  lineHeight: 1,
                  animation: 'lift 0.8s ease-out forwards',
                  filter: `drop-shadow(0 3px 4px rgba(0,0,0,0.25))`,
                }}
              >
                {grabbedDoll.emoji}
              </div>
            )}
          </div>

          {/* 인형들 (핑크 바닥 위) */}
          {dolls.map(d => (
            <div
              key={d.id}
              className="absolute"
              style={{
                left: `${d.x}%`,
                bottom: 2,
                transform: 'translateX(-50%)',
                fontSize: DOLL_SIZE * 0.65,
                lineHeight: 1,
                filter: `drop-shadow(0 2px 2px rgba(0,0,0,0.2))`,
                zIndex: 2,
              }}
            >
              <div className="relative">
                {d.emoji}
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
                className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-xl ${
                  h.success ? 'bg-white border border-oshi-sub' : 'bg-gray-100 opacity-50'
                }`}
                title={h.success ? `${h.doll?.name} ×1` : 'miss'}
              >
                {h.success ? h.doll?.emoji : '❌'}
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
      `}</style>
    </div>
  );
}

// ===== helpers =====
function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function generateDolls() {
  // 3마리 인형 생성 (x: 15~85% 범위에서 겹치지 않게)
  const slots = [20, 50, 80];
  return slots.map((x, i) => {
    const rarity = rollRarity();
    const template = rollDoll(rarity);
    return {
      ...template,
      id: `doll_${Date.now()}_${i}`,
      x: x + (Math.random() * 8 - 4), // 약간 흔들기
    };
  });
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
          <div
            className="text-7xl my-3"
            style={{
              filter: info.glow !== 'none' ? `drop-shadow(${info.glow})` : undefined,
              animation: 'winPop 0.5s ease-out',
            }}
          >
            {doll.emoji}
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
