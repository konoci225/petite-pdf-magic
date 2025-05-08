
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types"; 
import { useToast } from "@/hooks/use-toast";

type AppRole = Database["public"]["Enums"]["app_role"];

// Key for the mode admin forcé
const FORCED_ADMIN_MODE_KEY = 'app_forced_admin_mode';
const SPECIAL_ADMIN_EMAIL = 'konointer@gmail.com';

export const useUserRole = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const [hasTriedEdgeFunction, setHasTriedEdgeFunction] = useState(false);
  const [hasTriedDirectRepair, setHasTriedDirectRepair] = useState(false);
  
  // Special admin detection - very important for bypass mechanisms
  const isSpecialAdmin = user?.email === SPECIAL_ADMIN_EMAIL;
  
  // Check for forced admin mode
  const isForcedAdminMode = useCallback(() => {
    return localStorage.getItem(FORCED_ADMIN_MODE_KEY) === 'true';
  }, []);
  
  const enableForcedAdminMode = useCallback(() => {
    if (isSpecialAdmin) {
      localStorage.setItem(FORCED_ADMIN_MODE_KEY, 'true');
      setRole('super_admin');
      toast({
        title: "Mode administrateur forcé activé",
        description: "Contournement des vérifications de sécurité pour l'administrateur spécial."
      });
      return true;
    }
    return false;
  }, [isSpecialAdmin, toast]);
  
  // Role clearing on logout
  const clearRole = useCallback(() => {
    setRole(null);
    setIsLoading(false);
    setHasTriedEdgeFunction(false);
    setHasTriedDirectRepair(false);
  }, []);

  // Check URL for admin force parameter (for emergency access)
  useEffect(() => {
    if (isSpecialAdmin) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('forceAdmin') === 'true') {
        enableForcedAdminMode();
      }
    }
  }, [isSpecialAdmin, enableForcedAdminMode]);

  // Automatically apply special admin role for the designated user or forced mode
  const applySpecialAdminRole = useCallback(() => {
    if (isSpecialAdmin || isForcedAdminMode()) {
      console.log("Applying super_admin role locally for special admin or forced mode");
      setRole('super_admin');
      return true;
    }
    return false;
  }, [isSpecialAdmin, isForcedAdminMode]);

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
      if (isForcedAdminMode()) {
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
  }, [user, isSpecialAdmin, applySpecialAdminRole, clearRole, ensureRoleWithEdgeFunction, hasTriedEdgeFunction, hasTriedDirectRepair, ensureRoleDirectly, lastRefreshTime, isForcedAdminMode]);

  // Load role on user change
  useEffect(() => {
    refreshRole();
  }, [user, refreshRole]);

  // Force super_admin role for special admin or forced mode
  useEffect(() => {
    if ((isSpecialAdmin || isForcedAdminMode()) && (!role || role !== 'super_admin')) {
      applySpecialAdminRole();
    }
  }, [isSpecialAdmin, role, applySpecialAdminRole, isForcedAdminMode]);

  // Listen for forced admin mode changes
  useEffect(() => {
    const checkForcedMode = () => {
      if (isForcedAdminMode() && role !== 'super_admin') {
        setRole('super_admin');
      }
    };
    
    window.addEventListener('storage', checkForcedMode);
    return () => {
      window.removeEventListener('storage', checkForcedMode);
    };
  }, [role, isForcedAdminMode]);

  return { 
    role, 
    isLoading, 
    refreshRole, 
    clearRole,
    isSpecialAdmin,
    ensureRoleWithEdgeFunction,
    isForcedAdminMode: isForcedAdminMode(),
    enableForcedAdminMode,
    diagnosticRole
  };
};
