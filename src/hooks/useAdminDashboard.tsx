
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { useAdminModeService, SPECIAL_ADMIN_EMAIL } from "@/services/AdminModeService";
import { useModuleDefaultService } from "@/components/admin/modules/services/ModuleDefaultService";

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
  
  // Utiliser le service de modules
  const { createDefaultModules } = useModuleDefaultService();
  
  const [searchParams] = useSearchParams();
  const [isInitializing, setIsInitializing] = useState(false);
  const [diagnosticData, setDiagnosticData] = useState<any>(null);
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [isAdminRepairOpen, setIsAdminRepairOpen] = useState(true);
  const [diagnosticRunning, setDiagnosticRunning] = useState(false);
  const defaultTab = searchParams.get('tab') || 'modules';
  
  // Explicit detection of special email for bypass
  const isKonointer = user?.email === SPECIAL_ADMIN_EMAIL;

  // Run diagnostic for better troubleshooting
  const runAdminDiagnostic = useCallback(async () => {
    if (!isKonointer) return;
    
    try {
      setDiagnosticRunning(true);
      setDiagnosticData(null);  // Clear previous data
      
      console.log("Running admin diagnostic...");
      let diagnosticResults: any = {};
      
      // Attempt 1: Use admin-bypass function
      try {
        console.log("Attempt 1: Using admin-bypass function");
        const { data, error } = await supabase.functions.invoke("admin-bypass", {
          body: { action: "diagnostic" }
        });
        
        if (error) {
          console.error("Admin bypass error:", error);
          diagnosticResults.adminBypassError = error.message;
        } else {
          console.log("Admin bypass diagnostic results:", data);
          diagnosticResults = { ...diagnosticResults, ...data };
        }
      } catch (err: any) {
        console.error("Admin bypass exception:", err);
        diagnosticResults.adminBypassException = err.message;
      }
      
      // Attempt 2: Direct database access check
      try {
        console.log("Attempt 2: Direct database access check");
        const { data: moduleCount, error: moduleError } = await supabase
          .from('modules')
          .select('*', { count: 'exact', head: true });
          
        diagnosticResults.moduleAccessResult = !moduleError;
        diagnosticResults.moduleCount = moduleCount;
        
        if (moduleError) {
          console.error("Module access error:", moduleError);
          diagnosticResults.moduleAccessError = moduleError.message;
        }
      } catch (err: any) {
        console.error("Module access exception:", err);
        diagnosticResults.moduleAccessException = err.message;
      }
      
      // Attempt 3: Check RPC function
      try {
        console.log("Attempt 3: Testing RPC function");
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('create_default_modules');
          
        diagnosticResults.rpcAccessResult = !rpcError;
        
        if (rpcError) {
          console.error("RPC error:", rpcError);
          diagnosticResults.rpcError = rpcError.message;
        } else {
          console.log("RPC call successful");
          diagnosticResults.rpcSuccess = true;
        }
      } catch (err: any) {
        console.error("RPC exception:", err);
        diagnosticResults.rpcException = err.message;
      }
      
      // Get additional diagnostic data
      if (diagnosticRole) {
        try {
          const roleData = await diagnosticRole();
          if (roleData) {
            diagnosticResults.roleData = roleData;
          }
        } catch (err) {
          console.error("Role diagnostic error:", err);
        }
      }
      
      // Set the final diagnostic data
      diagnosticResults.timestamp = new Date().toISOString();
      diagnosticResults.user = {
        email: user?.email,
        id: user?.id,
        role: role
      };
      diagnosticResults.forcedAdminMode = forcedAdminMode;
      diagnosticResults.isSpecialAdmin = isSpecialAdmin;
      
      setDiagnosticData(diagnosticResults);
      setIsDiagnosticOpen(true);
      
      toast({
        title: "Diagnostic terminé",
        description: "Le rapport de diagnostic est disponible.",
      });
    } catch (error) {
      console.error("Diagnostic error:", error);
      toast({
        title: "Erreur de diagnostic",
        description: "Impossible d'exécuter le diagnostic complet",
        variant: "destructive",
      });
    } finally {
      setDiagnosticRunning(false);
    }
  }, [isKonointer, diagnosticRole, user, role, forcedAdminMode, isSpecialAdmin, toast]);

  // Initialize modules if needed
  const initializeAdminAccess = useCallback(async () => {
    if (!user || isInitializing) return;
    
    setIsInitializing(true);
    try {
      console.log("Attempting to initialize admin tables...");
      
      // Enable forced admin mode first if possible
      if (isKonointer && !forcedAdminMode) {
        enableForcedAdminMode();
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
  }, [user, isInitializing, toast, createDefaultModules, isKonointer, forcedAdminMode, enableForcedAdminMode]);

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

  // Initialize tables on load but with more caution
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shouldInitialize = params.get('initialize') === 'true';
    
    if (shouldInitialize && user && (isSpecialAdmin || role === "super_admin" || forcedAdminMode)) {
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
    diagnosticRunning,
    handleEnableForcedAdminMode: enableForcedAdminMode,
    handleDisableForcedAdminMode: disableForcedAdminMode,
    runAdminDiagnostic,
    initializeAdminAccess,
    forceRefreshPermissions
  };
};
