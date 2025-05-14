
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

  // Force permissions refresh
  const forceRefreshPermissions = useCallback(async () => {
    if (!canCheckAgain()) {
      toast({
        title: "Please wait",
        description: "Wait a few seconds before trying again.",
      });
      return;
    }
    
    setIsLoading(true);
    setLastCheckTime(Date.now());
    setRetryCount(prev => prev + 1);
    
    try {
      // Always refresh role first
      await refreshRole();
      
      // For special users or forced mode, grant access directly
      if (isSpecialAdmin || isForcedMode) {
        setTablesAccessible(true);
        toast({
          title: isForcedMode ? "Forced admin mode" : "Special admin mode",
          description: "Access to admin features granted.",
        });
        return;
      }
      
      // Check table access after role refresh
      const hasAccess = await checkTablesAccess();
      setTablesAccessible(hasAccess);
      
      if (hasAccess) {
        toast({
          title: "Access restored",
          description: "Data access has been successfully restored.",
        });
      } else {
        toast({
          title: "Limited access",
          description: "Data access remains limited. Check your role.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error during refresh:", error);
      toast({
        title: "Error",
        description: "Problem during permissions refresh: " + error.message,
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
