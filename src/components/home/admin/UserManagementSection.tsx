
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Bell, Plus, UserCog, Users } from "lucide-react";

interface UserManagementSectionProps {
  stats: {
    totalUsers: number;
  };
  loading: boolean;
}

export const UserManagementSection = ({ stats, loading }: UserManagementSectionProps) => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Gestion des Utilisateurs</CardTitle>
            <CardDescription>
              Ajoutez de nouveaux membres, attribuez des rôles, et suivez les actions de chaque utilisateur. Maintenez la sécurité et l'organisation de l'application.
            </CardDescription>
          </div>
          <UserCog className="h-6 w-6 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <Button size="sm" onClick={() => navigate("/admin")} className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter un utilisateur
          </Button>
          <Button size="sm" onClick={() => navigate("/admin")} variant="outline" className="gap-2">
            <Users className="h-4 w-4" />
            Voir tous les utilisateurs
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs actifs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="text-2xl font-bold">{loading ? '...' : Math.floor((stats.totalUsers || 0) * 0.8)}</div>
                <div className="text-xs bg-green-100 text-green-700 rounded px-1 h-fit my-auto">
                  {loading || stats.totalUsers === 0 ? '' : `${Math.floor((stats.totalUsers * 0.8 / stats.totalUsers) * 100)}%`}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Répartition des rôles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-xs font-medium">
                  <div className="bg-purple-200 h-2 rounded mb-1"></div>
                  <span>Admin</span>
                </div>
                <div className="text-xs font-medium">
                  <div className="bg-blue-200 h-2 rounded mb-1"></div>
                  <span>Abonnés</span>
                </div>
                <div className="text-xs font-medium">
                  <div className="bg-gray-200 h-2 rounded mb-1"></div>
                  <span>Visiteurs</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-50 border-blue-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Notification</CardTitle>
                <Bell className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-blue-700">3 utilisateurs sans activité récente</div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="secondary" className="w-full" onClick={() => navigate("/admin")}>
          Gérer tous les utilisateurs
        </Button>
      </CardFooter>
    </Card>
  );
};
