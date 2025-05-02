
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserService } from "./UserService";
import { Shield, Loader2 } from "lucide-react";

export const FixRoleButton = () => {
  const { user } = useAuth();
  const { refreshRole } = useUserRole();
  const { makeSelfSuperAdmin } = useUserService();
  const [isLoading, setIsLoading] = useState(false);

  const handleFixRole = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Attribuer le rôle Super Admin
      await makeSelfSuperAdmin(user.id);
      
      // Actualiser le rôle dans le contexte
      await refreshRole();
      
      // Rafraîchir la page pour appliquer les nouvelles permissions
      window.location.reload();
    } catch (error) {
      console.error("Erreur lors de la réparation du rôle:", error);
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
