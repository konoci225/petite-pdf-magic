
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types"; 
import { useToast } from "@/hooks/use-toast";

type AppRole = Database["public"]["Enums"]["app_role"];

export const useUserRole = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasTriedFallbackMethod, setHasTriedFallbackMethod] = useState(false);
  
  // Reset role on logout
  const clearRole = useCallback(() => {
    setRole(null);
    setIsLoading(false);
    setHasTriedFallbackMethod(false);
  }, []);

  // Check if this is the special admin user
  const isSpecialAdmin = user?.email === 'konointer@gmail.com';
  
  // Apply super_admin role for special user
  const applySpecialAdminRole = useCallback(() => {
    if (isSpecialAdmin) {
      console.log("Applying super_admin role to special user");
      setRole('super_admin');
      return true;
    }
    return false;
  }, [isSpecialAdmin]);

  // Try to update the role in the database
  const updateRoleInDatabase = useCallback(async () => {
    if (!isSpecialAdmin || !user) return false;
    
    try {
      console.log("Attempting to update role in database for special user");
      
      // Try running the force_set_super_admin_role RPC function which is in our TypeScript types
      try {
        // Using the force_set_super_admin_role function instead of ensure_special_admin
        const { data, error } = await supabase.rpc('force_set_super_admin_role', {
          target_user_id: user.id
        });
        
        if (error) {
          console.error("Error with force_set_super_admin_role:", error);
          return false;
        }
        
        console.log("Successfully ran force_set_super_admin_role");
        return true;
      } catch (rpcErr) {
        console.error("Error with force_set_super_admin_role:", rpcErr);
      }
      
      // Try upsert directly
      const { error: upsertError } = await supabase
        .from("user_roles")
        .upsert({ 
          user_id: user.id, 
          role: "super_admin" 
        }, { onConflict: "user_id" });
        
      if (upsertError) {
        console.error("Error with direct upsert:", upsertError);
        return false;
      }
      
      console.log("Successfully updated role via direct upsert");
      return true;
    } catch (err) {
      console.error("Error updating role in database:", err);
      return false;
    }
  }, [isSpecialAdmin, user]);

  // Fallback method to ensure the role is set
  const ensureRoleWithEdgeFunction = useCallback(async () => {
    if (!isSpecialAdmin || !user || hasTriedFallbackMethod) return false;
    
    setHasTriedFallbackMethod(true);
    try {
      console.log("Trying to set role via Edge Function for special user");
      
      const { data, error } = await supabase.functions.invoke("set-admin-role", {
        body: { email: user.email }
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
  }, [isSpecialAdmin, user, hasTriedFallbackMethod]);

  // Function to manually refresh the role
  const refreshRole = useCallback(async () => {
    if (!user) {
      clearRole();
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Refreshing role for", user.email);
      
      // For the special user, always set super_admin role locally first
      if (isSpecialAdmin) {
        applySpecialAdminRole();
        
        // Try to also update the database record
        updateRoleInDatabase().catch(console.error);
        
        // If all else fails, try the edge function
        if (!hasTriedFallbackMethod) {
          ensureRoleWithEdgeFunction().catch(console.error);
        }
        
        setIsLoading(false);
        return;
      }
      
      // For regular users, try to get role from database
      try {
        const { data: userRole, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error("Error retrieving role:", error);
          setRole(null);
        } else {
          console.log("Retrieved role:", userRole?.role);
          setRole(userRole?.role || null);
        }
      } catch (error) {
        console.error("Error during role refresh:", error);
        setRole(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, isSpecialAdmin, applySpecialAdminRole, clearRole, updateRoleInDatabase, ensureRoleWithEdgeFunction, hasTriedFallbackMethod]);

  // Load role when user changes
  useEffect(() => {
    refreshRole();
  }, [user, refreshRole]);

  // Force super_admin role for special user
  useEffect(() => {
    if (isSpecialAdmin && role !== 'super_admin') {
      applySpecialAdminRole();
    }
  }, [isSpecialAdmin, role, applySpecialAdminRole]);

  return { 
    role, 
    isLoading, 
    refreshRole, 
    clearRole,
    isSpecialAdmin,
    ensureRoleWithEdgeFunction
  };
};
