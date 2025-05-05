
import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { LogOut, RefreshCw, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const SidebarFooter = () => {
  const { user, signOut } = useAuth();
  const { role, refreshRole } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isFixingRole, setIsFixingRole] = useState(false);
  const isSpecialAdmin = user?.email === "konointer@gmail.com";
  
  // Pour les utilisateurs spéciaux, vérifier et réparer automatiquement le rôle
  useEffect(() => {
    if (isSpecialAdmin && role !== "super_admin") {
      fixRoleAutomatically();
    }
  }, [role, isSpecialAdmin]);
  
  const fixRoleAutomatically = async () => {
    if (!user || isFixingRole) return;
    
    setIsFixingRole(true);
    try {
      // Essayez d'abord en appelant la fonction RPC
      const { error: rpcError } = await supabase.rpc(
        'force_set_super_admin_role',
        { target_user_id: user.id }
      );
      
      if (rpcError) {
        console.error("Erreur lors de la réparation automatique du rôle:", rpcError);
        
        // Méthode alternative: upsert direct dans la table user_roles
        const { error: upsertError } = await supabase
          .from("user_roles")
          .upsert({ 
            user_id: user.id,
            role: "super_admin" 
          }, { onConflict: "user_id" });
          
        if (upsertError) {
          console.error("Erreur d'upsert:", upsertError);
        }
      }
      
      // Actualiser le rôle
      await refreshRole();
      
      if (role !== "super_admin") {
        // Afficher un toast pour informer l'utilisateur qu'il peut cliquer sur le bouton de réparation
        toast({
          title: "Attention",
          description: "Votre rôle Super Admin n'a pas été appliqué correctement. Utilisez le bouton 'Réparer les autorisations' dans le tableau de bord.",
          variant: "default", // Variant corrigé
        });
      }
    } catch (error) {
      console.error("Erreur lors de la réparation automatique du rôle:", error);
    } finally {
      setIsFixingRole(false);
    }
  };

  const handleRefreshRole = async () => {
    await refreshRole();
    toast({
      title: "Rôle actualisé",
      description: `Votre rôle actuel est: ${role || "Non défini"}`,
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="py-4 border-t">
      {user && (
        <div className="px-3 text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
          {user.email}
          {role && (
            <div className="flex items-center mt-1">
              <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                {role}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 ml-1"
                onClick={handleRefreshRole}
                title="Actualiser le rôle"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      )}
      
      {isSpecialAdmin && role !== "super_admin" && (
        <div className="px-3 mb-2">
          <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            Rôle admin non appliqué
          </div>
        </div>
      )}

      <div className="px-3">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Déconnexion
        </Button>
      </div>
    </div>
  );
};

export default SidebarFooter;
