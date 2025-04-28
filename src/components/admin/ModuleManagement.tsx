import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
      
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }
      
      if (!data || data.length === 0) {
        await createDefaultModules();
        
        const { data: refreshedData, error: refreshError } = await supabase
          .from("modules")
          .select("*")
          .order("created_at", { ascending: false });
          
        if (refreshError) throw refreshError;
        setModules(refreshedData || []);
      } else {
        setModules(data);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les modules: " + error.message,
        variant: "destructive",
      });
      console.error("Error fetching modules:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createDefaultModules = async () => {
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
    ];

    try {
      const { error } = await supabase.from("modules").insert(defaultModules);
      if (error) throw error;
      
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
      const { error: userModulesError } = await supabase
        .from("user_modules")
        .delete()
        .eq("module_id", selectedModule.id);

      if (userModulesError) throw userModulesError;

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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Premium</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modules.map((module) => (
              <TableRow key={module.id}>
                <TableCell className="font-medium">{module.module_name}</TableCell>
                <TableCell>{module.description || "-"}</TableCell>
                <TableCell>
                  {module.is_premium ? (
                    <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                      Premium
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                      Standard
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={module.is_active}
                    onCheckedChange={() => handleToggleActive(module)}
                    className="data-[state=checked]:bg-green-500"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEditDialog(module)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDeleteDialog(module)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Aucun module trouvé. Créez votre premier module !
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedModule ? "Modifier le module" : "Créer un nouveau module"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="module_name" className="text-right">
                  Nom du module
                </Label>
                <Input
                  id="module_name"
                  name="module_name"
                  value={formData.module_name}
                  onChange={handleFormChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  className="col-span-3"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="is_premium" className="text-right">
                  Module Premium
                </Label>
                <div className="col-span-3">
                  <Switch
                    id="is_premium"
                    checked={formData.is_premium}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("is_premium", checked)
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="is_active" className="text-right">
                  Module Actif
                </Label>
                <div className="col-span-3">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("is_active", checked)
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Êtes-vous sûr de vouloir supprimer le module "
            {selectedModule?.module_name}" ? Cette action est irréversible.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
