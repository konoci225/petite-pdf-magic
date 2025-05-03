
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AppRole } from "../types";

export const useUserRoleService = () => {
  const { toast } = useToast();

  const changeUserRole = async (userId: string, newRole: AppRole): Promise<boolean> => {
    try {
      console.log(`Modification du rôle pour l'utilisateur ${userId} à ${newRole}`);
      
      // Mettre à jour ou insérer le rôle de l'utilisateur
      const { error } = await supabase
        .from("user_roles")
        .upsert({ 
          user_id: userId, 
          role: newRole 
        }, { onConflict: 'user_id' });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Succès",
        description: `Rôle de l'utilisateur modifié à ${newRole}`,
      });
      
      return true;
    } catch (error: any) {
      console.error("Erreur lors du changement de rôle:", error);
      toast({
        title: "Erreur",
        description: `Impossible de modifier le rôle: ${error.message}`,
        variant: "destructive",
      });
      return false;
    }
  };

  // Fonction pour définir le rôle Super Admin pour l'utilisateur actuel
  const makeSelfSuperAdmin = async (userId: string): Promise<boolean> => {
    try {
      console.log("Attribution du rôle Super Admin à l'utilisateur actuel:", userId);
      
      // Vérifier d'abord s'il existe déjà un enregistrement pour cet utilisateur
      const { data: existingRole, error: checkError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      console.log("Rôle existant:", existingRole);
      
      // Mettre à jour ou insérer le rôle
      const { error } = await supabase
        .from("user_roles")
        .upsert({
          user_id: userId,
          role: "super_admin" as AppRole
        });
        
      if (error) {
        console.error("Erreur Upsert:", error);
        throw error;
      }
      
      // Vérifier que le rôle a bien été mis à jour
      const { data: updatedRole, error: verifyError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (verifyError) throw verifyError;
      
      if (!updatedRole || updatedRole.role !== "super_admin") {
        throw new Error("Le rôle n'a pas été correctement mis à jour");
      }
      
      toast({
        title: "Succès",
        description: "Vous avez maintenant le rôle Super Admin",
      });
      
      return true;
    } catch (error: any) {
      console.error("Erreur lors de l'attribution du rôle Super Admin:", error);
      toast({
        title: "Erreur",
        description: `Impossible d'attribuer le rôle Super Admin: ${error.message}`,
        variant: "destructive",
      });
      return false;
    }
  };

  // Fonction pour vérifier si un utilisateur est un Super Admin
  const checkIsSuperAdmin = async (userId: string): Promise<boolean> => {
    try {
      console.log("Vérification si l'utilisateur est Super Admin:", userId);
      
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (error) throw error;
      
      return data?.role === "super_admin";
    } catch (error) {
      console.error("Erreur lors de la vérification du rôle Super Admin:", error);
      return false;
    }
  };

  return {
    changeUserRole,
    makeSelfSuperAdmin,
    checkIsSuperAdmin
  };
};
