
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Loader2 } from "lucide-react";
import { useUserRole } from '@/hooks/useUserRole';

interface FixRoleButtonProps {
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const FixRoleButton = ({ size = 'default' }: FixRoleButtonProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { refreshRole } = useUserRole();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);

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
    
    try {
      // Call the edge function first
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
        throw new Error(edgeError.message);
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
      
      // If edge function didn't work, try using admin-bypass function
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
      
      // If both methods failed
      toast({
        title: "Échec de la réparation",
        description: "Impossible d'attribuer le rôle super_admin. Essayez d'activer le mode forcé.",
        variant: "destructive",
      });
      
    } catch (error: any) {
      console.error("Erreur lors de la réparation du rôle:", error);
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
    <Button 
      onClick={handleRepairRole}
      disabled={isLoading || isSuccess}
      variant={isSuccess ? "default" : "outline"}
      size={size}
      className={isSuccess ? "bg-green-600 hover:bg-green-700" : ""}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Shield className={`mr-2 h-4 w-4 ${isSuccess ? "text-white" : ""}`} />
      )}
      {isSuccess 
        ? "Privilèges réparés" 
        : attempts > 0 
          ? `Réparer les autorisations (${attempts})` 
          : "Réparer les autorisations"
      }
    </Button>
  );
};

export default FixRoleButton;
