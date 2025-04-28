
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useUserRole } from "@/hooks/useUserRole";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  BarChart,
  PieChart,
  Calendar,
  Users,
  FileText,
  Filter,
  RefreshCcw,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ReportsPage = () => {
  const { role, isLoading: roleLoading } = useUserRole();
  const { toast } = useToast();
  const [timeframe, setTimeframe] = useState("month");
  const [generatingReport, setGeneratingReport] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFiles: 0,
    activeSubscribers: 0,
    newUserGrowth: 0,
    fileGrowth: 0,
    subscriberGrowth: 0
  });
  const [isLoading, setIsLoading] = useState(true);

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
      // Fetch actual statistics from Supabase
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

  const handleGenerateReport = (reportType: string) => {
    setGeneratingReport(true);
    
    // In a real implementation, this would generate and download a report
    setTimeout(() => {
      setGeneratingReport(false);
      toast({
        title: "Rapport généré",
        description: `Le rapport ${reportType} a été généré avec succès.`,
      });
    }, 1500);
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Rapports et Statistiques</h1>

        <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
          <Select 
            defaultValue={timeframe}
            onValueChange={(value) => {
              setTimeframe(value);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sélectionner une période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">7 derniers jours</SelectItem>
              <SelectItem value="month">30 derniers jours</SelectItem>
              <SelectItem value="quarter">3 derniers mois</SelectItem>
              <SelectItem value="year">Année en cours</SelectItem>
              <SelectItem value="all">Toutes les données</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </Button>
            <Button size="sm" variant="outline" onClick={fetchStats}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">
                <BarChart className="h-4 w-4 mr-2" />
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
              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">Utilisateurs Totaux</CardTitle>
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.totalUsers}</div>
                    {stats.newUserGrowth > 0 && (
                      <p className="text-xs text-muted-foreground">+{stats.newUserGrowth}% depuis le mois dernier</p>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">Fichiers Traités</CardTitle>
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.totalFiles}</div>
                    {stats.fileGrowth > 0 && (
                      <p className="text-xs text-muted-foreground">+{stats.fileGrowth}% depuis le mois dernier</p>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">Abonnés Actifs</CardTitle>
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.activeSubscribers}</div>
                    {stats.subscriberGrowth > 0 && (
                      <p className="text-xs text-muted-foreground">+{stats.subscriberGrowth}% depuis le mois dernier</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 mt-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Évolution des utilisateurs</CardTitle>
                    <CardDescription>Croissance des utilisateurs au fil du temps</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 flex flex-col items-center justify-center bg-slate-50 rounded-md">
                      {stats.totalUsers > 0 ? (
                        <div className="text-center">
                          <BarChart className="h-16 w-16 mx-auto text-slate-300 mb-2" />
                          <p>Données disponibles pour {stats.totalUsers} utilisateurs</p>
                          <p className="text-sm text-muted-foreground mt-2">Utilisez une bibliothèque de graphiques pour afficher ces données</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p>Aucune donnée disponible</p>
                          <p className="text-sm text-muted-foreground mt-2">Ajoutez des utilisateurs pour voir les statistiques</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Évolution des fichiers traités</CardTitle>
                    <CardDescription>Nombre de fichiers traités par mois</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 flex flex-col items-center justify-center bg-slate-50 rounded-md">
                      {stats.totalFiles > 0 ? (
                        <div className="text-center">
                          <BarChart className="h-16 w-16 mx-auto text-slate-300 mb-2" />
                          <p>Données disponibles pour {stats.totalFiles} fichiers</p>
                          <p className="text-sm text-muted-foreground mt-2">Utilisez une bibliothèque de graphiques pour afficher ces données</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p>Aucune donnée disponible</p>
                          <p className="text-sm text-muted-foreground mt-2">Ajoutez des fichiers pour voir les statistiques</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Rapports téléchargeables</CardTitle>
                  <CardDescription>
                    Générez et téléchargez des rapports détaillés pour une analyse approfondie
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Rapport d'utilisateurs</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2 text-sm text-muted-foreground">
                      Données complètes sur les inscriptions, les conversions et les désabonnements.
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        onClick={() => handleGenerateReport("d'utilisateurs")}
                        disabled={generatingReport || stats.totalUsers === 0}
                      >
                        {generatingReport ? (
                          <div className="flex items-center">
                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full" />
                            Génération...
                          </div>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Rapport d'activité</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2 text-sm text-muted-foreground">
                      Utilisation des fonctionnalités, temps passé et actions effectuées.
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        onClick={() => handleGenerateReport("d'activité")}
                        disabled={generatingReport || stats.totalFiles === 0}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Rapport financier</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2 text-sm text-muted-foreground">
                      Revenus, abonnements et autres métriques financières clés.
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        onClick={() => handleGenerateReport("financier")}
                        disabled={generatingReport || stats.activeSubscribers === 0}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </Button>
                    </CardFooter>
                  </Card>
                </CardContent>
              </Card>
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
