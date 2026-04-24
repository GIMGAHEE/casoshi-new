// 등록된 라이버 저장소 (Firestore)
//
// 구조:
//   - module-level cache: sync readers 용 (listLivers, getLiverById, ...)
//   - onSnapshot 으로 Firestore 에서 실시간 구독 → cache 자동 업데이트
//   - useSyncExternalStore 용 subscribe() 제공 → React 와 연결됨
//   - writes 는 async Firestore 호출
//
// 기존 인터페이스 호환:
//   - listLivers(), getLiverById(), getLiverByUsername() 는 여전히 sync (cache 반환)
//   - registerLiver, updateLiver, deleteLiver, addLiverSupport, changeLiverPassword 는 async
//
// cache 초기 로딩 전에 호출되는 경우에 대비한 async 버전:
//   - fetchLiverByUsername(u) — Firestore 직접 조회 (로그인 시 사용)

import {
  collection, doc, setDoc, updateDoc, deleteDoc,
  getDocs, query, where, onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { hashPassword } from './hash';
import { generateTempPassword, generateLiverUsername } from './passwordGen';

const COL = 'casoshi_livers';

// ============ module cache ============
let cache = [];
let initialized = false;
const subscribers = new Set();

function notify() {
  for (const cb of subscribers) {
    try { cb(); } catch (e) { console.error(e); }
  }
}

/**
 * 앱 로드 시 1회 호출 — Firestore 실시간 구독 시작.
 * main.jsx 에서 호출합니다.
 */
export function initLiverSubscription() {
  if (initialized) return;
  initialized = true;

  onSnapshot(
    collection(db, COL),
    (snap) => {
      cache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      notify();
    },
    (err) => {
      console.error('[liverRepo] onSnapshot error:', err);
    }
  );
}

/**
 * useSyncExternalStore 에서 사용.
 */
export function subscribeLivers(cb) {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}

// ============ Sync readers (cache) ============
export function listLivers() {
  return cache;
}

export function getLiverById(id) {
  return cache.find(l => l.id === id) || null;
}

export function getLiverByUsername(username) {
  return cache.find(l => l.username === username) || null;
}

// ============ Async fetchers (Firestore 직접) ============
/** 로그인 시 cache 가 비어있을 수 있으므로 직접 조회 */
export async function fetchLiverByUsername(username) {
  const q = query(collection(db, COL), where('username', '==', username));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

// ============ Writes (async) ============

/**
 * 신규 등록 — 운영자가 호출
 * input: { name, bio, casLiveHandle, streamSchedule, gender, themeColor, bgColor }
 * returns: { liver, tempPassword }
 */
export async function registerLiver(profile) {
  // username 고유성 검사 — cache 기준
  const existing = cache;
  let username = generateLiverUsername(profile.name);
  let tries = 0;
  while (tries < 20 && existing.some(l => l.username === username)) {
    username = generateLiverUsername(profile.name);
    tries += 1;
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);

  const id = `liver_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const liverDoc = {
    username,
    passwordHash,
    mustChangePassword: true,
    profile: {
      name: profile.name,
      bio: profile.bio || '',
      imageUrl: profile.imageUrl || null,
      gender: profile.gender || 'girl',
      themeColor: profile.themeColor || '#FF6B9D',
      bgColor: profile.bgColor || '#FFE5EC',
      casLiveHandle: profile.casLiveHandle || '',
      streamSchedule: profile.streamSchedule || '',
    },
    stats: {
      totalSupport: 0,
      supporterCount: 0,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, COL, id), liverDoc);
  return { liver: { id, ...liverDoc }, tempPassword };
}

/**
 * 업데이트 (운영자 또는 본인)
 * patch 는 top-level 키 또는 { profile: {...} }
 */
export async function updateLiver(id, patch) {
  const current = getLiverById(id);
  if (!current) return null;

  const updated = {
    ...current,
    ...patch,
    profile: { ...current.profile, ...(patch.profile || {}) },
    updatedAt: new Date().toISOString(),
  };
  const { id: _omit, ...payload } = updated;
  await setDoc(doc(db, COL, id), payload);
  return updated;
}

/** 비밀번호 변경 (본인) */
export async function changeLiverPassword(id, newPassword) {
  const passwordHash = await hashPassword(newPassword);
  await updateDoc(doc(db, COL, id), {
    passwordHash,
    mustChangePassword: false,
    updatedAt: new Date().toISOString(),
  });
  return true;
}

/** 삭제 (운영자) */
export async function deleteLiver(id) {
  await deleteDoc(doc(db, COL, id));
}

/**
 * 응원 포인트 누적 (팬이 응원 시 호출)
 * 동시 쓰기 시 lost-update 가능성이 있지만 CasOshi 초기 단계에선 허용.
 * 이후 FieldValue.increment 로 교체 가능.
 */
export async function addLiverSupport(liverId, points) {
  const current = getLiverById(liverId);
  if (!current) return false;
  const prev = current.stats?.totalSupport || 0;
  await updateDoc(doc(db, COL, liverId), {
    'stats.totalSupport': prev + points,
    'stats.supporterCount': current.stats?.supporterCount || 0,
    updatedAt: new Date().toISOString(),
  });
  return true;
}
