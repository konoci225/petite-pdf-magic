
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

type UserRole = Database["public"]["Enums"]["app_role"];

export const useUserRole = () => {
  const { user, session, refreshSession } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Force detection du compte spécial konointer@gmail.com
  useEffect(() => {
    if (user?.email === "konointer@gmail.com") {
      console.log("Détection de l'utilisateur spécial konointer@gmail.com - Attribution prioritaire du rôle super_admin");
      setRole("super_admin");
    }
  }, [user]);

  // Fonction pour forcer la mise à jour du rôle
  const refreshRole = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    console.log("Actualisation forcée du rôle pour l'utilisateur:", user.id, user.email);
    
    try {
      // Détection prioritaire de konointer@gmail.com
      if (user.email === "konointer@gmail.com") {
        console.log("Utilisateur spécial konointer@gmail.com détecté - Attribution prioritaire du rôle super_admin");
        
        // Tenter une mise à jour directe en contournant RLS via rpc
        try {
          const { error: rpcError } = await supabase.rpc(
            'force_admin_role_bypass_rls',
            { user_email: user.email }
          );
          
          if (rpcError) {
            console.error("Erreur lors de la mise à jour RPC pour konointer:", rpcError);
          }
        } catch (error) {
          console.error("Exception lors de la mise à jour RPC pour konointer:", error);
        }
        
        // Forcer l'attribution du rôle super_admin pour cet utilisateur particulier
        setRole("super_admin");
        setIsLoading(false);
        return;
      }
      
      // Forcer l'actualisation de la session d'abord
      await refreshSession();
      
      // Essayer la méthode directe qui devrait être la plus fiable
      const { data: userData, error: userError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();
        
      if (userError) {
        console.error("Erreur lors de la requête directe:", userError);
        throw userError;
      }
      
      if (userData && userData.role) {
        console.log("Rôle actualisé via requête directe:", userData.role);
        setRole(userData.role);
        setIsLoading(false);
        return;
      }
      
      // Si la méthode directe ne trouve rien, essayer avec la fonction RPC
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_user_role', { user_id: user.id });
        
      if (!rpcError && rpcData) {
        console.log("Rôle actualisé via RPC:", rpcData);
        setRole(rpcData as UserRole);
        setIsLoading(false);
        return;
      }
      
      console.warn("Aucun rôle trouvé après actualisation");
      
      // Par défaut, définir un rôle basique pour éviter les erreurs
      setRole("visitor");
    } catch (error) {
      console.error("Erreur lors de l'actualisation du rôle:", error);
      // Par défaut, définir un rôle basique pour éviter les erreurs
      setRole("visitor");
      
      toast({
        title: "Erreur d'actualisation du rôle",
        description: "Impossible d'actualiser votre rôle. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, refreshSession, toast]);

  // Effet pour charger le rôle initial
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
        setIsLoading(false);
        return;
      }

      try {
        console.log("Récupération du rôle pour l'utilisateur:", user.id, user.email);
        
        // Cas spécial pour konointer@gmail.com - toujours super_admin
        if (user.email === "konointer@gmail.com") {
          console.log("Utilisateur spécial konointer@gmail.com détecté - Attribution du rôle super_admin");
          setRole("super_admin");
          setIsLoading(false);
          return;
        }
        
        // Méthode standard de récupération du rôle
        const { data: userData, error: userError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!userError && userData && userData.role) {
          console.log("Rôle trouvé par requête directe:", userData.role);
          setRole(userData.role);
        } else {
          // Par défaut, définir un rôle basique
          console.log("Aucun rôle trouvé, définition par défaut comme visitor");
          setRole("visitor");
        }
      } catch (error: any) {
        console.error("Erreur complète lors de la récupération du rôle:", error);
        
        toast({
          title: "Erreur de récupération de rôle",
          description: error.message || "Impossible de récupérer votre rôle",
          variant: "destructive",
        });
        
        // Par défaut, définir le rôle comme visiteur si tout échoue
        setRole("visitor");
      } finally {
        setIsLoading(false);
      }
    };

    // Vérifie si l'utilisateur est défini et déclenche la récupération du rôle
    if (user) {
      setIsLoading(true);
      fetchUserRole();
    } else {
      setRole(null);
      setIsLoading(false);
    }
  }, [user, toast]);

  return { role, isLoading, refreshRole };
};
