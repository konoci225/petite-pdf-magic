
import { useEffect, useState } from "react";
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

  // Fonction pour forcer la mise à jour du rôle
  const refreshRole = async () => {
    if (!user) return;
    
    setIsLoading(true);
    console.log("Actualisation forcée du rôle pour l'utilisateur:", user.id);
    
    try {
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
        return;
      }
      
      // Si la méthode directe ne trouve rien, essayer avec la fonction RPC
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_user_role', { user_id: user.id });
        
      if (!rpcError && rpcData) {
        console.log("Rôle actualisé via RPC:", rpcData);
        setRole(rpcData as UserRole);
        return;
      }
      
      console.warn("Aucun rôle trouvé après actualisation");
      // Si c'est konointer@gmail.com, tenter d'attribuer le rôle super_admin
      if (user.email === "konointer@gmail.com") {
        console.log("Attribution du rôle super_admin à konointer@gmail.com");
        
        const { error: insertError } = await supabase
          .from("user_roles")
          .upsert({ 
            user_id: user.id, 
            role: "super_admin" as UserRole 
          });

        if (insertError) {
          console.error("Erreur lors de l'attribution du rôle super_admin:", insertError);
        } else {
          console.log("Rôle super_admin attribué avec succès");
          setRole("super_admin" as UserRole);
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'actualisation du rôle:", error);
      toast({
        title: "Erreur d'actualisation du rôle",
        description: "Impossible d'actualiser votre rôle. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
        setIsLoading(false);
        return;
      }

      try {
        console.log("Récupération du rôle pour l'utilisateur:", user.id, user.email);
        
        // Cas spécial pour konointer@gmail.com
        if (user.email === "konointer@gmail.com") {
          console.log("Utilisateur spécial détecté: konointer@gmail.com");
          
          // Vérifier d'abord si ce compte a déjà un rôle
          const { data: existingRole, error: checkError } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .maybeSingle();
            
          if (checkError) {
            console.error("Erreur lors de la vérification du rôle existant:", checkError);
          }
          
          // Si le rôle n'est pas super_admin ou n'existe pas, l'attribuer
          if (!existingRole || existingRole.role !== "super_admin") {
            console.log("Attribution ou correction du rôle super_admin");
            
            const { error: upsertError } = await supabase
              .from("user_roles")
              .upsert({ 
                user_id: user.id, 
                role: "super_admin" as UserRole 
              }, { onConflict: "user_id" });

            if (upsertError) {
              console.error("Erreur lors de l'attribution du rôle super_admin:", upsertError);
            } else {
              console.log("Rôle super_admin attribué avec succès");
              setRole("super_admin" as UserRole);
              setIsLoading(false);
              return;
            }
          } else {
            console.log("L'utilisateur a déjà le rôle super_admin");
            setRole("super_admin" as UserRole);
            setIsLoading(false);
            return;
          }
        }
        
        // Méthode standard de récupération du rôle pour les autres utilisateurs
        // Méthode 1: Requête directe à la table user_roles (plus fiable)
        console.log("Tentative de récupération directe depuis user_roles...");
        const { data: userData, error: userError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!userError && userData && userData.role) {
          console.log("Rôle trouvé par requête directe:", userData.role);
          setRole(userData.role);
          setIsLoading(false);
          return;
        }
        
        // Méthode 2: Utiliser la fonction RPC (comme fallback)
        if (userError) {
          console.warn("Erreur lors de la récupération directe:", userError);
        }
        
        console.log("Tentative avec la fonction RPC...");
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('get_user_role', { user_id: user.id });

        if (!rpcError && rpcData) {
          console.log("Rôle trouvé via RPC:", rpcData);
          setRole(rpcData as UserRole);
          setIsLoading(false);
          return;
        }
        
        if (rpcError) {
          console.warn("Erreur avec la fonction RPC:", rpcError);
        }

        // Méthode 3: Vérification si c'est le premier utilisateur
        console.log("Vérification s'il s'agit du premier utilisateur...");
        
        const { count: userCount, error: countError } = await supabase
          .from("user_roles")
          .select("*", { count: 'exact', head: true });
          
        if (countError) {
          console.error("Erreur lors du comptage des rôles:", countError);
        }
        
        const isFirstUser = userCount === 0;
        console.log(`Utilisateurs existants: ${userCount}, Premier utilisateur: ${isFirstUser}`);
        
        // Méthode 4: Attribution d'un rôle par défaut
        const defaultRole: UserRole = isFirstUser ? "super_admin" : "visitor";
        console.log(`Attribution du rôle par défaut: ${defaultRole}`);
        
        try {
          const { error: insertError } = await supabase
            .from("user_roles")
            .upsert({ 
              user_id: user.id, 
              role: defaultRole 
            });

          if (insertError) {
            console.error("Erreur lors de l'insertion du rôle:", insertError);
            throw insertError;
          }
          
          console.log(`Rôle ${defaultRole} attribué avec succès`);
          setRole(defaultRole);
        } catch (insertErr: any) {
          console.error("Erreur lors de la création du rôle:", insertErr);
          // En cas d'échec de l'insertion, utiliser quand même le rôle par défaut
          setRole(defaultRole);
        }
      } catch (error: any) {
        console.error("Erreur complète:", error);
        
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

    if (user) {
      setIsLoading(true);
      fetchUserRole();
    } else {
      setRole(null);
      setIsLoading(false);
    }
  }, [user, toast, refreshSession]);

  return { role, isLoading, refreshRole };
};
