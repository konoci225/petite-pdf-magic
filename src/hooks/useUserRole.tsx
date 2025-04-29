
import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

type UserRole = Database["public"]["Enums"]["app_role"];

export const useUserRole = () => {
  const { user } = useAuth();
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
        
        // First, check if user has a role in user_roles table
        const { data: userData, error: userError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        if (userError) {
          console.error("Error fetching user role:", userError);
          throw userError;
        }

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
        
        const defaultRole: UserRole = count === 0 ? "super_admin" : "visitor";
        console.log(`Setting default role as ${defaultRole} (first user: ${count === 0})`);
        
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
        toast({
          title: "Erreur",
          description: "Impossible de récupérer votre rôle",
          variant: "destructive",
        });
        setRole("visitor"); // Default to visitor on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [user, toast]);

  return { role, isLoading };
};
