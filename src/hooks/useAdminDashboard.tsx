
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { useAdminModeService, SPECIAL_ADMIN_EMAIL } from "@/services/AdminModeService";

export const useAdminDashboard = () => {
  const { user } = useAuth();
  const { role, isLoading: roleLoading, refreshRole, isSpecialAdmin, diagnosticRole } = useUserRole();
  const { toast } = useToast();
  const {
    isLoading: accessLoading,
    tablesAccessible,
    retryCount,
    forceRefreshPermissions,
    isSpecialAdminAccess
  } = useAdminAccess();
  
  // Use the admin mode service
  const { 
    forcedAdminMode, 
    enableForcedAdminMode,
    disableForcedAdminMode 
  } = useAdminModeService(user?.email);
  
  const [searchParams] = useSearchParams();
  const [isInitializing, setIsInitializing] = useState(false);
  const [diagnosticData, setDiagnosticData] = useState<any>(null);
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [isAdminRepairOpen, setIsAdminRepairOpen] = useState(true);
  const defaultTab = searchParams.get('tab') || 'modules';
  
  // Explicit detection of special email for bypass
  const isKonointer = user?.email === SPECIAL_ADMIN_EMAIL;

  // Run diagnostic for better troubleshooting
  const runAdminDiagnostic = useCallback(async () => {
    if (isKonointer) {
      try {
        setDiagnosticData(null);  // Clear previous data
        const data = await diagnosticRole();
        setDiagnosticData(data);
        setIsDiagnosticOpen(true);
        
        if (data) {
          toast({
            title: "Diagnostic terminé",
            description: `État du rôle: ${data.role || 'Non défini'}`,
          });
        }
      } catch (error) {
        console.error("Diagnostic error:", error);
        toast({
          title: "Erreur de diagnostic",
          description: "Impossible d'exécuter le diagnostic complet",
          variant: "destructive",
        });
      }
    }
  }, [isKonointer, diagnosticRole, toast]);

  // Initialize modules if needed
  const initializeAdminAccess = useCallback(async () => {
    if (!user || isInitializing) return;
    
    setIsInitializing(true);
    try {
      console.log("Attempting to initialize admin tables...");
      
      // Try to initialize default modules
      const { error } = await supabase.rpc('create_default_modules' as any);
      
      if (error) {
        console.warn("Error initializing modules:", error);
        toast({
          title: "Erreur d'initialisation",
          description: `Impossible de créer les modules par défaut: ${error.message}`,
          variant: "destructive",
        });
      } else {
        console.log("Module initialization successful");
        toast({
          title: "Initialisation réussie",
          description: "Les modules par défaut ont été créés."
        });
      }
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
  }, [user, isInitializing, toast]);

  // Auto-repair function on component mount
  useEffect(() => {
    const repairAdminRole = async () => {
      if (isKonointer && role !== "super_admin") {
        console.log("Automatic role repair via Edge Function...");
        
        try {
          const { data, error } = await supabase.functions.invoke("set-admin-role", {
            body: { 
              email: user?.email,
              userId: user?.id,
              forceRepair: true
            }
          });
          
          console.log("Edge function response for repair:", data);
          
          if (data?.success) {
            await refreshRole(true);
            toast({
              title: "Rôle réparé",
              description: "Le rôle d'administrateur a été attribué avec succès.",
            });
          } else if (error) {
            console.error("Auto-repair error:", error);
            // Fallback to forced admin mode
            if (!forcedAdminMode) {
              enableForcedAdminMode();
            }
          }
        } catch (error) {
          console.error("Error during automatic repair:", error);
          // Fallback to forced admin mode
          if (!forcedAdminMode) {
            enableForcedAdminMode();
          }
        }
      }
    };
    
    repairAdminRole();
  }, [isKonointer, role, user, refreshRole, forcedAdminMode, enableForcedAdminMode, toast]);

  // Initialize tables on load
  useEffect(() => {
    if (user && (isSpecialAdmin || role === "super_admin" || forcedAdminMode)) {
      initializeAdminAccess();
    }
  }, [user, role, isSpecialAdmin, forcedAdminMode, initializeAdminAccess]);

  // Access control: Forced mode, special admin, or super_admin role
  const hasAdminAccess = forcedAdminMode || isSpecialAdmin || isSpecialAdminAccess || role === "super_admin";
  const isLoading = roleLoading || (accessLoading && !forcedAdminMode);

  return {
    user,
    role,
    isKonointer,
    isLoading,
    roleLoading,
    isInitializing,
    forcedAdminMode,
    hasAdminAccess,
    tablesAccessible,
    retryCount,
    defaultTab,
    isSpecialAdmin,
    isDiagnosticOpen,
    setIsDiagnosticOpen,
    diagnosticData,
    handleEnableForcedAdminMode: enableForcedAdminMode,
    handleDisableForcedAdminMode: disableForcedAdminMode,
    runAdminDiagnostic,
    initializeAdminAccess,
    forceRefreshPermissions
  };
};
