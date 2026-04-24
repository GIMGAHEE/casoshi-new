import { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  DOLL_POOL, RARITY_INFO, CRANE_COST, CRANE_FREE_INTERVAL_MS,
  calcSuccessProb, rollRarity, rollDoll,
} from '../data/crane';

// 게임판 내부 좌표계는 % 기반
const MACHINE_WIDTH_PX = 320;   // 내부 바닥 기준 너비 (판정용 px)
const DOLL_SIZE = 56;           // 인형 렌더 크기 (px)

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
      <div className="relative mx-auto" style={{ width: '100%', maxWidth: 340 }}>
        {/* 기계 프레임 */}
        <div className="relative bg-gradient-to-b from-pink-100 via-pink-50 to-pink-100 rounded-2xl p-2 shadow-2xl border-4 border-pink-300"
          style={{
            boxShadow: '0 8px 0 #E498BD, 0 12px 30px rgba(0,0,0,0.1)',
          }}>
          {/* 상단 로고/라벨 */}
          <div className="text-center mb-1">
            <div className="text-xs font-black text-pink-500 tracking-wider">
              ♡ LUCKY CATCHER ♡
            </div>
          </div>

          {/* 유리 게임판 */}
          <div
            ref={boardRef}
            className="relative bg-gradient-to-b from-sky-50 via-white to-pink-50 border-2 border-pink-300 rounded-lg overflow-hidden"
            style={{
              height: 320,
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 24px, rgba(255,255,255,0.3) 24px, rgba(255,255,255,0.3) 25px)',
            }}
          >
            {/* 크레인 레일 (상단 가로선) */}
            <div className="absolute left-0 right-0 top-3 h-1 bg-gray-400 rounded-full" />

            {/* 크레인 */}
            <div
              className="absolute top-3 transition-none"
              style={{
                left: `${cranePos}%`,
                transform: 'translateX(-50%)',
                top: `${12 + craneDropY * 220}px`,
              }}
            >
              {/* 케이블 */}
              <div
                className="absolute left-1/2 -translate-x-1/2 bg-gray-500 w-0.5"
                style={{ top: -12 - craneDropY * 220, height: 12 + craneDropY * 220 }}
              />
              {/* 집게 */}
              <div className="relative text-3xl" style={{ lineHeight: 1 }}>
                {state === 'dropping' && craneDropY > 0.85 ? '🤏' : '✋'}
              </div>
              {/* 잡힌 인형 (dropping 끝날 때 집게에 딸려올라옴) */}
              {grabbedDoll && state === 'result' && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 text-4xl"
                  style={{ top: 24, animation: 'lift 0.8s ease-out forwards' }}
                >
                  {grabbedDoll.emoji}
                </div>
              )}
            </div>

            {/* 인형들 (바닥에 배치) */}
            {dolls.map(d => (
              <div
                key={d.id}
                className="absolute"
                style={{
                  left: `${d.x}%`,
                  bottom: 18,
                  transform: 'translateX(-50%)',
                  fontSize: DOLL_SIZE * 0.7,
                  lineHeight: 1,
                  filter: `drop-shadow(0 2px 3px rgba(0,0,0,0.15))`,
                }}
              >
                <div className="relative">
                  {d.emoji}
                  {/* 레어도 뱃지 */}
                  {d.rarity !== 'N' && (
                    <span
                      className="absolute -top-1 -right-1 text-[8px] font-black text-white px-1 rounded-full"
                      style={{
                        background: RARITY_INFO[d.rarity].color,
                        fontSize: 9,
                        padding: '1px 4px',
                      }}
                    >
                      {d.rarity}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* 바닥 */}
            <div className="absolute left-0 right-0 bottom-0 h-3 bg-gradient-to-b from-pink-200 to-pink-300" />

            {/* 받침 구멍 (오른쪽 아래) */}
            <div className="absolute bottom-3 right-3 w-10 h-3 bg-gray-700 rounded-full shadow-inner" />
          </div>

          {/* 하단 컨트롤 패널 */}
          <div className="mt-2 bg-pink-200 rounded-lg p-2">
            <div className="text-[9px] text-center text-pink-700 font-bold mb-1">
              コントロール
            </div>
            {state === 'idle' && (
              <button
                onClick={startGame}
                disabled={!canPlay}
                className={`w-full py-2 rounded-lg font-black text-sm transition ${
                  canPlay
                    ? 'bg-pink-500 text-white active:scale-95 shadow-md'
                    : 'bg-gray-300 text-gray-500'
                }`}
              >
                {canFree ? '🎁 無料でプレイ！' : `▶ スタート (${CRANE_COST}pt)`}
              </button>
            )}
            {state === 'moving' && (
              <button
                onClick={stopAndGrab}
                className="w-full py-2 rounded-lg bg-red-500 text-white font-black text-base active:scale-95 shadow-md animate-pulse"
              >
                ⏹ STOP！
              </button>
            )}
            {state === 'dropping' && (
              <div className="w-full py-2 text-center text-pink-700 font-bold text-sm">
                つかめるかな？...
              </div>
            )}
            {state === 'result' && (
              <button
                onClick={nextRound}
                className="w-full py-2 rounded-lg bg-pink-500 text-white font-black text-sm active:scale-95 shadow-md"
              >
                ▶ もう一回
              </button>
            )}
          </div>
        </div>
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
