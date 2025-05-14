
import { useCallback } from "react";

/**
 * Hook that provides debounce functionality for access checks
 */
export const useAccessDebounce = (lastCheckTime: number) => {
  // Anti-rebond pour les contrôles fréquents
  const canCheckAgain = useCallback(() => {
    const now = Date.now();
    return (now - lastCheckTime) > 2000; // 2 secondes minimum entre les vérifications
  }, [lastCheckTime]);

  return {
    canCheckAgain
  };
};
