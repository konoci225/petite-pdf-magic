
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook that provides utilities to verify admin access
 */
export const useAccessVerification = (isSpecialAdmin: boolean, isForcedMode: boolean, role: string | null) => {
  // Vérification simplifiée d'existence des tables
  const checkTablesAccess = useCallback(async () => {
    // L'utilisateur spécial ou en mode forcé a toujours accès
    if (isSpecialAdmin || isForcedMode) {
      return true;
    }
    
    // L'utilisateur avec le rôle super_admin a accès
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
