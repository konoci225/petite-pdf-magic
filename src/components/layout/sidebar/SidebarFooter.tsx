
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import FixRoleButton from "@/components/admin/users/FixRoleButton";

const SidebarFooter = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { role, refreshRole } = useUserRole();
  const { toast } = useToast();
  const [isKnownAdmin, setIsKnownAdmin] = useState(false);

  // Vérifier si l'utilisateur est konointer@gmail.com
  useEffect(() => {
    if (user?.email === "konointer@gmail.com") {
      setIsKnownAdmin(true);
      // Forcer la mise à jour du rôle au chargement pour l'utilisateur spécial
      const forceUpdateSpecialUserRole = async () => {
        try {
          console.log("Mise à jour automatique du rôle pour konointer@gmail.com");
          
          // Essayer d'abord la nouvelle méthode de bypass RLS
          const { error: bypassError } = await supabase.rpc(
            'force_admin_role_bypass_rls',
            { user_email: user.email }
          );
          
          if (bypassError) {
            console.error("Erreur lors de la mise à jour automatique du rôle par bypass:", bypassError);
            
            // Si échec, essayer la méthode directe
            const { error: directError } = await supabase
              .from("user_roles")
              .upsert({
                user_id: user.id,
                role: "super_admin"
              }, { onConflict: "user_id" });
            
            if (directError) {
              console.error("Erreur lors de la mise à jour directe du rôle:", directError);
            }
          }
          
          // Actualiser le rôle dans l'interface
          await refreshRole();
          
        } catch (error) {
          console.error("Erreur lors de la mise à jour automatique du rôle:", error);
        }
      };
      
      // Exécuter la mise à jour automatique
      forceUpdateSpecialUserRole();
    } else {
      setIsKnownAdmin(false);
    }
  }, [user, refreshRole]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès",
      });
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Erreur de déconnexion",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleManualRefreshRole = async () => {
    await refreshRole();
    toast({
      title: "Rôle actualisé",
      description: "Votre rôle a été actualisé"
    });
  };

  return (
    <div className="border-t border-border p-4">
      {user && (
        <div className="flex flex-col gap-2">
          <div className="text-sm text-muted-foreground">
            Connecté en tant que:
          </div>
          <div className="text-sm font-semibold truncate">
            {user?.email}
            {role && (
              <div className="text-xs text-muted-foreground mt-1">
                Rôle: {role}
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-2 mt-2">
            {/* Afficher le bouton de réparation des droits uniquement pour konointer@gmail.com */}
            {isKnownAdmin && role !== "super_admin" && (
              <FixRoleButton />
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={handleManualRefreshRole}
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Actualiser le rôle
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" /> Déconnexion
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SidebarFooter;
