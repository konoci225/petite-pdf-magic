
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
      // Using direct upsert approach instead of RPC function since we're having permission issues
      console.log("Attempting to set super_admin role for:", user.id);
      
      // Directly upsert into user_roles table
      const { error: directUpsertError } = await supabase
        .from("user_roles")
        .upsert({ 
          user_id: user.id,
          role: "super_admin" 
        }, { onConflict: "user_id" });
      
      if (directUpsertError) {
        console.error("Error during direct upsert:", directUpsertError);
        throw new Error(`Échec de l'attribution du rôle: ${directUpsertError.message}`);
      }
      
      // Verify that the role was properly assigned
      const { data: checkRole, error: checkError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();
        
      if (checkError || !checkRole || checkRole.role !== "super_admin") {
        console.error("Role verification failed:", checkError || "Incorrect role");
        throw new Error("La vérification du rôle a échoué");
      }
      
      console.log("Role successfully assigned:", checkRole);
      
      // Refresh the session and role
      await refreshSession();
      await refreshRole();
      
      toast({
        title: "Droits d'accès réparés",
        description: "Vous avez maintenant le rôle Super Admin. La page va se recharger.",
      });
      
      // Reload the page to apply the new permissions
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error("Detailed error during role repair:", error);
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
