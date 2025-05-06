
import { useState, useEffect } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import ModulesTable from "./modules/ModulesTable";
import ModuleForm from "./modules/ModuleForm";
import ModuleDeleteDialog from "./modules/ModuleDeleteDialog";
import { useModuleService } from "./modules/ModuleService";
import type { Module, ModuleFormData } from "./modules/ModuleTypes";
import { useToast } from "@/hooks/use-toast";

export const ModuleManagement = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ModuleFormData>({
    module_name: "",
    description: "",
    is_active: true,
    is_premium: false,
  });
  
  const moduleService = useModuleService();
  const { toast } = useToast();

  const fetchModules = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedModules = await moduleService.fetchModules();
      
      if (fetchedModules.length === 0) {
        // Create default modules only if no modules exist
        console.log("Aucun module trouvé, création des modules par défaut...");
        await moduleService.createDefaultModules();
        const refreshedModules = await moduleService.fetchModules();
        setModules(refreshedModules);
      } else {
        setModules(fetchedModules);
      }
    } catch (err: any) {
      console.error("Failed to fetch modules:", err);
      setError("Impossible de charger les modules: " + err.message);
      toast({
        title: "Erreur",
        description: "Impossible de charger les modules: " + err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleOpenCreateDialog = () => {
    setSelectedModule(null);
    setFormData({
      module_name: "",
      description: "",
      is_active: true,
      is_premium: false,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (module: Module) => {
    setSelectedModule(module);
    setFormData({
      module_name: module.module_name,
      description: module.description || "",
      is_active: module.is_active,
      is_premium: module.is_premium,
    });
    setIsDialogOpen(true);
  };

  const handleOpenDeleteDialog = (module: Module) => {
    setSelectedModule(module);
    setIsDeleteDialogOpen(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, value: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await moduleService.saveModule(
      formData, 
      selectedModule?.id
    );
    
    if (success) {
      setIsDialogOpen(false);
      fetchModules();
    }
  };

  const handleDelete = async () => {
    if (!selectedModule) return;
    
    const success = await moduleService.deleteModule(selectedModule.id);
    if (success) {
      setIsDeleteDialogOpen(false);
      fetchModules();
    }
  };

  const handleToggleActive = async (module: Module) => {
    const success = await moduleService.toggleModuleActive(module);
    if (success) {
      fetchModules();
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Gestion des modules</h2>
        <div className="flex gap-2">
          <Button onClick={handleOpenCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau module
          </Button>
          <Button variant="outline" onClick={fetchModules}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          {error}
        </div>
      ) : modules.length > 0 ? (
        <ModulesTable
          modules={modules}
          onEditModule={handleOpenEditDialog}
          onDeleteModule={handleOpenDeleteDialog}
          onToggleActive={handleToggleActive}
        />
      ) : (
        <div className="text-center py-8 text-gray-500">
          Aucun module trouvé. Créez votre premier module !
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <ModuleForm
          formData={formData}
          handleFormChange={handleFormChange}
          handleSwitchChange={handleSwitchChange}
          handleSubmit={handleSubmit}
          isEditing={!!selectedModule}
        />
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <ModuleDeleteDialog
          selectedModule={selectedModule}
          onClose={() => setIsDeleteDialogOpen(false)}
          onDelete={handleDelete}
        />
      </Dialog>
    </div>
  );
};
