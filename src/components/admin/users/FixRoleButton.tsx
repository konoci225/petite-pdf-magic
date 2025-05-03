
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserService } from "./UserService";
import { Shield, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const FixRoleButton = () => {
  const { user, refreshSession } = useAuth();
  const { refreshRole } = useUserRole();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleFixRole = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Étape 1: Insérer directement dans la table user_roles avec la fonction RPC
      console.log("Tentative d'attribution directe du rôle Super Admin...");
      
      // Utiliser directement une requête SQL pour mettre à jour ou insérer le rôle
      const { error: upsertError } = await supabase
        .from("user_roles")
        .upsert({ 
          user_id: user.id,
          role: "super_admin" 
        }, { onConflict: "user_id" });
      
      if (upsertError) {
        console.error("Erreur lors de l'upsert du rôle:", upsertError);
        throw new Error(`Échec de l'attribution du rôle: ${upsertError.message}`);
      }
      
      // Vérifier que le rôle a été attribué correctement
      const { data: checkRole, error: checkError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();
        
      if (checkError || !checkRole || checkRole.role !== "super_admin") {
        console.error("Vérification du rôle échouée:", checkError || "Rôle incorrect");
        throw new Error("La vérification du rôle a échoué");
      }
      
      console.log("Rôle attribué avec succès:", checkRole);
      
      // Actualiser la session
      console.log("Actualisation de la session...");
      await refreshSession();
      
      // Actualiser le rôle dans le contexte
      console.log("Actualisation du rôle dans le contexte...");
      await refreshRole();
      
      toast({
        title: "Droits d'accès réparés",
        description: "Vous avez maintenant le rôle Super Admin. La page va se recharger.",
      });
      
      // Rafraîchir la page pour appliquer les nouvelles permissions
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error("Erreur détaillée lors de la réparation du rôle:", error);
      toast({
        title: "Erreur",
        description: "Impossible de réparer les droits d'accès: " + (error.message || "Erreur inconnue"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleFixRole} 
      disabled={isLoading}
      className="gap-2"
      variant="secondary"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Shield className="h-4 w-4" />
      )}
      Réparer mes droits d'accès
    </Button>
  );
};

export default FixRoleButton;
