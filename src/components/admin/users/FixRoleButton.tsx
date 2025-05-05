
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
  const { refreshRole } = useUserRole();
  const { toast } = useToast();

  const handleRepairPermissions = async () => {
    if (!user) return;
    
    setIsRepairing(true);
    try {
      console.log("Tentative de réparation des permissions pour", user.email);
      
      // Éviter d'utiliser la fonction RPC qui pose problème
      // Utiliser directement l'upsert dans la table user_roles
      const { error: upsertError } = await supabase
        .from("user_roles")
        .upsert({ 
          user_id: user.id,
          role: "super_admin" 
        }, { onConflict: "user_id" });
        
      if (upsertError) {
        console.error("Erreur lors de la mise à jour du rôle:", upsertError);
        throw upsertError;
      }
      
      console.log("Mise à jour du rôle réussie, actualisation...");
      
      // Actualiser le rôle
      await refreshRole();
      
      toast({
        title: "Succès",
        description: "Vos autorisations ont été réparées avec succès.",
      });
      
      // Recharger la page pour appliquer les nouvelles permissions
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error: any) {
      console.error("Erreur de réparation des autorisations:", error);
      toast({
        title: "Erreur",
        description: `Impossible de réparer les autorisations : ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsRepairing(false);
    }
  };

  return (
    <Button
      variant="destructive"
      onClick={handleRepairPermissions}
      disabled={isRepairing}
      className="flex items-center"
    >
      {isRepairing ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Shield className="h-4 w-4 mr-2" />
      )}
      Réparer les autorisations
    </Button>
  );
};

export default FixRoleButton;
