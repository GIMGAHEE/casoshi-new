// 등록된 라이버 저장소 (localStorage)
//
// 추후 백엔드 연동 시 여기만 API 호출로 교체하면 됨.

import { hashPassword } from './hash';
import { generateTempPassword, generateLiverUsername } from './passwordGen';

const STORAGE_KEY = 'casoshi:livers';

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(livers) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(livers));
}

// 전체 조회
export function listLivers() {
  return readAll();
}

// 단건 조회 (id 로)
export function getLiverById(id) {
  return readAll().find(l => l.id === id) || null;
}

// username 으로 조회 (로그인용)
export function getLiverByUsername(username) {
  return readAll().find(l => l.username === username) || null;
}

// 신규 등록 — 운영자가 호출
// input: { name, bio, casLiveHandle, streamSchedule, gender, themeColor, bgColor }
// returns: { liver, tempPassword }   // tempPassword를 운영자가 라이버에게 전달
export async function registerLiver(profile) {
  const livers = readAll();
  const id = `liver_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  let username = generateLiverUsername(profile.name);
  // username 중복 방지
  while (livers.some(l => l.username === username)) {
    username = generateLiverUsername(profile.name);
  }
  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);

  const liver = {
    id,
    username,
    passwordHash,
    mustChangePassword: true,    // 첫 로그인 시 강제 변경 플래그
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

  livers.push(liver);
  writeAll(livers);
  return { liver, tempPassword };
}

// 업데이트 (운영자 또는 본인)
export function updateLiver(id, patch) {
  const livers = readAll();
  const idx = livers.findIndex(l => l.id === id);
  if (idx === -1) return null;
  livers[idx] = {
    ...livers[idx],
    ...patch,
    profile: { ...livers[idx].profile, ...(patch.profile || {}) },
    updatedAt: new Date().toISOString(),
  };
  writeAll(livers);
  return livers[idx];
}

// 비밀번호 변경 (본인이 호출)
export async function changeLiverPassword(id, newPassword) {
  const livers = readAll();
  const idx = livers.findIndex(l => l.id === id);
  if (idx === -1) return false;
  livers[idx].passwordHash = await hashPassword(newPassword);
  livers[idx].mustChangePassword = false;
  livers[idx].updatedAt = new Date().toISOString();
  writeAll(livers);
  return true;
}

// 삭제 (운영자)
export function deleteLiver(id) {
  const livers = readAll().filter(l => l.id !== id);
  writeAll(livers);
}

// 응원 포인트 누적 (팬이 응원 시 호출)
export function addLiverSupport(liverId, points) {
  const livers = readAll();
  const idx = livers.findIndex(l => l.id === liverId);
  if (idx === -1) return false;
  const liver = livers[idx];
  const prevTotal = liver.stats?.totalSupport || 0;
  liver.stats = {
    ...liver.stats,
    totalSupport: prevTotal + points,
    supporterCount: liver.stats?.supporterCount || 0,
  };
  liver.updatedAt = new Date().toISOString();
  writeAll(livers);
  return true;
}
