// 로그인 세션 관리 (localStorage 기반)
//
// 세션 구조:
//   { type: 'admin' | 'liver', liverId?, loggedInAt, expiresAt }
//
// 추후 OAuth 연동 시 여기에 provider / token 필드 추가.

import { ADMIN_USERNAME, ADMIN_PASSWORD_HASH } from './adminConfig';
import { verifyPassword } from './hash';
import { fetchLiverByUsername } from './liverRepository';

const SESSION_KEY = 'casoshi:session';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24시간

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (s.expiresAt && Date.now() > s.expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

function saveSession(s) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(s));
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

// 운영자 로그인
export async function loginAdmin(username, password) {
  if (username !== ADMIN_USERNAME) return { ok: false, error: 'ID가 일치하지 않습니다' };
  const ok = await verifyPassword(password, ADMIN_PASSWORD_HASH);
  if (!ok) return { ok: false, error: '비밀번호가 일치하지 않습니다' };
  const session = {
    type: 'admin',
    username,
    loggedInAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION_MS,
  };
  saveSession(session);
  return { ok: true, session };
}

// 라이버 로그인
export async function loginLiver(username, password) {
  const liver = await fetchLiverByUsername(username);
  if (!liver) return { ok: false, error: 'ID가 일치하지 않습니다' };
  const ok = await verifyPassword(password, liver.passwordHash);
  if (!ok) return { ok: false, error: '비밀번호가 일치하지 않습니다' };
  const session = {
    type: 'liver',
    liverId: liver.id,
    username: liver.username,
    mustChangePassword: liver.mustChangePassword,
    loggedInAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION_MS,
  };
  saveSession(session);
  return { ok: true, session, liver };
}

// 세션 refresh — 라이버 정보 업데이트 후 호출
export function refreshSession(patch) {
  const s = getSession();
  if (!s) return null;
  const next = { ...s, ...patch };
  saveSession(next);
  return next;
}
