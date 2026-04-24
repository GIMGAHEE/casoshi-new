// 익명 유저 식별자. Phase 3b 에서 Google OAuth 붙일 때 이 uid 를
// 실제 OAuth uid 로 마이그레이션 하면 된다.
const KEY = 'casoshi:userId';

function generate() {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch { /* ignore */ }
  return 'u_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
}

export function getUserId() {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = generate();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return generate();
  }
}
