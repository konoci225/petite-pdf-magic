
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "../types";

export const useUserFetchService = () => {
  const { toast } = useToast();

  const fetchUsers = async (): Promise<User[]> => {
    try {
      console.log("Récupération des utilisateurs...");
      
      // Récupérer les rôles d'utilisateurs
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
      
      // Formater les données des utilisateurs
      const formattedUsers: User[] = [];
      
      for (const userRole of userRoles) {
        try {
          // Essayer de récupérer les informations utilisateur via RPC si disponible
          // Ou utiliser un email généré à partir de l'ID comme solution de secours
          const placeholderEmail = `user-${userRole.user_id.substring(0, 8)}@example.com`;
          
          // Essayer de récupérer l'email réel de l'utilisateur
          const { data: userData, error: authError } = await supabase.auth.admin.getUserById(userRole.user_id);
          
          formattedUsers.push({
            id: userRole.user_id,
            email: userData?.user?.email || placeholderEmail,
            role: userRole.role as any
          });
        } catch (error) {
          console.warn(`Erreur pour l'utilisateur ${userRole.user_id}:`, error);
          
          // Ajouter avec un email générique en cas d'erreur
          formattedUsers.push({
            id: userRole.user_id,
            email: `user-${userRole.user_id.substring(0, 8)}@example.com`,
            role: userRole.role as any
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
  
  return { fetchUsers };
};
