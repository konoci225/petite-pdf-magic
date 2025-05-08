
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types"; 
import { useToast } from "@/hooks/use-toast";

type AppRole = Database["public"]["Enums"]["app_role"];

// Clé pour le mode admin forcé
const FORCED_ADMIN_MODE_KEY = 'app_forced_admin_mode';

export const useUserRole = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const [hasTriedEdgeFunction, setHasTriedEdgeFunction] = useState(false);
  
  // Détection de l'administrateur spécial
  const isSpecialAdmin = user?.email === 'konointer@gmail.com';
  
  // Check for forced admin mode
  const isForcedAdminMode = useCallback(() => {
    return localStorage.getItem(FORCED_ADMIN_MODE_KEY) === 'true';
  }, []);
  
  // Réinitialisation du rôle à la déconnexion
  const clearRole = useCallback(() => {
    setRole(null);
    setIsLoading(false);
    setHasTriedEdgeFunction(false);
  }, []);

  // Application locale du rôle super_admin pour l'administrateur spécial
  const applySpecialAdminRole = useCallback(() => {
    if (isSpecialAdmin || isForcedAdminMode()) {
      console.log("Application du rôle super_admin localement");
      setRole('super_admin');
      return true;
    }
    return false;
  }, [isSpecialAdmin, isForcedAdminMode]);

  // Mise à jour du rôle dans la base de données via l'API admin-bypass
  const diagnosticRole = useCallback(async (): Promise<any> => {
    if (!user) return null;
    
    try {
      console.log("Diagnostic de rôle via admin-bypass");
      const { data, error } = await supabase.functions.invoke("admin-bypass", {
        body: { action: "diagnostic" }
      });
      
      if (error) {
        console.error("Erreur lors du diagnostic:", error);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error("Exception lors du diagnostic:", err);
      return null;
    }
  }, [user]);

  // Méthode de secours avec Edge Function
  const ensureRoleWithEdgeFunction = useCallback(async () => {
    if (!user || hasTriedEdgeFunction) return false;
    
    setHasTriedEdgeFunction(true);
    try {
      console.log("Tentative de définir le rôle via Edge Function pour l'administrateur spécial");
      
      const { data, error } = await supabase.functions.invoke("set-admin-role", {
        body: { 
          email: user.email,
          userId: user.id,
          forceRepair: true
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
      
      // Vérifier d'abord le mode admin forcé
      if (isForcedAdminMode()) {
        console.log("Mode admin forcé détecté - attribution du rôle super_admin localement");
        setRole('super_admin');
        setIsLoading(false);
        return;
      }
      
      // Pour l'utilisateur spécial, toujours définir le rôle super_admin en local d'abord
      if (isSpecialAdmin) {
        applySpecialAdminRole();
        
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
  }, [user, isSpecialAdmin, applySpecialAdminRole, clearRole, ensureRoleWithEdgeFunction, hasTriedEdgeFunction, lastRefreshTime, isForcedAdminMode]);

  // Chargement du rôle lors du changement d'utilisateur
  useEffect(() => {
    refreshRole();
  }, [user, refreshRole]);

  // Forcer le rôle super_admin pour l'utilisateur spécial
  useEffect(() => {
    // Si c'est l'administrateur spécial ou mode forcé et pas de rôle ou rôle != super_admin
    if ((isSpecialAdmin || isForcedAdminMode()) && (!role || role !== 'super_admin')) {
      applySpecialAdminRole();
    }
  }, [isSpecialAdmin, role, applySpecialAdminRole, isForcedAdminMode]);

  // Listen for forced admin mode changes
  useEffect(() => {
    const checkForcedMode = () => {
      if (isForcedAdminMode() && role !== 'super_admin') {
        setRole('super_admin');
      }
    };
    
    window.addEventListener('storage', checkForcedMode);
    return () => {
      window.removeEventListener('storage', checkForcedMode);
    };
  }, [role, isForcedAdminMode]);

  return { 
    role, 
    isLoading, 
    refreshRole, 
    clearRole,
    isSpecialAdmin,
    ensureRoleWithEdgeFunction,
    isForcedAdminMode: isForcedAdminMode(),
    diagnosticRole
  };
};
