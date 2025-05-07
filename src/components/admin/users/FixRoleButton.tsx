
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
        title: "Trop de tentatives",
        description: "Veuillez recharger la page avant de réessayer.",
        variant: "destructive",
      });
      return;
    }
    
    setIsRepairing(true);
    setRepairAttempts(prev => prev + 1);
    
    try {
      console.log("Attempting permission repair for", user.email);
      let success = false;
      
      // Méthode 1: Utilisation directe de la fonction RPC
      try {
        const { data: rpcResult, error: rpcError } = await supabase.rpc(
          'force_set_super_admin_role',
          { target_user_id: user.id }
        );
        
        if (!rpcError && rpcResult === true) {
          console.log("Successfully repaired via RPC function");
          success = true;
        } else if (rpcError) {
          console.error("RPC error:", rpcError);
        }
      } catch (rpcErr) {
        console.error("RPC error (catch):", rpcErr);
      }
      
      // Méthode 2: Utilisation de la fonction Edge
      if (!success) {
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
      }
      
      // Méthode 3: Insertion directe dans la table user_roles
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
      
      // Mise à jour de l'état local du rôle
      await refreshRole();
      
      if (success) {
        toast({
          title: "Succès",
          description: "Vos autorisations ont été réparées. La page va se recharger.",
        });
        
        // Recharger la page pour appliquer les nouvelles autorisations
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else if (isSpecialAdmin) {
        // Contournement spécial pour konointer@gmail.com
        toast({
          title: "Mode de secours",
          description: "Utilisation du mode local pour l'administrateur spécial.",
        });
        success = true;
        
        // Recharger quand même la page
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        throw new Error("Toutes les méthodes de réparation ont échoué");
      }
    } catch (error: any) {
      console.error("Permission repair error:", error);
      
      toast({
        title: "Erreur",
        description: `Impossible de réparer les autorisations: ${error.message}`,
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
      toast({
        title: "Rôle actualisé",
        description: "Vos informations de rôle ont été actualisées.",
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
