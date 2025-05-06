
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
      
      // Essayez d'abord avec la fonction Edge
      const { data, error } = await supabase.functions.invoke("set-admin-role", {
        body: { email: user.email }
      });
      
      if (error) {
        console.error("Erreur avec la fonction edge:", error);
        throw error;
      }
      
      console.log("Réponse de la fonction edge:", data);
      
      if (!data.success) {
        throw new Error(data.error || "Échec de la réparation des autorisations");
      }
      
      // Méthode alternative avec upsert direct
      if (!data.success) {
        console.log("Tentative avec méthode alternative...");
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
      }
      
      console.log("Mise à jour du rôle réussie, actualisation...");
      
      // Actualiser le rôle
      await refreshRole();
      
      toast({
        title: "Succès",
        description: "Vos autorisations ont été réparées avec succès. La page va se recharger.",
      });
      
      // Recharger la page pour appliquer les nouvelles permissions
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
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
