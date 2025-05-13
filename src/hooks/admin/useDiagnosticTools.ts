
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SPECIAL_ADMIN_EMAIL } from "@/services/AdminModeService";

export const useDiagnosticTools = (user: any, role: string | null, isSpecialAdmin: boolean, forcedAdminMode: boolean) => {
  const { toast } = useToast();
  const [diagnosticData, setDiagnosticData] = useState<any>(null);
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [diagnosticRunning, setDiagnosticRunning] = useState(false);
  
  // Explicit detection of special email for bypass
  const isKonointer = user?.email === SPECIAL_ADMIN_EMAIL;

  // Run diagnostic for better troubleshooting
  const runAdminDiagnostic = useCallback(async () => {
    try {
      setDiagnosticRunning(true);
      setDiagnosticData(null);  // Clear previous data
      
      console.log("Running admin diagnostic...");
      let diagnosticResults: any = {};
      
      // Get user and role information
      diagnosticResults.timestamp = new Date().toISOString();
      diagnosticResults.user = {
        email: user?.email,
        id: user?.id,
        role: role
      };
      diagnosticResults.forcedAdminMode = forcedAdminMode;
      diagnosticResults.isSpecialAdmin = isSpecialAdmin;
      
      // Attempt 1: Ping admin-bypass function to check connectivity
      try {
        console.log("Attempt 1: Ping admin-bypass function");
        const { data: pingData, error: pingError } = await supabase.functions.invoke("admin-bypass", {
          body: { action: "ping" }
        });
        
        if (pingError) {
          console.error("Admin bypass ping error:", pingError);
          diagnosticResults.adminBypassPingError = pingError.message;
        } else {
          console.log("Admin bypass ping response:", pingData);
          diagnosticResults.adminBypassPing = pingData;
        }
      } catch (err: any) {
        console.error("Admin bypass ping exception:", err);
        diagnosticResults.adminBypassPingException = err.message;
      }
      
      // Attempt 2: Check direct module access
      try {
        console.log("Attempt 2: Check direct module access");
        
        // First try with normal client
        const { data: moduleData, error: moduleError } = await supabase
          .from('modules')
          .select('*', { count: 'exact', head: true });
          
        diagnosticResults.moduleAccessResult = !moduleError;
        diagnosticResults.moduleCount = moduleData?.length || 0;
        
        if (moduleError) {
          console.error("Module access error:", moduleError);
          diagnosticResults.moduleAccessError = moduleError.message;
        } else {
          console.log("Module access successful, count:", moduleData?.length || 0);
        }
      } catch (err: any) {
        console.error("Module access exception:", err);
        diagnosticResults.moduleAccessException = err.message;
      }
      
      // Attempt 3: Test RPC function
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
      
      // Attempt 4: Try full diagnostic with admin-bypass
      if (isKonointer) {
        try {
          console.log("Attempt 4: Using admin-bypass full diagnostic");
          const { data, error } = await supabase.functions.invoke("admin-bypass", {
            body: { action: "diagnostic" }
          });
          
          if (error) {
            console.error("Admin bypass error:", error);
            diagnosticResults.adminBypassError = error.message;
          } else {
            console.log("Admin bypass diagnostic results:", data);
            // Merge data but don't overwrite existing fields
            Object.keys(data || {}).forEach(key => {
              if (!diagnosticResults[key]) {
                diagnosticResults[key] = data[key];
              }
            });
          }
        } catch (err: any) {
          console.error("Admin bypass exception:", err);
          diagnosticResults.adminBypassException = err.message;
        }
      }
      
      // Set the final diagnostic data
      setDiagnosticData(diagnosticResults);
      setIsDiagnosticOpen(true);
      
      // Recommendations
      const hasRoleIssue = diagnosticResults.roleData?.role !== 'super_admin';
      const hasAccessIssue = !diagnosticResults.moduleAccessResult;
      const hasRpcIssue = !diagnosticResults.rpcAccessResult;
      
      if ((hasRoleIssue || hasAccessIssue || hasRpcIssue) && !forcedAdminMode) {
        toast({
          title: "Problèmes d'accès détectés",
          description: "Des problèmes d'accès ont été identifiés. Le mode forcé est recommandé.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Diagnostic terminé",
          description: "Le rapport de diagnostic est disponible.",
        });
      }
      
      return diagnosticResults;
    } catch (error) {
      console.error("Diagnostic error:", error);
      toast({
        title: "Erreur de diagnostic",
        description: "Impossible d'exécuter le diagnostic complet",
        variant: "destructive",
      });
      return null;
    } finally {
      setDiagnosticRunning(false);
    }
  }, [user, role, forcedAdminMode, isSpecialAdmin, isKonointer, toast]);

  return {
    diagnosticData,
    isDiagnosticOpen,
    setIsDiagnosticOpen,
    diagnosticRunning,
    runAdminDiagnostic,
    isKonointer
  };
};
