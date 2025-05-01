
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
        
        // Get the user role from user_roles table
        const { data: userData, error: userError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        if (userError) {
          console.error("Error fetching user role:", userError);
          throw userError;
        }

        // If role found, set it in the state
        if (userData && userData.role) {
          console.log("Found role for user:", userData.role);
          setRole(userData.role);
          setIsLoading(false);
          return;
        }

        // If no role found, set a default role and create one
        console.log("No role found for user, creating default role...");
        
        // Determine if this is the first user - if so, make them super_admin
        const { count, error: countError } = await supabase
          .from("user_roles")
          .select("*", { count: 'exact', head: true });
          
        if (countError) {
          console.error("Error counting user roles:", countError);
          throw countError;
        }
        
        // First user should be super_admin, otherwise visitor
        const defaultRole: UserRole = count === 0 ? "super_admin" : "visitor";
        console.log(`Setting default role as ${defaultRole} (first user: ${count === 0})`);
        
        // Insert the role into the database
        const { error: insertError } = await supabase
          .from("user_roles")
          .insert({ user_id: user.id, role: defaultRole });

        if (insertError) {
          console.error("Error creating user role:", insertError);
          throw insertError;
        }

        setRole(defaultRole);
      } catch (error: any) {
        console.error("Error retrieving role:", error);
        
        // More informative toast message
        toast({
          title: "Erreur de récupération de rôle",
          description: `Impossible de récupérer votre rôle: ${error.message}`,
          variant: "destructive",
        });
        
        // Default to visitor on error, but only if there's no existing role
        if (!role) {
          setRole("visitor");
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch role if there's an authenticated user
    if (user) {
      setIsLoading(true);
      fetchUserRole();
    } else {
      setRole(null);
      setIsLoading(false);
    }
  }, [user, toast, role]);

  return { role, isLoading };
};
