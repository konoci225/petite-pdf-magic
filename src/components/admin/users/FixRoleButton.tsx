
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Loader2, AlertTriangle, Info } from "lucide-react";
import { useUserRole } from '@/hooks/useUserRole';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface FixRoleButtonProps {
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

const FixRoleButton = ({ 
  size = 'default',
  variant = 'outline'
}: FixRoleButtonProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { refreshRole, isSpecialAdmin, enableForcedAdminMode, isForcedAdminMode } = useUserRole();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showFallbackOption, setShowFallbackOption] = useState(false);

  const handleRepairRole = async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Aucun utilisateur connecté",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAttempts(prev => prev + 1);
    setErrorMessage(null);
    
    try {
      // Si le mode forcé est déjà actif, informer l'utilisateur
      if (isForcedAdminMode) {
        toast({
          title: "Mode forcé déjà actif",
          description: "Vous utilisez déjà le mode administrateur forcé.",
          variant: "default",
        });
        setIsSuccess(true);
        setIsLoading(false);
        return;
      }

      // MÉTHODE 1: Call the edge function first
      console.log("Calling set-admin-role edge function");
      const { data: edgeData, error: edgeError } = await supabase.functions.invoke(
        "set-admin-role", 
        { 
          body: { 
            email: user.email, 
            userId: user.id,
            forceRepair: true 
          } 
        }
      );

      if (edgeError) {
        console.error("Edge function error:", edgeError);
        setErrorMessage(`Edge function error: ${edgeError.message}`);
      }

      console.log("Edge function response:", edgeData);

      if (edgeData?.success) {
        // Refresh role to apply the changes
        await refreshRole(true);
        
        setIsSuccess(true);
        
        // Show success toast
        toast({
          title: "Rôle super_admin appliqué",
          description: "Vos privilèges administrateur ont été restaurés avec succès.",
        });
        
        // Force a page reload after a short delay to ensure everything is refreshed
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        
        return;
      }
      
      // MÉTHODE 2: Try using admin-bypass function
      console.log("Trying admin-bypass function");
      const { data: bypassData, error: bypassError } = await supabase.functions.invoke(
        "admin-bypass",
        {
          body: {
            action: "force_super_admin_role",
            targetUserId: user.id
          }
        }
      );
      
      if (bypassError) {
        console.error("Admin-bypass error:", bypassError);
        setErrorMessage(`Admin-bypass error: ${bypassError.message}`);
        setShowFallbackOption(true);
      }
      
      console.log("Admin-bypass response:", bypassData);
      
      if (bypassData?.success) {
        // Refresh role to apply the changes
        await refreshRole(true);
        
        setIsSuccess(true);
        
        toast({
          title: "Rôle super_admin appliqué",
          description: "Vos privilèges administrateur ont été restaurés avec succès via la méthode de contournement.",
        });
        
        // Force a page reload after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        
        return;
      }
      
      // MÉTHODE 3: Last resort - manually enable forced admin mode
      if (isSpecialAdmin) {
        console.log("Echec des méthodes standards - activation du mode forcé");
        setShowFallbackOption(true);
      } else {
        throw new Error("Aucune méthode de réparation n'a fonctionné");
      }
    } catch (error: any) {
      console.error("Error during role repair:", error);
      setErrorMessage(`Error: ${error.message}`);
      setShowFallbackOption(true);
      toast({
        title: "Erreur lors de la réparation",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnableForcedMode = () => {
    enableForcedAdminMode();
    setIsSuccess(true);
    toast({
      title: "Mode administrateur forcé activé",
      description: "Accès administrateur activé en mode de secours.",
      variant: "warning",
    });
    
    // Force a page reload after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="space-y-3">
      <Button 
        onClick={handleRepairRole}
        disabled={isLoading || isSuccess || isForcedAdminMode}
        variant={isSuccess ? "default" : variant}
        size={size}
        className={isSuccess ? "bg-green-600 hover:bg-green-700" : ""}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : isSuccess ? (
          <Shield className="mr-2 h-4 w-4 text-white" />
        ) : (
          <Shield className="mr-2 h-4 w-4" />
        )}
        {isLoading ? "Réparation en cours..." : isSuccess ? "Réparé avec succès" : "Réparer les autorisations"}
      </Button>
      
      {isForcedAdminMode && (
        <Alert variant="warning" className="text-xs p-3">
          <Info className="h-4 w-4" />
          <AlertTitle className="text-xs font-medium">Mode forcé actif</AlertTitle>
          <AlertDescription className="text-xs">
            Le mode administrateur forcé est déjà activé. Vous avez accès aux fonctions d'administration.
          </AlertDescription>
        </Alert>
      )}
      
      {errorMessage && (
        <div className="text-xs bg-yellow-50 border border-yellow-200 text-yellow-800 p-2 rounded">
          <div className="flex items-center mb-1">
            <AlertTriangle className="h-3 w-3 mr-1" />
            <span className="font-medium">Erreur détectée</span>
          </div>
          <p>{errorMessage}</p>
          <p className="mt-1 text-xs">Essai {attempts}/3</p>
        </div>
      )}
      
      {showFallbackOption && !isSuccess && !isForcedAdminMode && (
        <Alert variant="warning" className="p-3 mt-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-xs font-medium">Méthodes standards échouées</AlertTitle>
          <AlertDescription className="text-xs">
            Impossible de réparer le rôle via les méthodes standards. Activer le mode administrateur forcé?
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-2 w-full bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
              onClick={handleEnableForcedMode}
            >
              <Shield className="mr-1 h-3.5 w-3.5" /> Activer le mode forcé
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default FixRoleButton;
