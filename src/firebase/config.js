// Firebase 초기화
//
// 환경변수는 Vite 가 빌드 시점에 치환해주기 때문에 런타임 .env 파일이 없어도
// Vercel Environment Variables 로 주입하면 됩니다.
//
// 키 이름 규칙: VITE_ 접두사가 있어야 클라이언트에 노출됨 (Vite 규칙).

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// 누락 감지 — 개발 중 env 설정 실수 빨리 알아차리게
if (!firebaseConfig.apiKey) {
  console.error(
    '[Firebase] 설정이 없습니다. .env.local 에 VITE_FIREBASE_* 변수들을 설정하세요.\n' +
    '.env.example 파일을 참고하세요.'
  );
}

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
