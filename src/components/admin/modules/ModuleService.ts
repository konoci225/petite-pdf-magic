
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Module {
  id: string;
  module_name: string;
  description: string | null;
  is_active: boolean;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface ModuleFormData {
  module_name: string;
  description: string;
  is_active: boolean;
  is_premium: boolean;
}

export const useModuleService = () => {
  const { toast } = useToast();

  const fetchModules = async (): Promise<Module[]> => {
    try {
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }
      
      console.log("Modules récupérés:", data);
      return data || [];
    } catch (error: any) {
      console.error("Error fetching modules:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les modules: " + error.message,
        variant: "destructive",
      });
      return [];
    }
  };

  const createDefaultModules = async () => {
    try {
      console.log("Vérification si des modules existent déjà");
      const { data: existingModules, error: checkError } = await supabase
        .from("modules")
        .select("id")
        .limit(1);
      
      if (checkError) {
        throw checkError;
      }
      
      // Only create default modules if none exist
      if (existingModules && existingModules.length > 0) {
        console.log("Des modules existent déjà, pas besoin d'en créer par défaut");
        return true;
      }
      
      console.log("Création des modules par défaut");
      // Définition de tous les modules PDF
      const defaultModules = [
        {
          module_name: "Module PDF Basic",
          description: "Fonctionnalités de base pour la manipulation de fichiers PDF",
          is_active: true,
          is_premium: false,
        },
        {
          module_name: "Module PDF Advanced",
          description: "Fonctionnalités avancées pour la manipulation de fichiers PDF",
          is_active: true,
          is_premium: true,
        },
        {
          module_name: "Module OCR",
          description: "Reconnaissance optique de caractères pour les documents scannés",
          is_active: false,
          is_premium: true,
        }
      ];
      
      // Insertion des modules par défaut
      const { error } = await supabase.from("modules").insert(defaultModules);
      
      if (error) {
        console.error("Erreur lors de la création des modules par défaut:", error);
        throw error;
      }
      
      toast({
        title: "Modules initiaux créés",
        description: "Des modules de base ont été créés pour démarrer",
      });

      return true;
    } catch (error: any) {
      console.error("Error creating default modules:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer les modules par défaut: " + error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const saveModule = async (formData: ModuleFormData, moduleId?: string): Promise<boolean> => {
    try {
      if (moduleId) {
        // Update existing module
        const { error } = await supabase
          .from("modules")
          .update({
            module_name: formData.module_name,
            description: formData.description || null,
            is_active: formData.is_active,
            is_premium: formData.is_premium,
            updated_at: new Date().toISOString(),
          })
          .eq("id", moduleId);

        if (error) throw error;
        toast({
          title: "Succès",
          description: "Module mis à jour avec succès",
        });
      } else {
        // Create new module
        const { error } = await supabase.from("modules").insert({
          module_name: formData.module_name,
          description: formData.description || null,
          is_active: formData.is_active,
          is_premium: formData.is_premium,
        });

        if (error) throw error;
        toast({
          title: "Succès",
          description: "Module créé avec succès",
        });
      }

      return true;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error saving module:", error);
      return false;
    }
  };

  const deleteModule = async (moduleId: string): Promise<boolean> => {
    try {
      // Suppression des relations user_modules d'abord
      const { error: userModulesError } = await supabase
        .from("user_modules")
        .delete()
        .eq("module_id", moduleId);

      if (userModulesError) throw userModulesError;

      // Puis suppression du module
      const { error } = await supabase
        .from("modules")
        .delete()
        .eq("id", moduleId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Module supprimé avec succès",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error deleting module:", error);
      return false;
    }
  };

  const toggleModuleActive = async (module: Module): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("modules")
        .update({
          is_active: !module.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", module.id);

      if (error) throw error;
      return true;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut du module",
        variant: "destructive",
      });
      console.error("Error toggling module status:", error);
      return false;
    }
  };

  return {
    fetchModules,
    createDefaultModules,
    saveModule,
    deleteModule,
    toggleModuleActive,
  };
};
