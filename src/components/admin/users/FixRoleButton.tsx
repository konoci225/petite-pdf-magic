
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
      // Attribution directe du rôle super_admin
      console.log("Attribution directe du rôle super_admin pour:", user.id);
      
      // Utilisation de la fonction RPC personnalisée via Supabase
      const { error: upsertError } = await supabase.rpc(
        // Type assertion pour contourner la vérification TypeScript
        'force_set_super_admin_role' as unknown as string, 
        { target_user_id: user.id }
      );
      
      if (upsertError) {
        // Si la fonction RPC échoue, essayer l'approche directe via upsert
        console.log("La fonction RPC a échoué, tentative d'upsert direct");
        console.error("Erreur RPC:", upsertError);
        
        const { error: directUpsertError } = await supabase
          .from("user_roles")
          .upsert({ 
            user_id: user.id,
            role: "super_admin" 
          }, { onConflict: "user_id" });
        
        if (directUpsertError) {
          throw new Error(`Échec de l'attribution du rôle: ${directUpsertError.message}`);
        }
      }
      
      // Vérifier que le rôle a été attribué correctement
      const { data: checkRole, error: checkError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();
        
      if (checkError || !checkRole || checkRole.role !== "super_admin") {
        console.error("Vérification du rôle échouée:", checkError || "Rôle incorrect");
        throw new Error("La vérification du rôle a échoué");
      }
      
      console.log("Rôle attribué avec succès:", checkRole);
      
      // Actualiser la session et le rôle
      await refreshSession();
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
