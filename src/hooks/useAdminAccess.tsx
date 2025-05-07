
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";

export const useAdminAccess = () => {
  const { user } = useAuth();
  const { role, refreshRole, isSpecialAdmin } = useUserRole();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [tablesAccessible, setTablesAccessible] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastCheckTime, setLastCheckTime] = useState(0);

  // L'utilisateur spécial a toujours accès aux tables administratives
  useEffect(() => {
    if (isSpecialAdmin) {
      setTablesAccessible(true);
      setIsLoading(false);
    }
  }, [isSpecialAdmin]);

  // Vérification simplifiée d'existence des tables
  const checkTablesAccess = useCallback(async () => {
    // L'utilisateur spécial a toujours accès
    if (isSpecialAdmin) {
      return true;
    }
    
    // L'utilisateur avec le rôle super_admin a accès
    if (role === 'super_admin') {
      try {
        const { error } = await supabase
          .from('modules')
          .select('id')
          .limit(1);
          
        return !error;
      } catch {
        return false;
      }
    }
    
    return false;
  }, [isSpecialAdmin, role]);

  // Anti-rebond pour les contrôles fréquents
  const canCheckAgain = useCallback(() => {
    const now = Date.now();
    return (now - lastCheckTime) > 2000; // 2 secondes minimum entre les vérifications
  }, [lastCheckTime]);

  // Forcer le rafraîchissement des permissions
  const forceRefreshPermissions = useCallback(async () => {
    if (!canCheckAgain()) {
      toast({
        title: "Veuillez patienter",
        description: "Attendez quelques secondes avant de réessayer.",
      });
      return;
    }
    
    setIsLoading(true);
    setLastCheckTime(Date.now());
    setRetryCount(prev => prev + 1);
    
    try {
      // Toujours actualiser le rôle d'abord
      await refreshRole();
      
      // Pour les utilisateurs spéciaux, appliquer directement
      if (isSpecialAdmin) {
        setTablesAccessible(true);
        toast({
          title: "Mode administrateur spécial",
          description: "Accès restauré en mode administrateur spécial.",
        });
        return;
      }
      
      // Vérifier l'accès aux tables après actualisation du rôle
      const hasAccess = await checkTablesAccess();
      setTablesAccessible(hasAccess);
      
      if (hasAccess) {
        toast({
          title: "Accès restauré",
          description: "L'accès aux données a été restauré avec succès.",
        });
      } else {
        toast({
          title: "Accès limité",
          description: "L'accès aux données reste limité. Vérifiez votre rôle.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Erreur lors du rafraîchissement:", error);
      toast({
        title: "Erreur",
        description: "Problème lors du rafraîchissement des permissions: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [refreshRole, isSpecialAdmin, checkTablesAccess, toast, canCheckAgain]);

  // Vérification initiale à l'accès au tableau de bord
  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Si c'est l'admin spécial, accorder l'accès immédiatement
      if (isSpecialAdmin) {
        setTablesAccessible(true);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setLastCheckTime(Date.now());
      
      try {
        // Vérification standard pour les autres utilisateurs
        const hasAccess = await checkTablesAccess();
        setTablesAccessible(hasAccess);
      } catch (error) {
        console.error("Erreur lors de la vérification de l'accès:", error);
        setTablesAccessible(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAccess();
  }, [user, isSpecialAdmin, checkTablesAccess]);

  return {
    isLoading,
    tablesAccessible,
    retryCount,
    forceRefreshPermissions,
    refreshRole,
    // Ajouter explicitement l'accès pour l'administrateur spécial
    isSpecialAdminAccess: isSpecialAdmin
  };
};
