
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, AppRole } from "./types";

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

  const changeUserRole = async (userId: string, newRole: AppRole): Promise<boolean> => {
    try {
      // First, check if the user exists in user_roles
      const { data: existingRole, error: checkError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userId)
        .single();
      
      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }
      
      if (existingRole) {
        // Update existing role
        const { error: updateError } = await supabase
          .from("user_roles")
          .update({ role: newRole })
          .eq("user_id", userId);
        
        if (updateError) throw updateError;
      } else {
        // Insert new role
        const { error: insertError } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: newRole });
        
        if (insertError) throw insertError;
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

  const createDemoUsers = async (): Promise<User[]> => {
    console.log("La création d'utilisateurs de démonstration est désactivée.");
    return [];
  };

  return {
    fetchUsers,
    changeUserRole,
    createDemoUsers
  };
};
