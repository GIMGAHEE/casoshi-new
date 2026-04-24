import {
  collection, doc, setDoc, deleteDoc, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Firestore 컬렉션: casoshi_myoshi/{userId}
// 문서 구조:
//   {
//     userId: string,
//     oshi:   { name, presetId, hairstyleId, hairOffset, parts, colors },
//     meta:   { updatedAt: ts, createdAt: ts }
//   }
//
// Phase 3b 에서 OAuth 붙이면 userId → Firebase Auth uid 로 교체.

const COL = 'casoshi_myoshi';

let _cache = [];
const _subs = new Set();
function _notify() { _subs.forEach(fn => fn()); }

export function initMyOshiSubscription() {
  return onSnapshot(collection(db, COL), snap => {
    _cache = snap.docs.map(d => ({ userId: d.id, ...d.data() }));
    _notify();
  });
}

export function listAllMyOshi() { return _cache; }

export function subscribeMyOshis(cb) {
  _subs.add(cb);
  return () => _subs.delete(cb);
}

export async function saveMyOshi(userId, oshi) {
  if (!userId || !oshi) return;
  await setDoc(
    doc(db, COL, userId),
    {
      userId,
      oshi,
      meta: { updatedAt: serverTimestamp() },
    },
    { merge: true }
  );
}

export async function deleteMyOshi(userId) {
  if (!userId) return;
  await deleteDoc(doc(db, COL, userId));
}
