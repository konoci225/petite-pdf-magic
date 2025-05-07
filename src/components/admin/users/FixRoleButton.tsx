
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, RefreshCw, Check } from "lucide-react";

const FixRoleButton = () => {
  const { user } = useAuth();
  const { refreshRole, isSpecialAdmin } = useUserRole();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [wasSuccessful, setWasSuccessful] = useState(false);

  const handleFixRole = useCallback(async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour effectuer cette action",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setWasSuccessful(false);
    
    try {
      // Méthode 1: RPC
      const { error: rpcError } = await supabase.rpc('force_set_super_admin_role', { 
        target_user_id: user.id 
      });
      
      if (rpcError) {
        console.error("Erreur RPC:", rpcError);
        
        // Méthode 2: Insertion directe
        const { error: insertError } = await supabase
          .from('user_roles')
          .upsert({ 
            user_id: user.id, 
            role: 'super_admin',
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
        
        if (insertError) {
          console.error("Erreur d'insertion:", insertError);
          
          // Méthode 3: Edge Function
          const { data, error: functionError } = await supabase.functions.invoke('set-admin-role', {
            body: { email: user.email }
          });
          
          if (functionError) {
            throw new Error(`Échec de la fonction Edge: ${functionError.message}`);
          }
          
          if (!data?.success) {
            throw new Error("La fonction Edge n'a pas réussi à corriger le rôle");
          }
        }
      }
      
      // Rafraîchir le rôle après la réparation
      await refreshRole();
      
      setWasSuccessful(true);
      toast({
        title: "Rôle corrigé",
        description: "Votre rôle a été correctement défini sur Super Admin.",
      });
      
      // Actualiser la page après 1 seconde pour appliquer les changements
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error: any) {
      console.error("Erreur lors de la réparation du rôle:", error);
      toast({
        title: "Erreur",
        description: `Impossible de réparer le rôle: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, refreshRole, toast]);

  if (!isSpecialAdmin) {
    return null;
  }

  return (
    <Button
      onClick={handleFixRole}
      disabled={isLoading || wasSuccessful}
      className={`w-full ${wasSuccessful ? 'bg-green-600 hover:bg-green-700' : ''}`}
      variant={wasSuccessful ? "default" : "destructive"}
    >
      {isLoading ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Réparation en cours...
        </>
      ) : wasSuccessful ? (
        <>
          <Check className="mr-2 h-4 w-4" /> Rôle corrigé
        </>
      ) : (
        <>
          <Shield className="mr-2 h-4 w-4" /> Réparer les autorisations
        </>
      )}
    </Button>
  );
};

export default FixRoleButton;
