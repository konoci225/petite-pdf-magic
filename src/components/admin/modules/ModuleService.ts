
import { useToast } from "@/hooks/use-toast";
import { useModuleDataService } from "./ModuleDataService";
import { useModuleDefaultService } from "./services/ModuleDefaultService";
import type { Module, ModuleFormData } from "./ModuleTypes";

export const useModuleService = () => {
  const { toast } = useToast();
  const dataService = useModuleDataService();
  const defaultService = useModuleDefaultService();
  
  // Fonction pour récupérer tous les modules
  const fetchModules = async (): Promise<Module[]> => {
    return await dataService.fetchModules();
  };
  
  // Fonction pour créer les modules par défaut
  const createDefaultModules = async (): Promise<boolean> => {
    try {
      // Essayer d'abord avec le service de données
      const result = await dataService.createDefaultModules();
      if (result) return true;
      
      // Sinon essayer avec le service par défaut
      return await defaultService.createDefaultModules();
    } catch (error: any) {
      console.error("Erreur lors de la création des modules par défaut:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer les modules par défaut",
        variant: "destructive"
      });
      return false;
    }
  };
  
  // Fonction pour sauvegarder un module (création ou mise à jour)
  const saveModule = async (formData: ModuleFormData, moduleId?: string): Promise<boolean> => {
    return await dataService.saveModule(formData, moduleId);
  };
  
  // Fonction pour supprimer un module
  const deleteModule = async (moduleId: string): Promise<boolean> => {
    return await dataService.deleteModule(moduleId);
  };
  
  // Fonction pour activer/désactiver un module
  const toggleModuleActive = async (module: Module): Promise<boolean> => {
    try {
      return await saveModule({
        module_name: module.module_name,
        description: module.description || '',
        is_active: !module.is_active,
        is_premium: module.is_premium
      }, module.id);
    } catch (error: any) {
      console.error("Erreur lors de la modification du statut du module:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut du module",
        variant: "destructive"
      });
      return false;
    }
  };
  
  return {
    fetchModules,
    createDefaultModules,
    saveModule,
    deleteModule,
    toggleModuleActive
  };
};
