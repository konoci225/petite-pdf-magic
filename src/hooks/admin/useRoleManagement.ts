
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export const useRoleManagement = (user: any | null, isSpecialAdmin: boolean) => {
  const [hasTriedEdgeFunction, setHasTriedEdgeFunction] = useState(false);
  const [hasTriedDirectRepair, setHasTriedDirectRepair] = useState(false);
  
  // Emergency repair method using Edge Function
  const ensureRoleWithEdgeFunction = useCallback(async () => {
    if (!user || hasTriedEdgeFunction) return false;
    
    setHasTriedEdgeFunction(true);
    try {
      console.log("Attempting to set role via Edge Function for special admin");
      
      const { data, error } = await supabase.functions.invoke("set-admin-role", {
        body: { 
          email: user.email,
          userId: user.id,
          forceRepair: true
        }
      });
      
      if (error) {
        console.error("Edge function error:", error);
        return false;
      }
      
      console.log("Edge function response:", data);
      return data?.success || false;
    } catch (err) {
      console.error("Edge function error (catch):", err);
      return false;
    }
  }, [user, hasTriedEdgeFunction]);

  // Direct database repair attempt (last resort)
  const ensureRoleDirectly = useCallback(async () => {
    if (!user || !isSpecialAdmin || hasTriedDirectRepair) return false;
    
    setHasTriedDirectRepair(true);
    try {
      console.log("Attempting direct database repair for special admin");
      
      // Attempt using the admin-bypass function
      const { data, error } = await supabase.functions.invoke("admin-bypass", {
        body: { 
          action: "force_super_admin_role",
          targetUserId: user.id
        }
      });
      
      if (error) {
        console.error("Direct repair error:", error);
        return false;
      }
      
      console.log("Direct repair response:", data);
      return data?.success || false;
    } catch (err) {
      console.error("Direct repair error (catch):", err);
      return false;
    }
  }, [user, isSpecialAdmin, hasTriedDirectRepair]);

  // Diagnostic function to help troubleshoot role issues
  const diagnosticRole = useCallback(async (): Promise<any> => {
    if (!user) return null;
    
    try {
      console.log("Running role diagnostic via admin-bypass");
      const { data, error } = await supabase.functions.invoke("admin-bypass", {
        body: { action: "diagnostic" }
      });
      
      if (error) {
        console.error("Diagnostic error:", error);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error("Exception during diagnostic:", err);
      return null;
    }
  }, [user]);

  return {
    ensureRoleWithEdgeFunction,
    ensureRoleDirectly,
    diagnosticRole,
    hasTriedEdgeFunction,
    hasTriedDirectRepair
  };
};
