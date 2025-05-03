
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserService } from "./UserService";
import { Shield, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const FixRoleButton = () => {
  const { user, refreshSession } = useAuth();
  const { refreshRole } = useUserRole();
  const { makeSelfSuperAdmin } = useUserService();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFixRole = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Attribuer le rôle Super Admin
      console.log("Tentative d'attribution du rôle Super Admin...");
      const success = await makeSelfSuperAdmin(user.id);
      
      if (!success) {
        throw new Error("Échec de l'attribution du rôle Super Admin");
      }
      
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
    } catch (error) {
      console.error("Erreur lors de la réparation du rôle:", error);
      toast({
        title: "Erreur",
        description: "Impossible de réparer les droits d'accès. Veuillez réessayer.",
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
