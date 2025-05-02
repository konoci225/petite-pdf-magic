
import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

type UserRole = Database["public"]["Enums"]["app_role"];

export const useUserRole = () => {
  const { user, session } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
        setIsLoading(false);
        return;
      }

      try {
        console.log("Fetching role for user:", user.id);
        
        // Approche 1: Essayer de récupérer directement de la table user_roles
        const { data: userData, error: userError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        if (userError) {
          console.error("Erreur lors de la récupération directe du rôle:", userError);
        }

        if (userData && userData.role) {
          console.log("Rôle trouvé par requête directe:", userData.role);
          setRole(userData.role);
          setIsLoading(false);
          return;
        }
        
        // Approche 2: Utiliser la fonction RPC
        console.log("Tentative avec la fonction RPC...");
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('get_user_role', { user_id: user.id });

        if (rpcError) {
          console.error("Erreur avec la fonction RPC:", rpcError);
        } else if (rpcData) {
          console.log("Rôle trouvé via RPC:", rpcData);
          setRole(rpcData as UserRole);
          setIsLoading(false);
          return;
        }

        // Approche 3: Vérifier si c'est le premier utilisateur (cas spécial)
        console.log("Vérification si premier utilisateur...");
        
        const { count: userCount, error: countError } = await supabase
          .from("user_roles")
          .select("*", { count: 'exact', head: true });
          
        if (countError) {
          console.error("Erreur lors du comptage des rôles:", countError);
          throw new Error(`Erreur de comptage des utilisateurs: ${countError.message}`);
        }
        
        const isFirstUser = userCount === 0;
        console.log(`Utilisateurs existants: ${userCount}, Premier utilisateur: ${isFirstUser}`);
        
        // Approche 4: Configurer un rôle par défaut et l'enregistrer
        const defaultRole: UserRole = isFirstUser ? "super_admin" : "visitor";
        console.log(`Attribution du rôle par défaut: ${defaultRole}`);
        
        try {
          const { error: insertError } = await supabase
            .from("user_roles")
            .upsert({ 
              user_id: user.id, 
              role: defaultRole 
            }, { onConflict: 'user_id' });

          if (insertError) {
            console.error("Erreur lors de l'insertion du rôle:", insertError);
            throw insertError;
          }
          
          console.log(`Rôle ${defaultRole} attribué avec succès`);
          setRole(defaultRole);
        } catch (insertErr: any) {
          console.error("Erreur lors de la création du rôle:", insertErr);
          // En cas d'échec de l'insertion, on utilise quand même le rôle par défaut
          setRole(defaultRole);
        }
      } catch (error: any) {
        console.error("Erreur complète:", error);
        
        toast({
          title: "Erreur de récupération de rôle",
          description: error.message || "Impossible de récupérer votre rôle",
          variant: "destructive",
        });
        
        // Par défaut, utiliser le rôle visiteur si rien d'autre ne fonctionne
        if (!role) {
          console.log("Définition du rôle par défaut: visitor");
          setRole("visitor");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      setIsLoading(true);
      fetchUserRole();
    } else {
      setRole(null);
      setIsLoading(false);
    }
  }, [user, toast]);

  return { role, isLoading };
};
