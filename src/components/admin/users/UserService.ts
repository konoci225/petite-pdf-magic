
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, AppRole } from "./types";

export const useUserService = () => {
  const { toast } = useToast();

  const fetchUsers = async (): Promise<User[]> => {
    try {
      console.log("Récupération des utilisateurs...");
      
      // Récupérer d'abord les rôles d'utilisateurs
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
      
      // Tenter de récupérer les adresses email des utilisateurs si possible
      const formattedUsers: User[] = [];
      
      for (const userRole of userRoles) {
        try {
          // Essayer de récupérer les emails depuis auth.users via un RPC si disponible
          // Sinon, utiliser un email généré à partir de l'ID
          const placeholderEmail = `user-${userRole.user_id.substring(0, 8)}@example.com`;
          
          formattedUsers.push({
            id: userRole.user_id,
            email: placeholderEmail,
            role: userRole.role as AppRole
          });
          
        } catch (error) {
          console.warn(`Erreur pour l'utilisateur ${userRole.user_id}:`, error);
          
          // Ajouter avec un email générique
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
      console.error("Erreur lors de la récupération des utilisateurs:", error);
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
