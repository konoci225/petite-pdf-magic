
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Module } from "../ModuleTypes";

export const useModuleDataService = () => {
  const { toast } = useToast();
  
  // Récupérer tous les modules
  const fetchModules = async (): Promise<Module[]> => {
    try {
      console.log("Récupération de la liste des modules...");
      
      const { data: modules, error } = await supabase
        .from("modules")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Erreur lors de la récupération des modules:", error);
        throw error;
      }
      
      return modules as Module[] || [];
    } catch (error: any) {
      console.error("Échec de la récupération des modules:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les modules: " + error.message,
        variant: "destructive",
      });
      return [];
    }
  };

  // Créer ou mettre à jour un module
  const saveModule = async (
    formData: Omit<Module, "id" | "created_at" | "updated_at">,
    moduleId?: string
  ): Promise<boolean> => {
    try {
      console.log("Sauvegarde du module:", formData, "ID:", moduleId || "nouveau");
      
      if (moduleId) {
        // Mise à jour d'un module existant
        const { error } = await supabase
          .from("modules")
          .update({
            module_name: formData.module_name,
            description: formData.description,
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
        // Création d'un nouveau module
        const { error } = await supabase.from("modules").insert([
          {
            module_name: formData.module_name,
            description: formData.description,
            is_active: formData.is_active,
            is_premium: formData.is_premium,
          },
        ]);
        
        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Nouveau module créé avec succès",
        });
      }
      
      return true;
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde du module:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le module: " + error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  // Supprimer un module
  const deleteModule = async (moduleId: string): Promise<boolean> => {
    try {
      console.log("Suppression du module:", moduleId);
      
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
      console.error("Erreur lors de la suppression du module:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le module: " + error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    fetchModules,
    saveModule,
    deleteModule,
  };
};
