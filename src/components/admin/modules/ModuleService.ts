
import { useState } from "react";
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

const DEFAULT_MODULES = [
  {
    module_name: "PDF Fusion",
    description: "Combinez plusieurs fichiers PDF en un seul document",
    is_active: true,
    is_premium: false
  },
  {
    module_name: "PDF Division",
    description: "Séparez un PDF en plusieurs documents distincts",
    is_active: true,
    is_premium: false
  },
  {
    module_name: "Compression PDF",
    description: "Réduisez la taille de vos fichiers PDF",
    is_active: true,
    is_premium: false
  },
  {
    module_name: "Conversion PDF vers Word",
    description: "Convertissez des PDF en documents Word éditables",
    is_active: true,
    is_premium: true
  }
];

export const useModuleService = () => {
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
    formData: ModuleFormData,
    moduleId: string | undefined
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

  // Créer des modules par défaut
  const createDefaultModules = async (): Promise<boolean> => {
    try {
      console.log("Création des modules par défaut...");
      
      const { error } = await supabase
        .from("modules")
        .insert(DEFAULT_MODULES);
      
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
    fetchModules,
    saveModule,
    deleteModule,
    toggleModuleActive,
    createDefaultModules,
  };
};
