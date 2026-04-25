// Firestore 인벤토리 입출력
// gachaPoints 필드는 제거됨 — 일반 포인트 시스템 (localStorage casoshi:points) 으로 통합.
// 이 컬렉션은 이제 캔뱃지 컬렉션 + 무료 가챠 사용 추적만 담당.

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
      totalPulls: 0,
      lastFreePullAt: null,
      meta: { createdAt: serverTimestamp(), updatedAt: serverTimestamp() },
    };
    await setDoc(ref, initial);
    return initial;
  }

  return snap.data();
}

/**
 * 가챠 결과 적용
 * - 캔뱃지 추가
 * - 가챠 카운트 증가
 * - 무료 가챠면 lastFreePullAt 갱신
 *
 * 포인트 차감/환원은 호출측 (App.jsx 의 setPoints) 에서 담당.
 */
export async function applyGachaResults(userId, {
  updatedBadges,
  pullCount,
  isFreePull = false,
}) {
  const ref = doc(db, COLLECTION, userId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await getInventory(userId);
  }

  const current = snap.exists() ? snap.data() : { totalPulls: 0 };

  const updates = {
    badges: updatedBadges,
    totalPulls: (current.totalPulls || 0) + pullCount,
    'meta.updatedAt': serverTimestamp(),
  };

  if (isFreePull) {
    updates.lastFreePullAt = serverTimestamp();
  }

  await updateDoc(ref, updates);
}
