
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook that provides utilities to verify admin access
 */
export const useAccessVerification = (isSpecialAdmin: boolean, isForcedMode: boolean, role: string | null) => {
  // Simplified table access check
  const checkTablesAccess = useCallback(async () => {
    // Special admin or forced mode always has access
    if (isSpecialAdmin || isForcedMode) {
      return true;
    }
    
    // User with super_admin role has access
    if (role === 'super_admin') {
      try {
        const { error } = await supabase
          .from('modules')
          .select('id')
          .limit(1);
          
        return !error;
      } catch {
        return false;
      }
    }
    
    return false;
  }, [isSpecialAdmin, isForcedMode, role]);

  return {
    checkTablesAccess
  };
};
