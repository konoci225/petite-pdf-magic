
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Shield, Loader2 } from "lucide-react";

const FixRoleButton = () => {
  const [isRepairing, setIsRepairing] = useState(false);
  const { user } = useAuth();
  const { refreshRole, isSpecialAdmin } = useUserRole();
  const { toast } = useToast();

  const handleRepairPermissions = async () => {
    if (!user) return;
    
    setIsRepairing(true);
    try {
      console.log("Tentative de réparation des permissions pour", user.email);
      
      // Method 1: Try with the edge function
      try {
        const { data, error } = await supabase.functions.invoke("set-admin-role", {
          body: { email: user.email }
        });
        
        if (error) {
          console.error("Erreur avec la fonction edge:", error);
        } else if (data && data.success) {
          console.log("Réparation réussie via fonction edge");
          await refreshRole();
          toast({
            title: "Succès",
            description: "Permissions réparées avec succès via Edge Function",
          });
          setTimeout(() => window.location.reload(), 1500);
          return;
        }
      } catch (edgeErr) {
        console.log("Erreur Edge silencieuse:", edgeErr);
      }
      
      // Method 2: Try with RPC function
      try {
        const { error: rpcError } = await supabase.rpc(
          'force_set_super_admin_role',
          { target_user_id: user.id }
        );
        
        if (!rpcError) {
          console.log("Réparation réussie via RPC");
          await refreshRole();
          toast({
            title: "Succès",
            description: "Permissions réparées via RPC",
          });
          setTimeout(() => window.location.reload(), 1500);
          return;
        }
      } catch (rpcErr) {
        console.error("Erreur RPC:", rpcErr);
      }
      
      // Method 3: Direct upsert as last resort
      const { error: upsertError } = await supabase
        .from("user_roles")
        .upsert({ 
          user_id: user.id,
          role: "super_admin" 
        }, { onConflict: "user_id" });
      
      if (upsertError) {
        console.error("Erreur lors de l'upsert direct:", upsertError);
        throw upsertError;
      } else {
        console.log("Réparation réussie via upsert direct");
      }
      
      // Update local role state
      await refreshRole();
      
      toast({
        title: "Succès",
        description: "Vos autorisations ont été réparées. La page va se recharger.",
      });
      
      // Reload page to apply new permissions
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error: any) {
      console.error("Erreur de réparation des autorisations:", error);
      
      if (isSpecialAdmin) {
        // If this is the special admin, we need to at least set the role locally
        toast({
          title: "Mode de secours",
          description: "Attribution du rôle super_admin localement uniquement.",
        });
        
        // Force the role to be set locally in the application state
        await refreshRole();
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast({
          title: "Erreur",
          description: `Impossible de réparer les autorisations : ${error.message}`,
          variant: "destructive",
        });
      }
    } finally {
      setIsRepairing(false);
    }
  };

  return (
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
      Réparer les autorisations administrateur
    </Button>
  );
};

export default FixRoleButton;
