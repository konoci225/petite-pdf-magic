
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Settings, ShieldAlert } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { Badge } from "@/components/ui/badge";
import FixRoleButton from "@/components/admin/users/FixRoleButton";

interface AdminDashboardHeaderProps {
  isAdminForcedMode?: boolean;
}

export const AdminDashboardHeader = ({ isAdminForcedMode = false }: AdminDashboardHeaderProps) => {
  const { role, isSpecialAdmin } = useUserRole();
  const { forceRefreshPermissions, retryCount } = useAdminAccess();

  const handleRefresh = () => {
    forceRefreshPermissions();
  };

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold">Tableau de bord administrateur</h1>
            {isSpecialAdmin && (
              <Badge variant="outline" className="ml-2 bg-purple-50 text-purple-800 border-purple-200">
                Administrateur Spécial
              </Badge>
            )}
            {role === "super_admin" && (
              <Badge variant="outline" className="ml-2 bg-green-50 text-green-800 border-green-200">
                Super Admin
              </Badge>
            )}
            {isAdminForcedMode && (
              <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-800 border-amber-200">
                Mode Forcé
              </Badge>
            )}
          </div>
          <p className="text-gray-500">
            Gérez les utilisateurs, les modules et les abonnements de votre application.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} size="sm">
            <RefreshCw className="mr-2 h-4 w-4" /> 
            Actualiser {retryCount > 0 ? `(${retryCount})` : ""}
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" /> Paramètres
          </Button>
        </div>
      </div>
      
      {isSpecialAdmin && (
        <div className="flex justify-end">
          <FixRoleButton />
        </div>
      )}
    </div>
  );
};
