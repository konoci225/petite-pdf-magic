
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

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
      
      // Get user_roles first
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");
      
      if (rolesError) {
        console.error("Erreur lors de la récupération des rôles:", rolesError);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les rôles des utilisateurs",
          variant: "destructive",
        });
        return [];
      }
      
      if (!userRoles || userRoles.length === 0) {
        console.log("Aucun utilisateur trouvé.");
        return [];
      }
      
      console.log(`Trouvé ${userRoles.length} rôles d'utilisateurs`);
      
      // Process each user role to build the user list
      const formattedUsers: User[] = [];
      
      for (const userRole of userRoles) {
        try {
          // Retrieve the user's email from auth.users using RPC function if available
          // Note: This method won't work client-side as it requires admin access
          // For production, you would need to create a server-side function or API
          // But for now, we'll use a placeholder email based on the user ID
          
          // Generate a placeholder email for the user
          const placeholderEmail = `user-${userRole.user_id.substring(0, 8)}@example.com`;
          
          formattedUsers.push({
            id: userRole.user_id,
            email: placeholderEmail,
            role: userRole.role as AppRole
          });
          
        } catch (error) {
          console.warn(`Erreur pour l'utilisateur ${userRole.user_id}:`, error);
          
          // Add with placeholder email
          formattedUsers.push({
            id: userRole.user_id,
            email: `user-${userRole.user_id.substring(0, 8)}@example.com`,
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
        description: "Impossible de charger les utilisateurs",
        variant: "destructive",
      });
      return [];
    }
  };

  const createDemoUsers = async (): Promise<User[]> => {
    // We don't create demo users anymore, just return empty array
    console.log("La création d'utilisateurs de démonstration est désactivée.");
    return [];
  };

  const fetchModules = async (): Promise<Module[]> => {
    try {
      const { data, error } = await supabase
        .from("modules")
        .select("*");

      if (error) {
        throw error;
      }

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

      if (error) {
        throw error;
      }

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
      console.error("Error updating user modules:", error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
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
