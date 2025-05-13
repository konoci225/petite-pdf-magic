
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types"; 
import { useToast } from "@/hooks/use-toast";
import { useAdminModeService, SPECIAL_ADMIN_EMAIL } from "@/services/AdminModeService";
import { useRoleManagement } from "@/hooks/admin/useRoleManagement";

type AppRole = Database["public"]["Enums"]["app_role"];

export const useUserRole = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  
  // Special admin detection - very important for bypass mechanisms
  const isSpecialAdmin = user?.email === SPECIAL_ADMIN_EMAIL;
  
  // Get admin mode service
  const { 
    forcedAdminMode: isForcedAdminMode, 
    enableForcedAdminMode 
  } = useAdminModeService(user?.email);
  
  // Get role management utilities
  const {
    ensureRoleWithEdgeFunction,
    ensureRoleDirectly,
    diagnosticRole,
    hasTriedEdgeFunction,
    hasTriedDirectRepair
  } = useRoleManagement(user, isSpecialAdmin);
  
  // Role clearing on logout
  const clearRole = useCallback(() => {
    setRole(null);
    setIsLoading(false);
  }, []);

  // Automatically apply special admin role for the designated user or forced mode
  const applySpecialAdminRole = useCallback(() => {
    if (isSpecialAdmin || isForcedAdminMode) {
      console.log("Applying super_admin role locally for special admin or forced mode");
      setRole('super_admin');
      return true;
    }
    return false;
  }, [isSpecialAdmin, isForcedAdminMode]);

  // Manual refresh function
  const refreshRole = useCallback(async (forceRepair = false) => {
    if (!user) {
      clearRole();
      return;
    }
    
    const now = Date.now();
    if (now - lastRefreshTime < 1000) {
      console.log("Refresh rate limited to avoid loops");
      return;
    }
    
    setIsLoading(true);
    setLastRefreshTime(now);
    
    try {
      console.log("Refreshing role for", user.email);
      
      // Check for forced admin mode first (highest priority)
      if (isForcedAdminMode) {
        console.log("Forced admin mode detected - setting super_admin role locally");
        setRole('super_admin');
        setIsLoading(false);
        return;
      }
      
      // Special admin always gets the super_admin role locally first
      if (isSpecialAdmin) {
        applySpecialAdminRole();
        
        if (forceRepair && !hasTriedEdgeFunction) {
          await ensureRoleWithEdgeFunction();
        }
        
        if (forceRepair && !hasTriedDirectRepair) {
          await ensureRoleDirectly();
        }
        
        setIsLoading(false);
        return;
      }
      
      // For regular users, try to get the role from the database
      try {
        const { data: userRole, error } = await supabase
          .from('user_roles')
          .select('role, updated_at')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching role:", error);
          setRole(null);
        } else {
          console.log("Role fetched:", userRole?.role, "Last updated:", userRole?.updated_at);
          setRole(userRole?.role || null);
        }
      } catch (error) {
        console.error("Error refreshing role:", error);
        setRole(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    user, 
    isSpecialAdmin, 
    applySpecialAdminRole, 
    clearRole, 
    ensureRoleWithEdgeFunction, 
    hasTriedEdgeFunction, 
    hasTriedDirectRepair, 
    ensureRoleDirectly, 
    lastRefreshTime, 
    isForcedAdminMode
  ]);

  // Load role on user change
  useEffect(() => {
    refreshRole();
  }, [user, refreshRole]);

  // Force super_admin role for special admin or forced mode
  useEffect(() => {
    if ((isSpecialAdmin || isForcedAdminMode) && (!role || role !== 'super_admin')) {
      applySpecialAdminRole();
    }
  }, [isSpecialAdmin, role, applySpecialAdminRole, isForcedAdminMode]);

  return { 
    role, 
    isLoading, 
    refreshRole, 
    clearRole,
    isSpecialAdmin,
    ensureRoleWithEdgeFunction,
    isForcedAdminMode,
    enableForcedAdminMode,
    diagnosticRole
  };
};
