
import React, { useState, useCallback, useEffect } from "react";
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
  
  // Vérification automatique au chargement si une réparation est nécessaire
  useEffect(() => {
    if (isSpecialAdmin && user?.email === 'konointer@gmail.com') {
      const checkNeedsRepair = async () => {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (!data || data.role !== 'super_admin') {
          console.log("Réparation automatique recommandée pour konointer@gmail.com");
        }
      };
      
      checkNeedsRepair().catch(console.error);
    }
  }, [isSpecialAdmin, user]);

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
      console.log("Début de la réparation du rôle pour", user.email);
      
      // PREMIÈRE MÉTHODE: Fonction Edge (la plus fiable avec Service Role Key)
      console.log("1. Tentative avec la fonction Edge...");
      const { data: edgeData, error: edgeError } = await supabase.functions.invoke('set-admin-role', {
        body: { 
          email: user.email,
          userId: user.id,
          forceRepair: true 
        }
      });
      
      if (edgeError) {
        console.error("Erreur fonction Edge:", edgeError);
        throw new Error(`Échec de la fonction Edge: ${edgeError.message}`);
      }
      
      if (edgeData?.success) {
        console.log("Succès avec la fonction Edge");
        await refreshRole();
        setWasSuccessful(true);
        toast({
          title: "Rôle corrigé via Edge Function",
          description: "Votre rôle a été correctement défini sur Super Admin.",
        });
        
        // Actualiser la page après le succès
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        
        return;
      }
      
      // DEUXIÈME MÉTHODE: RPC direct
      console.log("2. Tentative avec RPC...");
      const { error: rpcError } = await supabase.rpc('force_set_super_admin_role', { 
        target_user_id: user.id 
      });
      
      if (!rpcError) {
        console.log("Succès avec la méthode RPC");
        await refreshRole();
        setWasSuccessful(true);
        toast({
          title: "Rôle corrigé via RPC",
          description: "Votre rôle a été correctement défini sur Super Admin.",
        });
        
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        
        return;
      } else {
        console.error("Erreur RPC:", rpcError);
      }
      
      // TROISIÈME MÉTHODE: Insertion directe
      console.log("3. Tentative avec insertion directe...");
      const { error: insertError } = await supabase
        .from('user_roles')
        .upsert({ 
          user_id: user.id, 
          role: 'super_admin',
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      
      if (!insertError) {
        console.log("Succès avec l'insertion directe");
        await refreshRole();
        setWasSuccessful(true);
        toast({
          title: "Rôle corrigé via insertion directe",
          description: "Votre rôle a été correctement défini sur Super Admin.",
        });
        
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        
        return;
      } else {
        console.error("Erreur d'insertion:", insertError);
        throw new Error(`Échec de l'insertion directe: ${insertError.message}`);
      }
      
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

  // Ne pas afficher le bouton si ce n'est pas l'admin spécial
  if (!user?.email?.includes("konointer@gmail.com") && !isSpecialAdmin) {
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
