import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initLiverSubscription } from './auth/liverRepository';

// 앱 시작 시 Firestore 라이버 컬렉션 실시간 구독 시작
initLiverSubscription();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
