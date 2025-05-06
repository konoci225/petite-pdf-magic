
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";

export const useAdminAccess = () => {
  const { user } = useAuth();
  const { role, refreshRole, isSpecialAdmin, ensureRoleWithEdgeFunction } = useUserRole();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [tablesAccessible, setTablesAccessible] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastRepairAttempt, setLastRepairAttempt] = useState<Date | null>(null);

  // Function to check if required tables exist and are accessible
  const ensureTablesExist = useCallback(async () => {
    try {
      console.log("Checking required tables...");

      // Special admin always has access
      if (isSpecialAdmin) {
        console.log("Special user detected, access automatically granted");
        return true;
      }
      
      // If the user has super_admin role, try to access the modules table
      if (role === 'super_admin') {
        const { data, error } = await supabase
          .from('modules')
          .select('id')
          .limit(1);
          
        if (error) {
          console.error("Error accessing modules table:", error);
          return false;
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error checking tables:", error);
      return false;
    }
  }, [isSpecialAdmin, role]);

  // Debounced repair function to prevent too many attempts in a short time
  const canAttemptRepair = useCallback(() => {
    if (!lastRepairAttempt) return true;
    
    const timeSinceLastAttempt = Date.now() - lastRepairAttempt.getTime();
    return timeSinceLastAttempt > 10000; // 10 seconds cooldown
  }, [lastRepairAttempt]);

  // Force refresh permissions function
  const forceRefreshPermissions = useCallback(async () => {
    if (!canAttemptRepair()) {
      toast({
        title: "Please wait",
        description: "Too many repair attempts. Please wait a few seconds before trying again.",
      });
      return;
    }
    
    setIsLoading(true);
    setLastRepairAttempt(new Date());
    
    try {
      console.log("Forced permissions refresh...");
      
      // Always refresh role
      await refreshRole();
      
      // For special admin users, try repair methods
      if (isSpecialAdmin) {
        console.log("Attempting repairs for", user?.email);
        
        // Try all possible repair methods
        const repairMethods = [
          // Method 1: Edge Function
          async () => {
            try {
              const { data, error } = await supabase.functions.invoke("set-admin-role", {
                body: { email: user?.email }
              });
              
              if (error) {
                console.error("Edge function error:", error);
                return false;
              }
              
              return true;
            } catch (e) {
              console.error("Edge function error:", e);
              return false;
            }
          },
          
          // Method 2: RPC
          async () => {
            try {
              const { error: rpcError } = await supabase.rpc(
                'force_set_super_admin_role',
                { target_user_id: user?.id }
              );
              
              if (rpcError) {
                console.error("RPC error:", rpcError);
                return false;
              }
              
              return true;
            } catch (e) {
              console.error("RPC error:", e);
              return false;
            }
          },
          
          // Method 3: Direct upsert
          async () => {
            try {
              const { error: upsertError } = await supabase
                .from("user_roles")
                .upsert({ 
                  user_id: user?.id,
                  role: "super_admin" 
                }, { onConflict: "user_id" });
                
              if (upsertError) {
                console.error("Upsert error:", upsertError);
                return false;
              }
              
              return true;
            } catch (e) {
              console.error("Upsert error:", e);
              return false;
            }
          },
        ];
        
        // Try each method until one succeeds
        for (const method of repairMethods) {
          const success = await method();
          if (success) {
            console.log("Successfully repaired permissions");
            break;
          }
        }
      }
      
      // Check tables access
      const accessible = await ensureTablesExist();
      setTablesAccessible(accessible);
      
      if (accessible) {
        toast({
          title: "Access restored",
          description: "Data access has been successfully restored.",
        });
      } else if (isSpecialAdmin) {
        toast({
          title: "Special access mode",
          description: "Running in special admin mode with limited database access.",
        });
      }
      
      setRetryCount(prev => prev + 1);
    } catch (error: any) {
      console.error("Error during refresh:", error);
      toast({
        title: "Error",
        description: "Problem refreshing permissions: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, isSpecialAdmin, refreshRole, ensureTablesExist, toast, canAttemptRepair]);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        console.log("Checking database tables access...");
        
        // Special admin always has access
        if (isSpecialAdmin) {
          console.log("Special user detected, access automatically granted");
          setTablesAccessible(true);
          
          // Try to update the role in the background
          if (role !== 'super_admin') {
            ensureRoleWithEdgeFunction();
          }
          
          setIsLoading(false);
          return;
        }
        
        // Check tables for regular users
        const accessible = await ensureTablesExist();
        setTablesAccessible(accessible);
      } catch (error: any) {
        console.error("Error checking admin access:", error);
        toast({
          title: "Error",
          description: "Admin dashboard access problem: " + error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAccess();
  }, [user, isSpecialAdmin, ensureTablesExist, role, ensureRoleWithEdgeFunction, toast]);

  return {
    isLoading,
    tablesAccessible,
    retryCount,
    isSpecialAdmin,
    forceRefreshPermissions,
    refreshRole
  };
};
