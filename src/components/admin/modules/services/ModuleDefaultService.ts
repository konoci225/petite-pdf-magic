
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_MODULES } from "../ModuleConstants";
import { useUserRole } from "@/hooks/useUserRole";

export const useModuleDefaultService = () => {
  const { toast } = useToast();
  const { role, isSpecialAdmin } = useUserRole();

  // Créer des modules par défaut
  const createDefaultModules = async (): Promise<boolean> => {
    try {
      console.log("Création des modules par défaut...");
      
      // Vérifier les autorisations avant d'essayer de créer des modules
      if (!role && !isSpecialAdmin) {
        console.warn("Tentative de création de modules sans rôle approprié");
      }

      // Appeler la fonction RPC sans essayer de définir le rôle PostgreSQL
      const { error } = await supabase.rpc('create_default_modules');
      
      if (error) {
        console.error("Erreur RPC:", error);
        throw error;
      }
      
      console.log("Appel RPC réussi pour la création des modules par défaut");
      
      // Vérifier que les modules ont été créés en effectuant une requête
      const { data: modules, error: checkError } = await supabase
        .from('modules')
        .select('count')
        .single();
        
      if (checkError) {
        console.error("Erreur lors de la vérification des modules:", checkError);
        throw checkError;
      }
      
      console.log("Vérification des modules réussie:", modules);
      
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
