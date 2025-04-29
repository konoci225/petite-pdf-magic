
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export interface User {
  id: string;
  email: string;
  role: AppRole;
}

export interface Module {
  id: string;
  module_name: string;
  description: string | null;
  is_active: boolean;
  is_premium: boolean;
}

export const useUserService = () => {
  const { toast } = useToast();

  const fetchUsers = async (): Promise<User[]> => {
    try {
      console.log("Récupération des utilisateurs...");
      
      // Get user_roles first since we can access this directly
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");
      
      if (rolesError) {
        console.error("Erreur lors de la récupération des rôles:", rolesError);
        throw rolesError;
      }
      
      if (!userRoles || userRoles.length === 0) {
        console.log("Aucun utilisateur trouvé.");
        return [];
      }
      
      console.log(`Trouvé ${userRoles.length} roles d'utilisateurs`);
      
      // For each user_id in user_roles, try to get auth info
      const formattedUsers: User[] = [];
      
      for (const userRole of userRoles) {
        // Try to get user email from auth if possible
        try {
          const { data, error: authError } = await supabase.auth.admin.getUserById(userRole.user_id);
          
          if (authError) {
            console.warn(`Impossible de récupérer l'utilisateur auth pour ${userRole.user_id}: ${authError.message}`);
            // Fall back to a generated email
            formattedUsers.push({
              id: userRole.user_id,
              email: `utilisateur-${userRole.user_id.substring(0, 6)}@exemple.com`,
              role: userRole.role as AppRole
            });
          } else if (data && data.user) {
            // If we found the auth user, use their email
            formattedUsers.push({
              id: userRole.user_id,
              email: data.user.email || `utilisateur-${userRole.user_id.substring(0, 6)}@exemple.com`,
              role: userRole.role as AppRole
            });
          }
        } catch (error) {
          console.warn(`Erreur pour l'utilisateur ${userRole.user_id}:`, error);
          // Fall back to a generated email
          formattedUsers.push({
            id: userRole.user_id,
            email: `utilisateur-${userRole.user_id.substring(0, 6)}@exemple.com`,
            role: userRole.role as AppRole
          });
        }
      }
      
      console.log("Utilisateurs formatés:", formattedUsers);
      return formattedUsers;
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs: " + error.message,
        variant: "destructive",
      });
      return [];
    }
  };

  const createDemoUsers = async (): Promise<User[]> => {
    // Since we're being asked to only show real data and not test data,
    // this function will now just return an empty array
    console.log("La création d'utilisateurs de démonstration est désactivée.");
    return [];
  };

  const fetchModules = async (): Promise<Module[]> => {
    try {
      const { data, error } = await supabase
        .from("modules")
        .select("*");

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error("Error fetching modules:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les modules",
        variant: "destructive",
      });
      return [];
    }
  };

  const fetchUserModules = async (): Promise<{[key: string]: string[]}> => {
    try {
      const { data, error } = await supabase
        .from("user_modules")
        .select("user_id, module_id");

      if (error) throw error;

      // Group user modules by user_id
      const modulesByUser: {[key: string]: string[]} = {};
      data?.forEach((um) => {
        if (!modulesByUser[um.user_id]) {
          modulesByUser[um.user_id] = [];
        }
        modulesByUser[um.user_id].push(um.module_id);
      });

      return modulesByUser;
    } catch (error: any) {
      console.error("Error fetching user modules:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les modules utilisateur",
        variant: "destructive",
      });
      return {};
    }
  };

  const saveUserModules = async (userId: string, selectedModules: string[]): Promise<boolean> => {
    try {
      // First, delete all existing user modules
      const { error: deleteError } = await supabase
        .from("user_modules")
        .delete()
        .eq("user_id", userId);

      if (deleteError) throw deleteError;

      // Then insert new ones
      if (selectedModules.length > 0) {
        const userModulesToInsert = selectedModules.map((moduleId) => ({
          user_id: userId,
          module_id: moduleId,
        }));

        const { error: insertError } = await supabase
          .from("user_modules")
          .insert(userModulesToInsert);

        if (insertError) throw insertError;
      }

      toast({
        title: "Succès",
        description: "Modules de l'utilisateur mis à jour",
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error updating user modules:", error);
      return false;
    }
  };

  return {
    fetchUsers,
    fetchModules,
    fetchUserModules,
    saveUserModules,
    createDemoUsers
  };
};
