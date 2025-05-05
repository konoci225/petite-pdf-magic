
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";

export const useAdminAccess = () => {
  const { user } = useAuth();
  const { role, refreshRole } = useUserRole();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [tablesAccessible, setTablesAccessible] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const isSpecialAdmin = user?.email === "konointer@gmail.com";

  // Fonction séparée pour vérifier l'existence des tables
  const ensureTablesExist = useCallback(async () => {
    try {
      console.log("Vérification des tables requises...");
      
      // Appel à la fonction Edge pour récupérer les statistiques du tableau de bord
      const { data: response, error } = await supabase.functions.invoke('get_admin_dashboard_stats');
      
      if (error) {
        console.error("Erreur lors de la récupération des statistiques:", error);
        
        // Méthode alternative: vérifier l'existence de tables individuelles
        const { error: modulesError } = await supabase
          .from('modules')
          .select('id')
          .limit(1);

        if (modulesError) {
          console.error("Erreur lors de la vérification de la table modules:", modulesError);
          return false;
        }

        // Vérifier l'existence de la table user_roles
        const { error: userRolesError } = await supabase
          .from('user_roles')
          .select('user_id')
          .limit(1);

        if (userRolesError) {
          console.error("Erreur lors de la vérification de la table user_roles:", userRolesError);
          return false;
        }
      }
      
      console.log("Toutes les tables requises existent et sont accessibles.");
      return true;
    } catch (error) {
      console.error("Erreur lors de la vérification des tables:", error);
      return false;
    }
  }, []);

  // Actualisation forcée des autorisations
  const forceRefreshPermissions = async () => {
    setIsLoading(true);
    try {
      // Actualiser la session pour obtenir les dernières autorisations
      console.log("Actualisation forcée des autorisations...");
      
      if (isSpecialAdmin) {
        // Tentative d'attribution directe du rôle super_admin
        const { error: rpcError } = await supabase.rpc(
          'force_set_super_admin_role',
          { target_user_id: user?.id }
        );
        
        if (rpcError) {
          console.error("Erreur lors de l'attribution forcée du rôle:", rpcError);
          
          // Tentative alternative
          const { error: upsertError } = await supabase
            .from("user_roles")
            .upsert({ 
              user_id: user?.id,
              role: "super_admin" 
            }, { onConflict: "user_id" });
            
          if (upsertError) {
            console.error("Erreur lors de l'upsert direct:", upsertError);
          }
        }
      }
      
      // Actualiser le rôle
      await refreshRole();
      
      // Vérifier de nouveau l'accès aux tables
      const accessible = await ensureTablesExist();
      setTablesAccessible(accessible);
      
      if (accessible) {
        toast({
          title: "Accès restauré",
          description: "L'accès aux données a été restauré avec succès.",
        });
      }
      
      setRetryCount(prev => prev + 1);
    } catch (error) {
      console.error("Erreur lors de l'actualisation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkAccess = async () => {
      setIsLoading(true);
      try {
        console.log("Vérification de l'accès aux tables de la base de données...");
        // Vérifier si les tables requises existent
        const accessible = await ensureTablesExist();
        setTablesAccessible(accessible);
        
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      } catch (error: any) {
        console.error("Error checking admin access:", error);
        toast({
          title: "Erreur",
          description: "Problème d'accès au tableau de bord administrateur: " + error.message,
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };
    
    if (user) {
      checkAccess();
    }
  }, [user, toast, ensureTablesExist]);

  return {
    isLoading,
    tablesAccessible,
    retryCount,
    isSpecialAdmin,
    forceRefreshPermissions,
    refreshRole
  };
};
