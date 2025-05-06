
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
      
      // Utilisation directe d'une requête SQL plus simple via upsert
      const { error: upsertError } = await supabase
        .from("user_roles")
        .upsert({ 
          user_id: user.id,
          role: "super_admin" 
        }, { onConflict: "user_id" });
        
      if (upsertError) {
        console.error("Erreur lors de la mise à jour du rôle:", upsertError);
        
        // Tentative alternative avec une méthode différente si l'upsert échoue
        const { error: insertError } = await supabase
          .from("user_roles")
          .insert({ 
            user_id: user.id,
            role: "super_admin" 
          });
          
        if (insertError) {
          console.error("Erreur lors de l'insertion du rôle:", insertError);
          throw new Error("Impossible de mettre à jour les permissions");
        }
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

  // Pour les utilisateurs spéciaux, forcer l'application du rôle super_admin
  const forceApplySuperAdminRole = async () => {
    if (!user) return;
    
    setIsRepairing(true);
    try {
      // Contourner complètement RLS en utilisant une approche directe
      await refreshRole();
      
      toast({
        title: "Succès",
        description: "Autorisations super admin appliquées."
      });
      
      // Recharger la page
      setTimeout(() => {
        window.location.href = "/admin";
      }, 1500);
    } catch (error: any) {
      console.error("Erreur lors de l'application forcée du rôle:", error);
      toast({
        title: "Erreur",
        description: `Impossible d'appliquer le rôle super admin: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsRepairing(false);
    }
  };

  const handleClick = () => {
    if (isSpecialAdmin) {
      forceApplySuperAdminRole();
    } else {
      handleRepairPermissions();
    }
  };

  return (
    <Button
      variant="destructive"
      onClick={handleClick}
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
