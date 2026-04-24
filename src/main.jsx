import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initLiverSubscription } from './auth/liverRepository';
import { initMyOshiSubscription } from './data/myOshiRepository';

// 앱 시작 시 Firestore 실시간 구독 시작
initLiverSubscription();
initMyOshiSubscription();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
