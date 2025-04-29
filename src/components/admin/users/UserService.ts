
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
      
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id");
        
      if (profilesError) {
        throw profilesError;
      }
      
      console.log("Profiles récupérés:", profiles);
      
      if (!profiles || profiles.length === 0) {
        return [];
      }
      
      // Récupérer les rôles des utilisateurs
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) {
        throw rolesError;
      }
      
      console.log("Rôles utilisateurs récupérés:", userRoles);
      
      // Create a map of user IDs to emails (using fake emails for now)
      const emails: {[key: string]: string} = {};
      profiles.forEach(profile => {
        emails[profile.id] = `user-${profile.id.substring(0, 8)}@example.com`;
      });
      
      // Créer un mapping des rôles d'utilisateur par ID
      const roleMap: {[key: string]: AppRole} = {};
      userRoles?.forEach(ur => {
        roleMap[ur.user_id] = ur.role as AppRole;
      });
      
      // Generate user objects from profiles and roles
      const users: User[] = profiles.map(profile => ({
        id: profile.id,
        email: emails[profile.id] || `user-${profile.id.substring(0, 8)}@example.com`,
        role: roleMap[profile.id] || "visitor" as AppRole
      }));
      
      return users;
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
  
  const createDemoUsers = async () => {
    try {
      console.log("Création d'utilisateurs de démo...");
      
      // Fetch profiles to use as demo users
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id")
        .limit(5);
        
      if (profilesError) throw profilesError;
      
      console.log("Profils pour démo:", profiles);
      
      if (profiles && profiles.length > 0) {
        // Create user roles for each profile
        const userRolesToCreate = profiles.map((profile, index) => {
          // Define role as an explicit AppRole type
          const role: AppRole = index === 0 ? "super_admin" : index < 3 ? "subscriber" : "visitor";
          return {
            user_id: profile.id,
            role: role
          };
        });
        
        const { error } = await supabase
          .from("user_roles")
          .insert(userRolesToCreate);
          
        if (error) throw error;
        
        toast({
          title: "Utilisateurs démo créés",
          description: "Des utilisateurs démo ont été créés pour la démonstration",
        });
        return true;
      } else {
        console.log("Aucun profil trouvé pour créer des utilisateurs de démo");
        return false;
      }
    } catch (error: any) {
      console.error("Error creating demo users:", error);
      return false;
    }
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
      return {};
    }
  };

  const saveUserModules = async (userId: string, moduleIds: string[]): Promise<boolean> => {
    try {
      // First, delete all existing user modules
      const { error: deleteError } = await supabase
        .from("user_modules")
        .delete()
        .eq("user_id", userId);

      if (deleteError) throw deleteError;

      // Then insert new ones
      if (moduleIds.length > 0) {
        const userModulesToInsert = moduleIds.map((moduleId) => ({
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
    createDemoUsers,
    fetchModules,
    fetchUserModules,
    saveUserModules,
  };
};
