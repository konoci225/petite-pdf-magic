
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Module } from "../modules/ModuleTypes";

export const useModuleService = () => {
  const { toast } = useToast();

  const fetchModules = async (): Promise<Module[]> => {
    try {
      const { data, error } = await supabase
        .from("modules")
        .select("*");

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error: any) {
      console.error("Error fetching modules:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les modules",
        variant: "destructive",
      });
      return [];
    }
  };

  const fetchUserModules = async (): Promise<{[key: string]: string[]}> => {
    try {
      const { data, error } = await supabase
        .from("user_modules")
        .select("user_id, module_id");

      if (error) {
        throw error;
      }

      // Group user modules by user_id
      const modulesByUser: {[key: string]: string[]} = {};
      data?.forEach((um) => {
        if (!modulesByUser[um.user_id]) {
          modulesByUser[um.user_id] = [];
        }
        modulesByUser[um.user_id].push(um.module_id);
      });

      return modulesByUser;
    } catch (error: any) {
      console.error("Error fetching user modules:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les modules utilisateur",
        variant: "destructive",
      });
      return {};
    }
  };

  const saveUserModules = async (userId: string, selectedModules: string[]): Promise<boolean> => {
    try {
      // First, delete all existing user modules
      const { error: deleteError } = await supabase
        .from("user_modules")
        .delete()
        .eq("user_id", userId);

      if (deleteError) throw deleteError;

      // Then insert new ones
      if (selectedModules.length > 0) {
        const userModulesToInsert = selectedModules.map((moduleId) => ({
          user_id: userId,
          module_id: moduleId,
        }));

        const { error: insertError } = await supabase
          .from("user_modules")
          .insert(userModulesToInsert);

        if (insertError) throw insertError;
      }

      toast({
        title: "Succès",
        description: "Modules de l'utilisateur mis à jour",
      });
      
      return true;
    } catch (error: any) {
      console.error("Error updating user modules:", error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    fetchModules,
    fetchUserModules,
    saveUserModules
  };
};
