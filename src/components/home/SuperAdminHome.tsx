
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SuperAdminHome = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Administration du Système</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Utilisateurs Totaux</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">+12% depuis le mois dernier</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Fichiers Traités</CardTitle>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,453</div>
            <p className="text-xs text-muted-foreground">+8% depuis le mois dernier</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Utilisateurs Actifs</CardTitle>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">157</div>
            <p className="text-xs text-muted-foreground">+23% depuis le mois dernier</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Gestion des Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Ajoutez, modifiez ou supprimez des utilisateurs et gérez leurs rôles.</p>
            <Button onClick={() => navigate("/admin")} className="w-full">
              Accéder
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Rapports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Générez et téléchargez des rapports sur l'utilisation de l'application.</p>
            <Button onClick={() => navigate("/reports")} className="w-full">
              Accéder
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Paramètres</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Configurez les paramètres généraux de l'application et des utilisateurs.</p>
            <Button onClick={() => navigate("/settings")} className="w-full">
              Accéder
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminHome;
