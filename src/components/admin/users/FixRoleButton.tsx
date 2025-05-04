
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
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
      console.log("Tentative de réparation des droits d'accès pour:", user.id, user.email);
      
      let success = false;
      
      // Méthode 1: Essayer d'abord avec la fonction RPC renforcée
      try {
        const { error: rpcError } = await supabase.rpc(
          'force_set_super_admin_role',
          { target_user_id: user.id }
        );
        
        if (!rpcError) {
          console.log("Rôle attribué avec succès via fonction RPC");
          success = true;
        } else {
          console.error("Erreur lors de l'utilisation de la fonction RPC:", rpcError);
        }
      } catch (rpcError) {
        console.error("Exception lors de l'appel de la fonction RPC:", rpcError);
      }
      
      // Méthode 2: Si la méthode RPC échoue, essayer la méthode directe avec les nouvelles politiques RLS
      if (!success) {
        console.log("Tentative d'attribution directe du rôle super_admin");
        const { error: directUpsertError } = await supabase
          .from("user_roles")
          .upsert({ 
            user_id: user.id,
            role: "super_admin" 
          }, { onConflict: "user_id" });
        
        if (directUpsertError) {
          console.error("Erreur lors de l'attribution directe:", directUpsertError);
          throw new Error(`Échec de l'attribution du rôle: ${directUpsertError.message}`);
        } else {
          console.log("Rôle attribué avec succès via upsert direct");
        }
      }
      
      // Vérifier que le rôle a été correctement attribué
      const { data: checkRole, error: checkError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();
        
      if (checkError || !checkRole || checkRole.role !== "super_admin") {
        console.error("Vérification du rôle échouée:", checkError || "Rôle incorrect");
        throw new Error("La vérification du rôle a échoué");
      }
      
      console.log("Rôle vérifié avec succès:", checkRole);
      
      // Actualiser la session et le rôle
      await refreshSession();
      await refreshRole();
      
      toast({
        title: "Droits d'accès réparés",
        description: "Vous avez maintenant le rôle Super Admin. La page va se recharger.",
      });
      
      // Recharger la page pour appliquer les nouvelles permissions
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error("Détail de l'erreur lors de la réparation des droits:", error);
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
