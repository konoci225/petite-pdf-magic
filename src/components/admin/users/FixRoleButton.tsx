
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Shield, Loader2 } from "lucide-react";

const FixRoleButton = () => {
  const [isRepairing, setIsRepairing] = useState(false);
  const { user } = useAuth();
  const { refreshRole } = useUserRole();
  const { toast } = useToast();

  const handleRepairPermissions = async () => {
    if (!user) return;
    
    setIsRepairing(true);
    try {
      // First try using the RPC function
      const { error: rpcError } = await supabase.rpc(
        'force_set_super_admin_role',
        { target_user_id: user.id }
      );
      
      if (rpcError) {
        console.error("Erreur RPC:", rpcError);
        
        // Alternative: use direct upsert to user_roles table
        const { error: upsertError } = await supabase
          .from("user_roles")
          .upsert({ 
            user_id: user.id,
            role: "super_admin" 
          }, { onConflict: "user_id" });
          
        if (upsertError) {
          throw upsertError;
        }
      }
      
      // Refresh the role
      await refreshRole();
      
      toast({
        title: "Succès",
        description: "Vos autorisations ont été réparées avec succès.",
      });
      
      // Reload the page to apply new permissions
      window.location.reload();
      
    } catch (error: any) {
      console.error("Erreur de réparation des autorisations:", error);
      toast({
        title: "Erreur",
        description: `Impossible de réparer les autorisations : ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsRepairing(false);
    }
  };

  return (
    <Button
      variant="destructive"
      onClick={handleRepairPermissions}
      disabled={isRepairing}
      className="flex items-center"
    >
      {isRepairing ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Shield className="h-4 w-4 mr-2" />
      )}
      Réparer les autorisations
    </Button>
  );
};

export default FixRoleButton;
