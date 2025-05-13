
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useModuleDefaultService } from "@/components/admin/modules/services/ModuleDefaultService";
import { SPECIAL_ADMIN_EMAIL } from "@/services/AdminModeService";

export const useModuleInitializer = (
  user: any, 
  forceRefreshPermissions: () => Promise<void>,
  enableForcedAdminMode: () => void,
  forcedAdminMode: boolean
) => {
  const { toast } = useToast();
  const [isInitializing, setIsInitializing] = useState(false);
  const { createDefaultModules } = useModuleDefaultService();
  
  // Explicit detection of special email for bypass
  const isKonointer = user?.email === SPECIAL_ADMIN_EMAIL;

  // Initialize modules
  const initializeAdminAccess = useCallback(async () => {
    if (!user || isInitializing) return;
    
    setIsInitializing(true);
    try {
      console.log("Attempting to initialize admin tables...");
      
      // Enable forced admin mode first if possible
      if (isKonointer && !forcedAdminMode) {
        enableForcedAdminMode();
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for state update
      }
      
      // Utiliser le service de module pour créer les modules par défaut
      const success = await createDefaultModules();
      
      if (success) {
        console.log("Module initialization successful");
        toast({
          title: "Initialisation réussie",
          description: "Les modules par défaut ont été créés."
        });
      } else {
        throw new Error("L'initialisation a échoué sans erreur spécifique");
      }
      
      // Force refresh permissions to reflect changes
      await forceRefreshPermissions();
    } catch (error: any) {
      console.error("Error during initialization:", error);
      toast({
        title: "Erreur d'initialisation",
        description: `${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsInitializing(false);
    }
  }, [user, isInitializing, toast, createDefaultModules, isKonointer, forcedAdminMode, enableForcedAdminMode, forceRefreshPermissions]);

  return {
    isInitializing,
    initializeAdminAccess
  };
};
