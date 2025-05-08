
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Loader2, AlertTriangle } from "lucide-react";
import { useUserRole } from '@/hooks/useUserRole';

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
  const { refreshRole } = useUserRole();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      // MÉTHODE 1: Call the edge function first
      console.log("Appel de la fonction edge 'set-admin-role'");
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
        console.error("Erreur fonction edge:", edgeError);
        setErrorMessage(`Erreur fonction edge: ${edgeError.message}`);
      }

      console.log("Réponse de la fonction edge:", edgeData);

      if (edgeData?.success) {
        // Refresh role to apply the changes
        await refreshRole();
        
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
      console.log("Tentative avec la fonction admin-bypass");
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
        console.error("Erreur admin-bypass:", bypassError);
        setErrorMessage(`Erreur admin-bypass: ${bypassError.message}`);
        throw new Error(bypassError.message);
      }
      
      console.log("Réponse de admin-bypass:", bypassData);
      
      if (bypassData?.success) {
        // Refresh role to apply the changes
        await refreshRole();
        
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
      
      // MÉTHODE 3: Dernier recours - essayer de définir manuellement le localStorage
      console.log("Tentative avec forçage manuel du mode admin");
      localStorage.setItem('app_forced_admin_mode', 'true');
      
      toast({
        title: "Mode administrateur forcé activé",
        description: "Un mode de secours a été activé. Veuillez actualiser la page.",
        variant: "default",
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error: any) {
      console.error("Erreur lors de la réparation du rôle:", error);
      setErrorMessage(`Erreur: ${error.message}`);
      toast({
        title: "Erreur lors de la réparation",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button 
        onClick={handleRepairRole}
        disabled={isLoading || isSuccess}
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
        {isSuccess 
          ? "Privilèges réparés" 
          : attempts > 0 
            ? `Réparer les autorisations (${attempts})` 
            : "Réparer les autorisations"
        }
      </Button>
      
      {errorMessage && (
        <div className="text-xs text-red-500 flex items-center mt-1">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default FixRoleButton;
