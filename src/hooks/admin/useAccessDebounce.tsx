
import { useCallback } from "react";

/**
 * Hook for debouncing access verification checks
 * to prevent too many API calls in short succession
 */
export const useAccessDebounce = (lastCheckTime: number) => {
  const DEBOUNCE_TIME = 2000; // 2 seconds between checks
  
  // Check if enough time has passed since the last verification
  const canCheckAgain = useCallback(() => {
    const now = Date.now();
    return (now - lastCheckTime) > DEBOUNCE_TIME;
  }, [lastCheckTime]);
  
  return { canCheckAgain };
};
