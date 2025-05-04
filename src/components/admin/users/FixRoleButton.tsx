
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
      console.log("Tentative forcée de réparation des droits d'accès pour:", user.id, user.email);
      
      // Approche combinée : utiliser plusieurs méthodes pour contourner les limitations RLS
      
      // Méthode 1: Utiliser la fonction force_set_super_admin_role (compatible avec les types TS)
      try {
        const { error: rpcError } = await supabase.rpc(
          'force_set_super_admin_role',
          { target_user_id: user.id }
        );
        
        if (rpcError) {
          console.error("Erreur lors de l'utilisation de la fonction RPC:", rpcError);
        } else {
          console.log("Méthode RPC réussie");
        }
      } catch (rpcError) {
        console.error("Exception lors de l'appel de la fonction RPC:", rpcError);
      }
      
      // Méthode 2: Insertion directe avec les nouvelles politiques RLS
      try {
        const { error: directUpsertError } = await supabase
          .from("user_roles")
          .upsert({ 
            user_id: user.id,
            role: "super_admin" 
          }, { onConflict: "user_id" });
        
        if (directUpsertError) {
          console.error("Erreur lors de l'attribution directe:", directUpsertError);
        } else {
          console.log("Méthode d'upsert direct réussie");
        }
      } catch (directError) {
        console.error("Exception lors de l'upsert direct:", directError);
      }
      
      // Vérifier que le rôle a été correctement attribué
      const { data: checkRole, error: checkError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();
        
      console.log("Vérification du rôle:", checkRole, checkError);
      
      if (checkError) {
        console.error("Erreur lors de la vérification du rôle:", checkError);
      }
      
      // Forcer la mise à jour du rôle dans la session et l'interface
      await refreshSession();
      await refreshRole();
      
      toast({
        title: "Tentative de réparation effectuée",
        description: "Actualisation de votre session. La page va se recharger dans quelques secondes.",
      });
      
      // Forcer un rechargement complet de la page
      setTimeout(() => {
        window.location.reload();
      }, 2000);
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
