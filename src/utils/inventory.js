// Firestore 인벤토리 입출력
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

const COLLECTION = 'casoshi_inventory';

/**
 * 인벤토리 가져오기 (없으면 생성)
 */
export async function getInventory(userId) {
  if (!userId) throw new Error('userId required');
  
  const ref = doc(db, COLLECTION, userId);
  const snap = await getDoc(ref);
  
  if (!snap.exists()) {
    const initial = {
      userId,
      badges: {},
      gachaPoints: 0,
      totalPulls: 0,
      lastFreePullAt: null,
      lastDailyBonusAt: null,
      meta: { createdAt: serverTimestamp(), updatedAt: serverTimestamp() },
    };
    await setDoc(ref, initial);
    return initial;
  }
  
  return snap.data();
}

/**
 * 인벤토리 업데이트
 */
export async function updateInventory(userId, updates) {
  if (!userId) throw new Error('userId required');
  
  const ref = doc(db, COLLECTION, userId);
  await updateDoc(ref, {
    ...updates,
    'meta.updatedAt': serverTimestamp(),
  });
}

/**
 * 가챠 결과 적용
 * - 캔뱃지 추가
 * - 환원 포인트 적용
 * - 가챠 카운트 증가
 * - 무료 가챠면 lastFreePullAt 갱신
 */
export async function applyGachaResults(userId, {
  updatedBadges,
  refundPoints,
  gachaCost,
  pullCount,
  isFreePull = false,
}) {
  const ref = doc(db, COLLECTION, userId);
  const snap = await getDoc(ref);
  
  if (!snap.exists()) {
    await getInventory(userId); // 초기화
  }
  
  const current = snap.exists() ? snap.data() : { gachaPoints: 0, totalPulls: 0 };
  
  const updates = {
    badges: updatedBadges,
    gachaPoints: (current.gachaPoints || 0) - gachaCost + refundPoints,
    totalPulls: (current.totalPulls || 0) + pullCount,
    'meta.updatedAt': serverTimestamp(),
  };
  
  if (isFreePull) {
    updates.lastFreePullAt = serverTimestamp();
  }
  
  await updateDoc(ref, updates);
}

/**
 * 가챠 포인트 추가 (응원시 호출)
 */
export async function addGachaPoints(userId, points, reason = '') {
  const ref = doc(db, COLLECTION, userId);
  const snap = await getDoc(ref);
  
  if (!snap.exists()) {
    await getInventory(userId);
  }
  
  const current = snap.exists() ? snap.data() : { gachaPoints: 0 };
  
  await updateDoc(ref, {
    gachaPoints: (current.gachaPoints || 0) + points,
    'meta.updatedAt': serverTimestamp(),
    'meta.lastPointReason': reason,
  });
}

/**
 * 일일 보너스 받기
 * - 오늘 처음 응원하면 +50pt
 * - 받으면 lastDailyBonusAt 갱신
 */
export async function claimDailyBonusIfNeeded(userId, bonusAmount = 50) {
  const ref = doc(db, COLLECTION, userId);
  const snap = await getDoc(ref);
  
  if (!snap.exists()) {
    await getInventory(userId);
  }
  
  const data = snap.exists() ? snap.data() : {};
  const last = data.lastDailyBonusAt?.toMillis?.() || data.lastDailyBonusAt;
  
  const now = new Date();
  const lastDate = last ? new Date(last) : null;
  
  const isNewDay = !lastDate ||
    lastDate.getFullYear() !== now.getFullYear() ||
    lastDate.getMonth() !== now.getMonth() ||
    lastDate.getDate() !== now.getDate();
  
  if (isNewDay) {
    await updateDoc(ref, {
      gachaPoints: (data.gachaPoints || 0) + bonusAmount,
      lastDailyBonusAt: serverTimestamp(),
    });
    return bonusAmount;
  }
  
  return 0;
}
