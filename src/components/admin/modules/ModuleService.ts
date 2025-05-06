
import { useModuleDataService } from "./services/ModuleDataService";
import { useModuleStateService } from "./services/ModuleStateService";
import { useModuleDefaultService } from "./services/ModuleDefaultService";
import type { Module, ModuleFormData } from "./ModuleTypes";

export type { Module, ModuleFormData };

export const useModuleService = () => {
  const dataService = useModuleDataService();
  const stateService = useModuleStateService();
  const defaultService = useModuleDefaultService();

  // Re-export des méthodes des services individuels
  const { fetchModules, saveModule, deleteModule } = dataService;
  const { toggleModuleActive } = stateService;
  const { createDefaultModules } = defaultService;

  return {
    fetchModules,
    saveModule,
    deleteModule,
    toggleModuleActive,
    createDefaultModules,
  };
};
