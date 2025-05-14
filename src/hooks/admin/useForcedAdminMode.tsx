
import { useState, useEffect } from "react";

// Clé pour le mode admin forcé
export const FORCED_ADMIN_MODE_KEY = 'app_forced_admin_mode';

/**
 * Hook for managing forced admin mode state and persistence
 */
export const useForcedAdminMode = () => {
  const [isForcedMode, setIsForcedMode] = useState(() => 
    localStorage.getItem(FORCED_ADMIN_MODE_KEY) === 'true'
  );

  // Check for forced mode changes
  useEffect(() => {
    const checkForcedMode = () => {
      const currentValue = localStorage.getItem(FORCED_ADMIN_MODE_KEY) === 'true';
      if (currentValue !== isForcedMode) {
        setIsForcedMode(currentValue);
      }
    };
    
    // Check on mount
    checkForcedMode();
    
    // Set up event listener for storage changes
    window.addEventListener('storage', checkForcedMode);
    
    // Clean up
    return () => {
      window.removeEventListener('storage', checkForcedMode);
    };
  }, [isForcedMode]);

  return {
    isForcedMode
  };
};
