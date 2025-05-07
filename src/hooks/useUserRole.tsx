
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types"; 
import { useToast } from "@/hooks/use-toast";

type AppRole = Database["public"]["Enums"]["app_role"];

export const useUserRole = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const [hasTriedEdgeFunction, setHasTriedEdgeFunction] = useState(false);
  
  // Détection de l'administrateur spécial
  const isSpecialAdmin = user?.email === 'konointer@gmail.com';
  
  // Réinitialisation du rôle à la déconnexion
  const clearRole = useCallback(() => {
    setRole(null);
    setIsLoading(false);
    setHasTriedEdgeFunction(false);
  }, []);

  // Application locale du rôle super_admin pour l'administrateur spécial
  const applySpecialAdminRole = useCallback(() => {
    if (isSpecialAdmin) {
      console.log("Application du rôle super_admin pour l'utilisateur spécial localement");
      setRole('super_admin');
      return true;
    }
    return false;
  }, [isSpecialAdmin]);

  // Mise à jour du rôle dans la base de données
  const updateRoleInDatabase = useCallback(async () => {
    if (!user) return false;
    
    if (isSpecialAdmin) {
      try {
        console.log("Tentative de mise à jour du rôle pour l'utilisateur spécial");
        
        // Utilisation de la fonction RPC avec retour booléen
        const { data, error } = await supabase.rpc('force_set_super_admin_role', {
          target_user_id: user.id
        });
        
        if (error) {
          console.error("Erreur avec force_set_super_admin_role:", error);
          
          // Si RPC échoue, tenter insertion directe
          const { error: upsertError } = await supabase
            .from("user_roles")
            .upsert({ 
              user_id: user.id, 
              role: "super_admin",
              updated_at: new Date().toISOString()
            }, { onConflict: "user_id" });
            
          if (upsertError) {
            console.error("Erreur avec insertion directe:", upsertError);
            return false;
          }
          
          console.log("Rôle mis à jour avec succès via insertion directe");
          return true;
        }
        
        console.log("Exécution réussie de force_set_super_admin_role:", data);
        return data === true;
      } catch (err) {
        console.error("Erreur lors de la mise à jour du rôle:", err);
        return false;
      }
    }
    
    return false;
  }, [isSpecialAdmin, user]);

  // Méthode de secours avec Edge Function
  const ensureRoleWithEdgeFunction = useCallback(async () => {
    if (!user || hasTriedEdgeFunction) return false;
    
    setHasTriedEdgeFunction(true);
    try {
      console.log("Tentative de définir le rôle via Edge Function pour l'administrateur spécial");
      
      const { data, error } = await supabase.functions.invoke("set-admin-role", {
        body: { 
          email: user.email,
          userId: user.id
        }
      });
      
      if (error) {
        console.error("Erreur de fonction Edge:", error);
        return false;
      }
      
      console.log("Réponse de la fonction Edge:", data);
      return data?.success || false;
    } catch (err) {
      console.error("Erreur de fonction Edge (catch):", err);
      return false;
    }
  }, [user, hasTriedEdgeFunction]);

  // Fonction pour rafraîchir manuellement le rôle
  const refreshRole = useCallback(async () => {
    if (!user) {
      clearRole();
      return;
    }
    
    const now = Date.now();
    if (now - lastRefreshTime < 1000) {
      console.log("Rafraîchissement limité pour éviter les boucles");
      return;
    }
    
    setIsLoading(true);
    setLastRefreshTime(now);
    
    try {
      console.log("Rafraîchissement du rôle pour", user.email);
      
      // Pour l'utilisateur spécial, toujours définir le rôle super_admin en local d'abord
      if (isSpecialAdmin) {
        applySpecialAdminRole();
        
        // Essayer de mettre à jour l'enregistrement dans la base de données
        await updateRoleInDatabase().catch(console.error);
        
        // Si tout échoue, essayer la fonction edge de périphérie
        if (!hasTriedEdgeFunction) {
          await ensureRoleWithEdgeFunction().catch(console.error);
        }
        
        setIsLoading(false);
        return;
      }
      
      // Pour les utilisateurs normaux, essayer d'obtenir le rôle de la base de données
      try {
        const { data: userRole, error } = await supabase
          .from('user_roles')
          .select('role, updated_at')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error("Erreur lors de la récupération du rôle:", error);
          setRole(null);
        } else {
          console.log("Rôle récupéré:", userRole?.role, "Dernière mise à jour:", userRole?.updated_at);
          setRole(userRole?.role || null);
        }
      } catch (error) {
        console.error("Erreur lors du rafraîchissement du rôle:", error);
        setRole(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, isSpecialAdmin, applySpecialAdminRole, clearRole, updateRoleInDatabase, ensureRoleWithEdgeFunction, hasTriedEdgeFunction, lastRefreshTime]);

  // Chargement du rôle lors du changement d'utilisateur
  useEffect(() => {
    refreshRole();
  }, [user, refreshRole]);

  // Forcer le rôle super_admin pour l'utilisateur spécial
  useEffect(() => {
    if (isSpecialAdmin && role !== 'super_admin') {
      applySpecialAdminRole();
    }
  }, [isSpecialAdmin, role, applySpecialAdminRole]);

  return { 
    role, 
    isLoading, 
    refreshRole, 
    clearRole,
    isSpecialAdmin,
    ensureRoleWithEdgeFunction
  };
};
