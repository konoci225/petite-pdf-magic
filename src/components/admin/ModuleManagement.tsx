
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog } from "@/components/ui/dialog";
import ModulesTable from "./modules/ModulesTable";
import ModuleForm from "./modules/ModuleForm";
import ModuleDeleteDialog from "./modules/ModuleDeleteDialog";

interface Module {
  id: string;
  module_name: string;
  description: string | null;
  is_active: boolean;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

interface ModuleFormData {
  module_name: string;
  description: string;
  is_active: boolean;
  is_premium: boolean;
}

export const ModuleManagement = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [formData, setFormData] = useState<ModuleFormData>({
    module_name: "",
    description: "",
    is_active: true,
    is_premium: false,
  });
  const { toast } = useToast();

  const fetchModules = async () => {
    try {
      setIsLoading(true);
      
      // Modification ici: récupérer les modules sans filtrer par utilisateur
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }
      
      console.log("Modules récupérés:", data);
      
      if (!data || data.length === 0) {
        await createDefaultModules();
        
        const { data: refreshedData, error: refreshError } = await supabase
          .from("modules")
          .select("*")
          .order("created_at", { ascending: false });
          
        if (refreshError) throw refreshError;
        console.log("Modules créés par défaut:", refreshedData);
        setModules(refreshedData || []);
      } else {
        setModules(data);
      }
    } catch (error: any) {
      console.error("Error fetching modules:", error);
      // Modification: affichage de l'erreur complète
      toast({
        title: "Erreur",
        description: "Impossible de charger les modules: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createDefaultModules = async () => {
    try {
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
          is_active: true,
          is_premium: true,
        },
        {
          module_name: "Module Compression PDF",
          description: "Compression de fichiers PDF",
          is_active: true,
          is_premium: false,
        },
        {
          module_name: "Module Fusion PDF",
          description: "Fusion de plusieurs fichiers PDF en un seul document",
          is_active: true,
          is_premium: false,
        },
        {
          module_name: "Module Division PDF",
          description: "Division d'un fichier PDF en plusieurs documents",
          is_active: true,
          is_premium: false,
        },
        {
          module_name: "Module Signature PDF",
          description: "Signature électronique de documents PDF",
          is_active: true,
          is_premium: true,
        },
        {
          module_name: "Module Protection PDF",
          description: "Protection de documents PDF par mot de passe",
          is_active: true,
          is_premium: true,
        },
        {
          module_name: "Module Filigrane PDF",
          description: "Ajout de filigranes aux documents PDF",
          is_active: true,
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
        title: "Modules par défaut créés",
        description: "Des modules par défaut ont été créés pour démonstration",
      });
    } catch (error: any) {
      console.error("Error creating default modules:", error);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  // ... garder le code existant pour les gestionnaires d'événements

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
    try {
      if (selectedModule) {
        const { error } = await supabase
          .from("modules")
          .update({
            module_name: formData.module_name,
            description: formData.description || null,
            is_active: formData.is_active,
            is_premium: formData.is_premium,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedModule.id);

        if (error) throw error;
        toast({
          title: "Succès",
          description: "Module mis à jour avec succès",
        });
      } else {
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

      setIsDialogOpen(false);
      fetchModules();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error saving module:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedModule) return;

    try {
      // Suppression des relations user_modules d'abord
      const { error: userModulesError } = await supabase
        .from("user_modules")
        .delete()
        .eq("module_id", selectedModule.id);

      if (userModulesError) throw userModulesError;

      // Puis suppression du module
      const { error } = await supabase
        .from("modules")
        .delete()
        .eq("id", selectedModule.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Module supprimé avec succès",
      });
      setIsDeleteDialogOpen(false);
      fetchModules();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error deleting module:", error);
    }
  };

  const handleToggleActive = async (module: Module) => {
    try {
      const { error } = await supabase
        .from("modules")
        .update({
          is_active: !module.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", module.id);

      if (error) throw error;
      fetchModules();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut du module",
        variant: "destructive",
      });
      console.error("Error toggling module status:", error);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Gestion des modules</h2>
        <Button onClick={handleOpenCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau module
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
