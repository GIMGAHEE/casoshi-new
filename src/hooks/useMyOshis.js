import { useSyncExternalStore } from 'react';
import { subscribeMyOshis, listAllMyOshi } from '../data/myOshiRepository';

export function useMyOshis() {
  return useSyncExternalStore(
    subscribeMyOshis,
    listAllMyOshi,
    listAllMyOshi
  );
}
