
import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types"; 

type AppRole = Database["public"]["Enums"]["app_role"];

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fonction pour réinitialiser le rôle lors de la déconnexion
  const clearRole = () => {
    setRole(null);
  };

  // Vérifier le rôle de l'utilisateur spécial (konointer@gmail.com)
  const checkSpecialUser = async (email: string) => {
    // Vérifier si c'est l'utilisateur spécial konointer@gmail.com
    if (email === 'konointer@gmail.com' && user) {
      // Essayer d'attribuer le rôle super_admin avec la fonction RPC
      try {
        const { error: rpcError } = await supabase.rpc(
          'force_set_super_admin_role',
          { target_user_id: user.id }
        );
        
        if (rpcError) {
          console.error("Erreur lors de l'attribution automatique du rôle super_admin:", rpcError);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'utilisateur spécial:", error);
      }
      
      return 'super_admin' as AppRole;
    }
    return null;
  };

  // Fonction pour actualiser le rôle manuellement
  const refreshRole = async () => {
    if (!user) {
      clearRole();
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      // Vérifier d'abord si c'est l'utilisateur spécial
      const specialRole = await checkSpecialUser(user.email || '');
      if (specialRole) {
        setRole(specialRole);
        setIsLoading(false);
        return;
      }
      
      // Sinon, récupérer le rôle depuis la base de données
      const { data: userRole, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error("Erreur lors de la récupération du rôle:", error);
        setRole(null);
      } else {
        setRole(userRole.role);
      }
    } catch (error) {
      console.error("Erreur lors de l'actualisation du rôle:", error);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Effet pour charger le rôle au chargement et lorsque l'utilisateur change
  useEffect(() => {
    refreshRole();
  }, [user]);

  return { role, isLoading, refreshRole, clearRole };
};
