
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

  // Vérifier et appliquer le rôle de l'utilisateur spécial (konointer@gmail.com)
  const applySpecialUserRole = async (email: string): Promise<AppRole | null> => {
    // Vérifier si c'est l'utilisateur spécial konointer@gmail.com
    if (email === 'konointer@gmail.com' && user) {
      console.log("Utilisateur spécial détecté, définition du rôle super_admin");
      
      // Définir directement le rôle pour cet utilisateur sans passer par la base de données
      // Cela évite les problèmes de permission RPC
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
      console.log("Actualisation du rôle pour", user.email);
      
      // Vérifier d'abord si c'est l'utilisateur spécial
      const specialRole = await applySpecialUserRole(user.email || '');
      if (specialRole) {
        console.log("Rôle spécial appliqué:", specialRole);
        setRole(specialRole);
        
        // Pour l'utilisateur spécial, essayer quand même de mettre à jour dans la DB en arrière-plan
        // mais ne pas bloquer l'interface utilisateur
        try {
          const { error: upsertError } = await supabase
            .from("user_roles")
            .upsert({ 
              user_id: user.id,
              role: "super_admin" as AppRole
            }, { onConflict: "user_id" });
            
          if (upsertError) {
            console.log("Note: Mise à jour de la base de données non effectuée, mais l'utilisateur a toujours accès:", upsertError);
          }
        } catch (error) {
          console.log("Erreur silencieuse d'upsert, ignorée pour spécial admin:", error);
        }
        
        setIsLoading(false);
        return;
      }
      
      // Sinon, récupérer le rôle depuis la base de données
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
    } catch (error) {
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

  return { role, isLoading, refreshRole, clearRole };
};
