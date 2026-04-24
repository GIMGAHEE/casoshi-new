// useLivers — Firestore 실시간 구독 결과를 React 에 연결
//
// 사용:
//   const livers = useLivers();
//
// 초기 로딩 중에는 빈 배열을 반환합니다. Firestore 가 응답하면 자동 재렌더링.

import { useSyncExternalStore } from 'react';
import { subscribeLivers, listLivers } from '../auth/liverRepository';

export function useLivers() {
  return useSyncExternalStore(subscribeLivers, listLivers, listLivers);
}
