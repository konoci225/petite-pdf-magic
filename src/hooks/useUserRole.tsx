
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
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle(); // Use maybeSingle instead of single to handle cases where no role is found

        if (error) {
          console.error("Erreur lors de la récupération du rôle:", error);
          toast({
            title: "Erreur",
            description: "Impossible de récupérer votre rôle",
            variant: "destructive",
          });
          setRole(null);
        } else {
          setRole(data?.role || "visitor"); // Default to visitor if no role found
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du rôle:", error);
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [user, toast]);

  return { role, isLoading };
};
