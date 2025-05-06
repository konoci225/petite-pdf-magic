
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_MODULES } from "../ModuleConstants";

export const useModuleDefaultService = () => {
  const { toast } = useToast();

  // Créer des modules par défaut
  const createDefaultModules = async (): Promise<boolean> => {
    try {
      console.log("Création des modules par défaut...");
      
      // Use a type assertion to bypass TypeScript's type checking for the RPC function
      const { error } = await supabase.rpc('create_default_modules' as any);
      
      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "Modules par défaut créés avec succès",
      });
      
      return true;
    } catch (error: any) {
      console.error("Erreur lors de la création des modules par défaut:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer les modules par défaut: " + error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    createDefaultModules,
  };
};
