import { useState, useEffect } from 'react';

// localStorage 동기화 훅
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch (e) {
      console.warn(`localStorage read failed: ${key}`, e);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`localStorage write failed: ${key}`, e);
    }
  }, [key, value]);

  return [value, setValue];
}
