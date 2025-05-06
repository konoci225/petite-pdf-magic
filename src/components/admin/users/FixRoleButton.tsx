
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Shield, Loader2, RefreshCw } from "lucide-react";

const FixRoleButton = () => {
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairAttempts, setRepairAttempts] = useState(0);
  const { user } = useAuth();
  const { refreshRole, isSpecialAdmin, ensureRoleWithEdgeFunction } = useUserRole();
  const { toast } = useToast();

  // Simple debounce mechanism
  const canAttemptRepair = useCallback(() => {
    return repairAttempts < 3; // Allow up to 3 attempts without reload
  }, [repairAttempts]);

  const handleRepairPermissions = async () => {
    if (!user || isRepairing) return;
    
    if (!canAttemptRepair()) {
      toast({
        title: "Too many attempts",
        description: "Please reload the page before trying again.",
        variant: "destructive",
      });
      return;
    }
    
    setIsRepairing(true);
    setRepairAttempts(prev => prev + 1);
    
    try {
      console.log("Attempting permission repair for", user.email);
      
      // Step 1: First try the Edge Function (most reliable)
      let success = false;
      
      try {
        const { data, error } = await supabase.functions.invoke("set-admin-role", {
          body: { email: user.email, userId: user.id }
        });
        
        if (!error && data?.success) {
          console.log("Successfully repaired via Edge Function");
          success = true;
        } else if (error) {
          console.error("Edge Function error:", error);
        }
      } catch (edgeErr) {
        console.error("Edge Function error (catch):", edgeErr);
      }
      
      // Step 2: Try the RPC function
      if (!success) {
        try {
          const { error: rpcError, data: rpcData } = await supabase.rpc(
            'force_set_super_admin_role',
            { target_user_id: user.id }
          );
          
          if (!rpcError && rpcData) {
            console.log("Successfully repaired via RPC");
            success = true;
          } else if (rpcError) {
            console.error("RPC error:", rpcError);
          }
        } catch (rpcErr) {
          console.error("RPC error (catch):", rpcErr);
        }
      }
      
      // Step 3: Try direct upsert
      if (!success) {
        try {
          const { error: upsertError } = await supabase
            .from("user_roles")
            .upsert({ 
              user_id: user.id,
              role: "super_admin" 
            }, { onConflict: "user_id" });
          
          if (!upsertError) {
            console.log("Successfully repaired via direct upsert");
            success = true;
          } else {
            console.error("Upsert error:", upsertError);
          }
        } catch (upsertErr) {
          console.error("Upsert error (catch):", upsertErr);
        }
      }
      
      // Step 4: Try ensure_special_admin
      if (!success && isSpecialAdmin) {
        try {
          const { error: ensureError } = await supabase.rpc('ensure_special_admin');
          
          if (!ensureError) {
            console.log("Successfully repaired via ensure_special_admin");
            success = true;
          } else {
            console.error("ensure_special_admin error:", ensureError);
          }
        } catch (ensureErr) {
          console.error("ensure_special_admin error (catch):", ensureErr);
        }
      }
      
      // Update local role state
      await refreshRole();
      
      // Show success if any method worked
      if (success) {
        toast({
          title: "Success",
          description: "Your permissions have been repaired. The page will reload.",
        });
      } else if (isSpecialAdmin) {
        // Special fallback for konointer@gmail.com
        toast({
          title: "Fallback mode",
          description: "Using local override for special admin user.",
        });
        success = true;
      } else {
        throw new Error("All repair methods failed");
      }
      
      // Reload page on success to apply new permissions
      if (success) {
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error: any) {
      console.error("Permission repair error:", error);
      
      toast({
        title: "Error",
        description: `Unable to repair permissions: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsRepairing(false);
    }
  };

  const handleRefreshRole = async () => {
    setIsRepairing(true);
    try {
      await refreshRole();
      // For special admin, also try the edge function silently
      if (isSpecialAdmin) {
        ensureRoleWithEdgeFunction().catch(console.error);
      }
      toast({
        title: "Role refreshed",
        description: "Your role information has been refreshed.",
      });
    } catch (error) {
      console.error("Error refreshing role:", error);
    } finally {
      setIsRepairing(false);
    }
  };

  return (
    <div className="flex flex-col space-y-2 w-full">
      <Button
        variant="outline"
        onClick={handleRepairPermissions}
        disabled={isRepairing}
        className="flex items-center hover:border-red-300 hover:bg-red-50"
      >
        {isRepairing ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Shield className="h-4 w-4 mr-2 text-red-600" />
        )}
        {repairAttempts > 0 
          ? `Réparer les autorisations (tentative ${repairAttempts})` 
          : "Réparer les autorisations administrateur"}
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRefreshRole}
        disabled={isRepairing}
        className="text-xs"
      >
        <RefreshCw className="h-3 w-3 mr-1" />
        Actualiser le rôle seulement
      </Button>
    </div>
  );
};

export default FixRoleButton;
