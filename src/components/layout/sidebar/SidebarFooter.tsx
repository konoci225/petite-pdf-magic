
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
    } else {
      setIsKnownAdmin(false);
    }
  }, [user]);

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
