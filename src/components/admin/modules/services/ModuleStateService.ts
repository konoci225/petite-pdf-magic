
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Module } from "../ModuleTypes";

export const useModuleStateService = () => {
  const { toast } = useToast();

  // Activer/désactiver un module
  const toggleModuleActive = async (module: Module): Promise<boolean> => {
    try {
      console.log("Changement de statut du module:", module.id, "à", !module.is_active);
      
      const { error } = await supabase
        .from("modules")
        .update({ 
          is_active: !module.is_active,
          updated_at: new Date().toISOString()
        })
        .eq("id", module.id);
      
      if (error) throw error;
      
      toast({
        title: "Succès",
        description: `Module ${!module.is_active ? "activé" : "désactivé"} avec succès`,
      });
      
      return true;
    } catch (error: any) {
      console.error("Erreur lors du changement de statut du module:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut du module: " + error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    toggleModuleActive,
  };
};
