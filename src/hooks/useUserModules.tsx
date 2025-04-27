
import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

export const useUserModules = () => {
  const { user } = useAuth();
  const [modules, setModules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserModules = async () => {
      if (!user) {
        setModules([]);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_modules")
          .select(`
            module_id,
            modules (
              id,
              module_name,
              description,
              is_premium,
              is_active
            )
          `)
          .eq("user_id", user.id);

        if (error) throw error;
        setModules(data?.map(item => item.modules) || []);
      } catch (error) {
        console.error("Erreur lors de la récupération des modules:", error);
        setModules([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserModules();
  }, [user]);

  return { modules, isLoading };
};
