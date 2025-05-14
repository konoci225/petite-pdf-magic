
import { useCallback, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// Storage key for forced admin mode
export const FORCED_ADMIN_MODE_KEY = 'app_forced_admin_mode';
export const SPECIAL_ADMIN_EMAIL = 'konointer@gmail.com';

export const useAdminModeService = (userEmail?: string | null) => {
  const { toast } = useToast();
  // Track forced admin mode status
  const [forcedAdminMode, setForcedAdminMode] = useState(() => {
    return localStorage.getItem(FORCED_ADMIN_MODE_KEY) === 'true';
  });
  
  // Check if this is the special admin email
  const isSpecialAdmin = userEmail === SPECIAL_ADMIN_EMAIL;

  // Enable forced admin mode
  const enableForcedAdminMode = useCallback(() => {
    if (isSpecialAdmin) {
      localStorage.setItem(FORCED_ADMIN_MODE_KEY, 'true');
      setForcedAdminMode(true);
      toast({
        title: "Forced admin mode enabled",
        description: "Security checks bypass for special admin.",
      });
      
      return true;
    }
    return false;
  }, [isSpecialAdmin, toast]);

  // Disable forced admin mode
  const disableForcedAdminMode = useCallback(() => {
    localStorage.removeItem(FORCED_ADMIN_MODE_KEY);
    setForcedAdminMode(false);
    toast({
      title: "Forced admin mode disabled",
      description: "Returning to normal verification mode.",
    });
  }, [toast]);
  
  // Listen for localStorage changes (e.g., from other tabs)
  useEffect(() => {
    const handleStorageChange = () => {
      const currentValue = localStorage.getItem(FORCED_ADMIN_MODE_KEY) === 'true';
      setForcedAdminMode(currentValue);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Process URL parameter on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const forceParam = params.get('forceAdmin');
    
    if (forceParam === 'true' && isSpecialAdmin) {
      enableForcedAdminMode();
    }
  }, [isSpecialAdmin, enableForcedAdminMode]);

  return {
    forcedAdminMode,
    isSpecialAdmin,
    enableForcedAdminMode,
    disableForcedAdminMode
  };
};
