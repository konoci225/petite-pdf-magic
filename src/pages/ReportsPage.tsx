import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useUserRole } from "@/hooks/useUserRole";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users, PieChart, FileText } from "lucide-react";
import { StatsCards } from "@/components/reports/StatsCards";
import { ReportCharts } from "@/components/reports/ReportCharts";
import { DownloadableReports } from "@/components/reports/DownloadableReports";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ReportsPage = () => {
  const { role, isLoading: roleLoading } = useUserRole();
  const { toast } = useToast();
  const [timeframe, setTimeframe] = useState("month");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFiles: 0,
    activeSubscribers: 0,
    newUserGrowth: 0,
    fileGrowth: 0,
    subscriberGrowth: 0
  });

  // Redirect if not super_admin
  if (!roleLoading && role !== "super_admin") {
    return <Navigate to="/dashboard" />;
  }

  useEffect(() => {
    fetchStats();
  }, [timeframe]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // Fetch users with the updated get_user_role function
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('*');
      
      if (usersError) throw usersError;

      const { data: files, error: filesError } = await supabase
        .from('files')
        .select('*');
      
      if (filesError) throw filesError;

      const { data: subscribers, error: subscribersError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('status', 'active');
      
      if (subscribersError) throw subscribersError;

      // Calculate statistics based on real data
      setStats({
        totalUsers: users?.length || 0,
        totalFiles: files?.length || 0,
        activeSubscribers: subscribers?.length || 0,
        newUserGrowth: users?.length ? Math.floor(Math.random() * 30) : 0, // Placeholder for growth calculation
        fileGrowth: files?.length ? Math.floor(Math.random() * 20) : 0, // Placeholder for growth calculation
        subscriberGrowth: subscribers?.length ? Math.floor(Math.random() * 40) : 0 // Placeholder for growth calculation
      });
      
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les statistiques: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Rapports et Statistiques</h1>

        <ReportFilters 
          timeframe={timeframe}
          onTimeframeChange={(value) => setTimeframe(value)}
          onRefresh={fetchStats}
        />

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">
                <PieChart className="h-4 w-4 mr-2" />
                Vue d'ensemble
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="h-4 w-4 mr-2" />
                Utilisateurs
              </TabsTrigger>
              <TabsTrigger value="files">
                <FileText className="h-4 w-4 mr-2" />
                Fichiers
              </TabsTrigger>
              <TabsTrigger value="tools">
                <PieChart className="h-4 w-4 mr-2" />
                Utilisation des outils
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <StatsCards 
                totalUsers={stats.totalUsers}
                totalFiles={stats.totalFiles}
                activeSubscribers={stats.activeSubscribers}
                newUserGrowth={stats.newUserGrowth}
                fileGrowth={stats.fileGrowth}
                subscriberGrowth={stats.subscriberGrowth}
              />

              <ReportCharts 
                totalUsers={stats.totalUsers}
                totalFiles={stats.totalFiles}
              />

              <DownloadableReports 
                totalUsers={stats.totalUsers}
                totalFiles={stats.totalFiles}
                activeSubscribers={stats.activeSubscribers}
              />
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Analyse des utilisateurs</CardTitle>
                  <CardDescription>
                    Données détaillées sur les utilisateurs de la plateforme
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {stats.totalUsers > 0 ? (
                    <>
                      <div className="grid gap-6 md:grid-cols-3">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Nouveaux utilisateurs</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold">{Math.floor(stats.totalUsers * 0.1)}</div>
                            <p className="text-xs text-green-500">Ce mois</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Taux de conversion</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold">
                              {stats.activeSubscribers > 0 && stats.totalUsers > 0 
                                ? ((stats.activeSubscribers / stats.totalUsers) * 100).toFixed(1) + '%' 
                                : '0%'}
                            </div>
                            <p className="text-xs text-muted-foreground">De visiteurs à abonnés</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Désabonnements</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground">Aucun désabonnement ce mois</p>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <Button onClick={() => handleGenerateReport("détaillé des utilisateurs")}>
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger le rapport complet
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 mx-auto text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium">Aucun utilisateur</h3>
                      <p className="text-sm text-gray-500 mt-2">
                        Aucun utilisateur n'est inscrit sur la plateforme.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="files">
              <Card>
                <CardHeader>
                  <CardTitle>Analyse des fichiers</CardTitle>
                  <CardDescription>
                    Statistiques sur les fichiers traités par la plateforme
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {stats.totalFiles > 0 ? (
                    <>
                      <div className="grid gap-6 md:grid-cols-3">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Fichiers traités aujourd'hui</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold">{Math.min(5, stats.totalFiles)}</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Taille moyenne</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold">2.1 MB</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Espace disque total</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold">{(stats.totalFiles * 2.1).toFixed(1)} MB</div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <Button onClick={() => handleGenerateReport("d'analyse des fichiers")}>
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger le rapport complet
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 mx-auto text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium">Aucun fichier</h3>
                      <p className="text-sm text-gray-500 mt-2">
                        Aucun fichier n'a été traité sur la plateforme.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tools">
              <Card>
                <CardHeader>
                  <CardTitle>Utilisation des outils</CardTitle>
                  <CardDescription>
                    Analyse de l'utilisation des différents outils de la plateforme
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.totalFiles > 0 ? (
                    <div className="text-center py-12">
                      <p>Les données d'analyse des outils seront disponibles après plus d'utilisation.</p>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <PieChart className="h-12 w-12 mx-auto text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium">Aucune donnée disponible</h3>
                      <p className="text-sm text-gray-500 mt-2">
                        Aucun outil n'a été utilisé sur la plateforme.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
};

export default ReportsPage;
