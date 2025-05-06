
import { useState, useEffect } from "react";
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
  
  // Fonction pour réinitialiser le rôle lors de la déconnexion
  const clearRole = () => {
    setRole(null);
  };

  // Vérifier si c'est l'utilisateur spécial (konointer@gmail.com)
  const isSpecialAdmin = (email: string | undefined): boolean => {
    return email === 'konointer@gmail.com';
  };

  // Fonction dédiée à l'application du rôle super_admin pour l'utilisateur spécial
  const applySpecialSuperAdminRole = async (): Promise<void> => {
    if (!user) return;
    
    console.log("Application du rôle super_admin pour l'utilisateur spécial");
    
    // Définir directement le rôle dans l'état
    setRole('super_admin' as AppRole);
    
    try {
      // Mettre à jour le rôle dans la base de données
      const { error } = await supabase
        .from("user_roles")
        .upsert({ 
          user_id: user.id,
          role: "super_admin" as AppRole
        }, { onConflict: "user_id" });
        
      if (error) {
        console.warn("Note: Mise à jour de la base de données non effectuée:", error);
        // Ne pas bloquer l'utilisateur si l'upsert échoue
      } else {
        console.log("Rôle super_admin appliqué avec succès dans la base de données");
      }
    } catch (error) {
      console.warn("Erreur silencieuse:", error);
      // Ne pas bloquer l'utilisateur si une erreur se produit
    }
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
      console.log("Actualisation du rôle pour", user.email);
      
      // Vérifier d'abord si c'est l'utilisateur spécial
      if (isSpecialAdmin(user.email)) {
        await applySpecialSuperAdminRole();
        setIsLoading(false);
        return;
      }
      
      // Pour les autres utilisateurs, récupérer le rôle depuis la base de données
      console.log("Récupération du rôle depuis la base de données");
      const { data: userRole, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Erreur lors de la récupération du rôle:", error);
        setRole(null);
      } else {
        console.log("Rôle récupéré:", userRole?.role);
        setRole(userRole?.role || null);
      }
    } catch (error: any) {
      console.error("Erreur lors de l'actualisation du rôle:", error);
      setRole(null);
      
      toast({
        title: "Erreur",
        description: "Impossible de récupérer votre rôle. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Effet pour charger le rôle au chargement et lorsque l'utilisateur change
  useEffect(() => {
    refreshRole();
  }, [user]);

  return { 
    role, 
    isLoading, 
    refreshRole, 
    clearRole,
    isSpecialAdmin: user ? isSpecialAdmin(user.email) : false
  };
};
