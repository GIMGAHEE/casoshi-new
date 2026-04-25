// 가챠 상태 관리 훅
// 일반 포인트 시스템과 통합: points/setPoints 를 prop 으로 받아서 차감/환원

import { useState, useEffect, useCallback } from 'react';
import { getInventory, applyGachaResults } from '../utils/inventory';
import { rollOnce, rollTen, processGachaResults, isNewDay } from '../utils/gacha';
import { GACHA_COST } from '../data/badges';

/**
 * @param {string} userId
 * @param {number} points - 현재 일반 포인트 (App.jsx 의 points)
 * @param {function} setPoints - 포인트 setter (p => p - cost + refund)
 */
export function useGacha(userId, points, setPoints) {
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pulling, setPulling] = useState(false);

  // 인벤토리 로드
  useEffect(() => {
    if (!userId) return;

    let mounted = true;

    (async () => {
      try {
        const inv = await getInventory(userId);
        if (mounted) {
          setInventory(inv);
          setLoading(false);
        }
      } catch (e) {
        console.error('Failed to load inventory:', e);
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [userId]);

  // 무료 가챠 사용 가능?
  const canUseFreePull = inventory ? isNewDay(
    inventory.lastFreePullAt?.toMillis?.() || inventory.lastFreePullAt
  ) : false;

  // 1회 가챠
  const pullSingle = useCallback(async () => {
    if (!inventory || pulling) return null;

    const isFree = canUseFreePull;
    const cost = isFree ? 0 : GACHA_COST.single;

    if (!isFree && points < cost) {
      return { error: 'NOT_ENOUGH_POINTS' };
    }

    setPulling(true);

    try {
      const badge = rollOnce();
      const processed = processGachaResults([badge], inventory.badges || {});

      await applyGachaResults(userId, {
        updatedBadges: processed.updatedBadges,
        pullCount: 1,
        isFreePull: isFree,
      });

      // 일반 포인트 차감 + 중복 환원
      setPoints((p) => p - cost + processed.refundPoints);

      // 로컬 상태 갱신
      setInventory((prev) => ({
        ...prev,
        badges: processed.updatedBadges,
        totalPulls: prev.totalPulls + 1,
        lastFreePullAt: isFree ? Date.now() : prev.lastFreePullAt,
      }));

      return {
        results: [badge],
        ...processed,
        isFreePull: isFree,
      };
    } catch (e) {
      console.error('Gacha pull failed:', e);
      return { error: 'PULL_FAILED' };
    } finally {
      setPulling(false);
    }
  }, [inventory, pulling, userId, canUseFreePull, points, setPoints]);

  // 10연 가챠
  const pullTen = useCallback(async () => {
    if (!inventory || pulling) return null;

    const cost = GACHA_COST.ten;

    if (points < cost) {
      return { error: 'NOT_ENOUGH_POINTS' };
    }

    setPulling(true);

    try {
      const badges = rollTen();
      const processed = processGachaResults(badges, inventory.badges || {});

      await applyGachaResults(userId, {
        updatedBadges: processed.updatedBadges,
        pullCount: 10,
      });

      setPoints((p) => p - cost + processed.refundPoints);

      setInventory((prev) => ({
        ...prev,
        badges: processed.updatedBadges,
        totalPulls: prev.totalPulls + 10,
      }));

      return {
        results: badges,
        ...processed,
      };
    } catch (e) {
      console.error('Gacha ten-pull failed:', e);
      return { error: 'PULL_FAILED' };
    } finally {
      setPulling(false);
    }
  }, [inventory, pulling, userId, points, setPoints]);

  return {
    inventory,
    loading,
    pulling,
    canUseFreePull,
    pullSingle,
    pullTen,
  };
}
