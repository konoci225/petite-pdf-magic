
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Database, Eye, Plus, ShieldAlert } from "lucide-react";

interface ModuleManagementSectionProps {
  stats: {
    activeModules: number;
  };
  loading: boolean;
}

export const ModuleManagementSection = ({ stats, loading }: ModuleManagementSectionProps) => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Gestion des Modules</CardTitle>
            <CardDescription>
              Gérez l'activation, la désactivation et la création de modules au sein de l'application. Personnalisez l'application en fonction des besoins de l'association.
            </CardDescription>
          </div>
          <Database className="h-6 w-6 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <Button size="sm" onClick={() => navigate("/admin")} className="gap-2">
            <Plus className="h-4 w-4" />
            Créer un module
          </Button>
          <Button size="sm" onClick={() => navigate("/admin")} variant="outline" className="gap-2">
            <Eye className="h-4 w-4" />
            Voir tous les modules
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Modules actifs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.activeModules}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Dernières modifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">Aujourd'hui, 10:23</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-50 border-orange-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Alerte</CardTitle>
                <ShieldAlert className="h-4 w-4 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-orange-700">Module OCR désactivé</div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="secondary" className="w-full" onClick={() => navigate("/admin")}>
          Gérer tous les modules
        </Button>
      </CardFooter>
    </Card>
  );
};
