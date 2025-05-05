
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
      
      // Vérifier directement l'existence de tables individuelles sans utiliser Edge Function
      // qui pourrait causer des problèmes de permission
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('id')
        .limit(1);

      if (modulesError) {
        console.error("Erreur lors de la vérification de la table modules:", modulesError);
        return false;
      }

      // Vérifier l'existence de la table user_roles
      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .limit(1);

      if (userRolesError) {
        console.error("Erreur lors de la vérification de la table user_roles:", userRolesError);
        return false;
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
      console.log("Actualisation forcée des autorisations...");
      
      if (isSpecialAdmin) {
        // Application directe de la mise à jour du rôle dans la base de données
        // sans passer par RPC qui peut causer des problèmes de permissions
        const { error: upsertError } = await supabase
          .from("user_roles")
          .upsert({ 
            user_id: user?.id,
            role: "super_admin" 
          }, { onConflict: "user_id" });
            
        if (upsertError) {
          console.error("Erreur lors de l'upsert direct:", upsertError);
        } else {
          console.log("Mise à jour du rôle réussie via upsert direct");
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
    } catch (error: any) {
      console.error("Erreur lors de l'actualisation:", error);
      toast({
        title: "Erreur",
        description: "Problème lors de l'actualisation des permissions: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        console.log("Vérification de l'accès aux tables de la base de données...");
        
        // Force tablesAccessible to true for special admin to bypass permission checks
        if (isSpecialAdmin) {
          console.log("Utilisateur spécial détecté, accès accordé automatiquement");
          setTablesAccessible(true);
          setIsLoading(false);
          return;
        }
        
        // Vérifier si les tables requises existent pour les autres utilisateurs
        const accessible = await ensureTablesExist();
        setTablesAccessible(accessible);
      } catch (error: any) {
        console.error("Error checking admin access:", error);
        toast({
          title: "Erreur",
          description: "Problème d'accès au tableau de bord administrateur: " + error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAccess();
  }, [user, isSpecialAdmin, ensureTablesExist]);

  return {
    isLoading,
    tablesAccessible,
    retryCount,
    isSpecialAdmin,
    forceRefreshPermissions,
    refreshRole
  };
};
