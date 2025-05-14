
import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";

// Import our new hooks
import { useAccessState } from "@/hooks/admin/useAccessState";
import { useForcedAdminMode } from "@/hooks/admin/useForcedAdminMode";
import { useAccessVerification } from "@/hooks/admin/useAccessVerification";
import { useAccessDebounce } from "@/hooks/admin/useAccessDebounce";
import { useAdminRefresh } from "@/hooks/admin/useAdminRefresh";

export const useAdminAccess = () => {
  const { user } = useAuth();
  const { role, refreshRole, isSpecialAdmin } = useUserRole();
  const { toast } = useToast();
  
  // Use our refactored hooks
  const {
    isLoading, setIsLoading,
    tablesAccessible, setTablesAccessible,
    retryCount, setRetryCount,
    lastCheckTime, setLastCheckTime
  } = useAccessState();
  
  const { isForcedMode } = useForcedAdminMode();
  const { checkTablesAccess } = useAccessVerification(isSpecialAdmin, isForcedMode, role);
  const { canCheckAgain } = useAccessDebounce(lastCheckTime);
  
  // Create the refresh functionality
  const { forceRefreshPermissions } = useAdminRefresh(
    canCheckAgain,
    setIsLoading,
    setLastCheckTime,
    setRetryCount,
    refreshRole,
    isSpecialAdmin,
    isForcedMode,
    checkTablesAccess,
    setTablesAccessible
  );

  // L'utilisateur spécial ou en mode forcé a toujours accès aux tables administratives
  useEffect(() => {
    if (isSpecialAdmin || isForcedMode || role === 'super_admin') {
      setTablesAccessible(true);
      setIsLoading(false);
    }
  }, [isSpecialAdmin, isForcedMode, role, setTablesAccessible, setIsLoading]);

  // Vérification initiale à l'accès au tableau de bord
  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Si c'est l'admin spécial ou en mode forcé, accorder l'accès immédiatement
      if (isSpecialAdmin || isForcedMode) {
        setTablesAccessible(true);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setLastCheckTime(Date.now());
      
      try {
        // Vérification standard pour les autres utilisateurs
        const hasAccess = await checkTablesAccess();
        setTablesAccessible(hasAccess);
      } catch (error) {
        console.error("Erreur lors de la vérification de l'accès:", error);
        setTablesAccessible(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAccess();
  }, [user, isSpecialAdmin, isForcedMode, checkTablesAccess, setIsLoading, setLastCheckTime, setTablesAccessible]);

  return {
    isLoading,
    tablesAccessible,
    retryCount,
    forceRefreshPermissions,
    refreshRole,
    // Ajouter explicitement l'accès pour l'administrateur spécial ou en mode forcé
    isSpecialAdminAccess: isSpecialAdmin || isForcedMode
  };
};
