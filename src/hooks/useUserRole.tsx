
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
        // First, check if user has a role in user_roles table
        const { data: userData, error: userError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        if (userError) {
          throw userError;
        }

        if (userData && userData.role) {
          setRole(userData.role);
          setIsLoading(false);
          return;
        }

        // If no role found, set a default role and create one
        console.log("No role found for user, creating default role...");
        const { error: insertError } = await supabase
          .from("user_roles")
          .insert({ user_id: user.id, role: "visitor" });

        if (insertError) {
          throw insertError;
        }

        setRole("visitor");
      } catch (error: any) {
        console.error("Erreur lors de la récupération du rôle:", error);
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
