// 운영자 계정 설정
//
// 기본값은 개발/초기용. 배포 시 Vercel 환경 변수로 덮어쓰기:
//   VITE_ADMIN_USERNAME = <원하는 운영자 ID>
//   VITE_ADMIN_PASSWORD_HASH = <해시 값>
//
// 새 비밀번호 해시 생성 방법:
//   const { hashPassword } = require('./hash');
//   await hashPassword('your-new-password');
//
// 또는 브라우저 콘솔에서:
//   import { hashPassword } from './auth/hash';
//   console.log(await hashPassword('your-new-password'));

// 기본 운영자 (초기 설정용 — 배포 전에 변경 권장)
// username: gh_admin / password: casoshi-admin-2026
const DEFAULT_USERNAME = 'gh_admin';
const DEFAULT_PASSWORD_HASH =
  '261b6f3e5e5b3ba38b9cc67abe2975ca42391cc852196645c76976031875e90a';

export const ADMIN_USERNAME =
  import.meta.env.VITE_ADMIN_USERNAME || DEFAULT_USERNAME;

export const ADMIN_PASSWORD_HASH =
  import.meta.env.VITE_ADMIN_PASSWORD_HASH || DEFAULT_PASSWORD_HASH;
