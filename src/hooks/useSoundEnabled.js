import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { setSoundEnabled as syncSfxEnabled } from '../utils/sound';

/**
 * 전역 사운드 on/off 상태 훅.
 * - localStorage 키: 'casoshi:sound_enabled' (기본 true)
 * - 변경 시 sound.js (sfx) 글로벌 enabled 플래그도 자동 sync
 * - BGM 엔진은 컴포넌트가 직접 engine.setEnabled(enabled) 호출 필요 (인스턴스라서)
 *
 * 사용:
 *   const [soundEnabled, setSoundEnabled] = useSoundEnabled();
 */
export function useSoundEnabled() {
  const [enabled, setEnabled] = useLocalStorage('casoshi:sound_enabled', true);

  // sfx 모듈 글로벌 sync
  useEffect(() => {
    syncSfxEnabled(enabled);
  }, [enabled]);

  return [enabled, setEnabled];
}
