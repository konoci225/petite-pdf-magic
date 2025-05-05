
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { Loader2 } from 'lucide-react';

const FixRoleButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { refreshRole } = useUserRole();

  const handleFixRole = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Essayez d'abord en appelant la fonction RPC
      const { error: rpcError } = await supabase.rpc(
        'force_set_super_admin_role',
        { target_user_id: user.id }
      );
      
      if (rpcError) {
        console.error("Erreur RPC:", rpcError);
        
        // Méthode alternative: upsert direct dans la table user_roles
        const { error: upsertError } = await supabase
          .from("user_roles")
          .upsert({ 
            user_id: user.id,
            role: "super_admin" 
          }, { onConflict: "user_id" });
          
        if (upsertError) {
          console.error("Erreur d'upsert:", upsertError);
          throw new Error(upsertError.message);
        }
      }
      
      // Attendre un court instant pour que les changements se propagent
      setTimeout(async () => {
        await refreshRole();
        toast({
          title: "Succès",
          description: "Vos droits d'accès ont été réparés. Vous êtes maintenant Super Admin.",
        });
        setIsLoading(false);
        
        // Recharger la page pour appliquer les nouvelles permissions
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error("Erreur lors de la réparation du rôle:", error);
      toast({
        title: "Erreur",
        description: "Impossible de réparer les droits: " + error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleFixRole}
      disabled={isLoading}
      className="flex items-center justify-center"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : null}
      Réparer mes droits d'accès
    </Button>
  );
};

export default FixRoleButton;
