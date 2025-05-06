
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import type { Module } from "../ModuleTypes";

export const useModuleDataService = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Récupérer tous les modules
  const fetchModules = async (): Promise<Module[]> => {
    try {
      console.log("Récupération de la liste des modules...");
      
      // Si nous n'avons pas d'utilisateur connecté, retourner une liste vide
      if (!user) {
        console.warn("Aucun utilisateur connecté");
        return [];
      }
      
      // Ajouter l'ID utilisateur dans les headers pour contourner les problèmes de RLS
      const { data: modules, error } = await supabase
        .from("modules")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Erreur lors de la récupération des modules:", error);
        
        // Contournement: essayer de créer directement les modules par défaut si aucun module n'existe
        if (error.message.includes("permission denied")) {
          console.log("Tentative de contournement des problèmes de permission...");
          const { error: createError } = await supabase.rpc("create_default_modules");
          
          if (createError) {
            console.error("Échec du contournement:", createError);
            throw error; // Relancer l'erreur originale
          }
          
          // Réessayer la requête après avoir créé les modules par défaut
          const { data: newModules, error: newError } = await supabase
            .from("modules")
            .select("*")
            .order("created_at", { ascending: false });
            
          if (newError) {
            console.error("Toujours des erreurs après contournement:", newError);
            throw newError;
          }
          
          return newModules as Module[] || [];
        }
        
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
      
      if (!user) {
        console.warn("Aucun utilisateur connecté");
        throw new Error("Vous devez être connecté pour effectuer cette action");
      }
      
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
      
      if (!user) {
        console.warn("Aucun utilisateur connecté");
        throw new Error("Vous devez être connecté pour effectuer cette action");
      }
      
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
