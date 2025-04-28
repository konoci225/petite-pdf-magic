
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, Activity, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const SuperAdminHome = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFiles: 0,
    activeUsers: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // Fetch user stats
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('*');
      
      if (usersError) throw usersError;

      // Fetch file stats
      const { data: files, error: filesError } = await supabase
        .from('files')
        .select('*');
      
      if (filesError) throw filesError;

      // Calculate active users (users with files in the last 30 days)
      const activeUsersSet = new Set();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      files?.forEach(file => {
        const fileDate = new Date(file.created_at);
        if (fileDate >= thirtyDaysAgo) {
          activeUsersSet.add(file.user_id);
        }
      });

      setStats({
        totalUsers: users?.length || 0,
        totalFiles: files?.length || 0,
        activeUsers: activeUsersSet.size
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Utilisateurs enregistrés</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Fichiers Traités</CardTitle>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalFiles}</div>
            <p className="text-xs text-muted-foreground">Fichiers sur la plateforme</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Utilisateurs Actifs</CardTitle>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Actifs ces 30 derniers jours</p>
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
            <CardTitle>Fichiers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Gérez tous les fichiers téléchargés par les utilisateurs.</p>
            <Button onClick={() => navigate("/files")} className="w-full">
              Accéder
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminHome;
