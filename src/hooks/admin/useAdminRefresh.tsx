
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook that provides admin refresh functionality
 */
export const useAdminRefresh = (
  canCheckAgain: () => boolean,
  setIsLoading: (value: boolean) => void,
  setLastCheckTime: (value: number) => void,
  setRetryCount: (updater: (prev: number) => number) => void,
  refreshRole: () => Promise<void>,
  isSpecialAdmin: boolean,
  isForcedMode: boolean,
  checkTablesAccess: () => Promise<boolean>,
  setTablesAccessible: (value: boolean) => void
) => {
  const { toast } = useToast();

  // Forcer le rafraîchissement des permissions
  const forceRefreshPermissions = useCallback(async () => {
    if (!canCheckAgain()) {
      toast({
        title: "Veuillez patienter",
        description: "Attendez quelques secondes avant de réessayer.",
      });
      return;
    }
    
    setIsLoading(true);
    setLastCheckTime(Date.now());
    setRetryCount(prev => prev + 1);
    
    try {
      // Toujours actualiser le rôle d'abord
      await refreshRole();
      
      // Pour les utilisateurs spéciaux ou en mode forcé, accorder l'accès directement
      if (isSpecialAdmin || isForcedMode) {
        setTablesAccessible(true);
        toast({
          title: isForcedMode ? "Mode administrateur forcé" : "Mode administrateur spécial",
          description: "Accès aux fonctionnalités administratives accordé.",
        });
        return;
      }
      
      // Vérifier l'accès aux tables après actualisation du rôle
      const hasAccess = await checkTablesAccess();
      setTablesAccessible(hasAccess);
      
      if (hasAccess) {
        toast({
          title: "Accès restauré",
          description: "L'accès aux données a été restauré avec succès.",
        });
      } else {
        toast({
          title: "Accès limité",
          description: "L'accès aux données reste limité. Vérifiez votre rôle.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Erreur lors du rafraîchissement:", error);
      toast({
        title: "Erreur",
        description: "Problème lors du rafraîchissement des permissions: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [refreshRole, isSpecialAdmin, isForcedMode, checkTablesAccess, toast, canCheckAgain, setIsLoading, setLastCheckTime, setRetryCount, setTablesAccessible]);

  return {
    forceRefreshPermissions
  };
};
