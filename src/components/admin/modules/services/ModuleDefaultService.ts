
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_MODULES } from "../ModuleConstants";

export const useModuleDefaultService = () => {
  const { toast } = useToast();

  // Créer des modules par défaut
  const createDefaultModules = async (): Promise<boolean> => {
    try {
      console.log("Création des modules par défaut...");
      
      // Méthode 1: Essayer d'abord avec la fonction RPC
      let success = false;
      
      try {
        console.log("Tentative avec la fonction RPC create_default_modules");
        const { error } = await supabase.rpc('create_default_modules');
        
        if (error) {
          console.error("Erreur RPC:", error);
          // Continuer avec la méthode alternative si RPC échoue
        } else {
          console.log("Appel RPC réussi pour la création des modules par défaut");
          success = true;
        }
      } catch (rpcError) {
        console.error("Exception RPC:", rpcError);
        // Continuer avec la méthode alternative
      }
      
      // Méthode 2: Insertion directe si la méthode RPC a échoué
      if (!success) {
        console.log("Méthode RPC a échoué, tentative avec insertion directe");
        
        // Vérifier d'abord si des modules existent déjà
        const { count, error: countError } = await supabase
          .from('modules')
          .select('*', { count: 'exact', head: true });
          
        if (countError) {
          console.error("Erreur lors de la vérification des modules:", countError);
          throw countError;
        }
        
        // S'il n'y a pas de modules, en créer
        if (count === 0) {
          console.log("Aucun module trouvé, insertion directe des modules par défaut");
          
          // Liste des modules par défaut (utilisant DEFAULT_MODULES depuis ModuleConstants)
          const defaultModules = [
            {
              module_name: 'Module de base',
              description: 'Fonctionnalités de base de l\'application',
              is_active: true,
              is_premium: false
            },
            {
              module_name: 'Module Premium',
              description: 'Fonctionnalités avancées pour les utilisateurs premium',
              is_active: true,
              is_premium: true
            },
            {
              module_name: 'OCR',
              description: 'Reconnaissance optique de caractères pour les documents PDF',
              is_active: false,
              is_premium: true
            },
            {
              module_name: 'PDF Merge',
              description: 'Fusionner plusieurs fichiers PDF en un seul document',
              is_active: true,
              is_premium: false
            },
            {
              module_name: 'PDF Split',
              description: 'Diviser un document PDF en plusieurs fichiers',
              is_active: true,
              is_premium: false
            },
            {
              module_name: 'PDF Compress',
              description: 'Réduire la taille des fichiers PDF',
              is_active: true,
              is_premium: false
            },
            {
              module_name: 'PDF to Word',
              description: 'Convertir des PDF en documents Word',
              is_active: true,
              is_premium: true
            },
            {
              module_name: 'PDF to Excel',
              description: 'Convertir des PDF en feuilles de calcul Excel',
              is_active: true,
              is_premium: true
            }
          ];
          
          const { error: insertError } = await supabase
            .from('modules')
            .insert(defaultModules);
            
          if (insertError) {
            console.error("Erreur lors de l'insertion des modules:", insertError);
            throw insertError;
          }
          
          console.log("Modules par défaut créés avec succès via insertion directe");
          success = true;
        } else {
          console.log("Des modules existent déjà, création ignorée");
          success = true; // Considéré comme un succès car les modules existent déjà
        }
      }
      
      // Vérifier que les modules ont été créés
      const { data: modules, error: checkError } = await supabase
        .from('modules')
        .select('count')
        .single();
        
      if (checkError) {
        console.error("Erreur lors de la vérification finale des modules:", checkError);
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
