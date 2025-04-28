
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useUserRole } from "@/hooks/useUserRole";
import { Navigate } from "react-router-dom";
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
  RefreshCcw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data for charts
const usersData = {
  labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
  datasets: [
    { 
      data: [120, 140, 170, 180, 220, 250],
      label: 'Nombre d\'utilisateurs',
    }
  ]
};

const filesData = {
  labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
  datasets: [
    {
      data: [450, 550, 780, 850, 1200, 1450],
      label: 'Fichiers traités',
    }
  ]
};

const usageByToolData = {
  labels: ['Fusion PDF', 'Division PDF', 'Compression', 'OCR', 'Signature', 'Autres'],
  datasets: [
    {
      data: [35, 25, 20, 10, 5, 5],
      label: 'Utilisation par outil (%)',
    }
  ]
};

const ReportsPage = () => {
  const { role, isLoading } = useUserRole();
  const { toast } = useToast();
  const [timeframe, setTimeframe] = useState("month");
  const [generatingReport, setGeneratingReport] = useState(false);

  // Redirect if not super_admin
  if (!isLoading && role !== "super_admin") {
    return <Navigate to="/dashboard" />;
  }

  const handleGenerateReport = (reportType: string) => {
    setGeneratingReport(true);
    
    // Simulate report generation
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
            onValueChange={setTimeframe}
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
            <Button size="sm" variant="outline">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>

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
                  <CardTitle className="text-lg font-medium">Abonnés Actifs</CardTitle>
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">157</div>
                  <p className="text-xs text-muted-foreground">+23% depuis le mois dernier</p>
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
                  {/* Placeholder for chart - in a real app, use a charting library */}
                  <div className="h-80 flex items-center justify-center bg-slate-100 rounded-md">
                    <BarChart className="h-16 w-16 text-slate-400" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Évolution des fichiers traités</CardTitle>
                  <CardDescription>Nombre de fichiers traités par mois</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Placeholder for chart - in a real app, use a charting library */}
                  <div className="h-80 flex items-center justify-center bg-slate-100 rounded-md">
                    <BarChart className="h-16 w-16 text-slate-400" />
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
                      disabled={generatingReport}
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
                      disabled={generatingReport}
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
                      disabled={generatingReport}
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
                <div className="grid gap-6 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Nouveaux utilisateurs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">34</div>
                      <p className="text-xs text-green-500">+15% ce mois</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Taux de conversion</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">8.7%</div>
                      <p className="text-xs text-green-500">+2.3% ce mois</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Désabonnements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">5</div>
                      <p className="text-xs text-red-500">+2 ce mois</p>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Répartition des utilisateurs par rôle</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Placeholder for chart */}
                    <div className="h-80 flex items-center justify-center bg-slate-100 rounded-md">
                      <PieChart className="h-16 w-16 text-slate-400" />
                    </div>
                  </CardContent>
                </Card>
                
                <Button onClick={() => handleGenerateReport("détaillé des utilisateurs")}>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger le rapport complet
                </Button>
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
                <div className="grid gap-6 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Fichiers traités aujourd'hui</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">47</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Taille moyenne</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">4.2 MB</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Espace disque total</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">12.7 GB</div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Évolution des fichiers traités</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Placeholder for chart */}
                    <div className="h-80 flex items-center justify-center bg-slate-100 rounded-md">
                      <BarChart className="h-16 w-16 text-slate-400" />
                    </div>
                  </CardContent>
                </Card>
                
                <Button onClick={() => handleGenerateReport("d'analyse des fichiers")}>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger le rapport complet
                </Button>
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
              <CardContent className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Répartition de l'utilisation par outil</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Placeholder for chart */}
                    <div className="h-80 flex items-center justify-center bg-slate-100 rounded-md">
                      <PieChart className="h-16 w-16 text-slate-400" />
                    </div>
                  </CardContent>
                </Card>
                
                <div className="border rounded-lg">
                  <div className="p-4 border-b">
                    <h3 className="text-lg font-medium">Top des outils utilisés</h3>
                  </div>
                  <div className="divide-y">
                    <div className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-medium">Fusion PDF</p>
                        <p className="text-sm text-muted-foreground">35% des utilisations totales</p>
                      </div>
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full w-[35%] bg-blue-500"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-medium">Division PDF</p>
                        <p className="text-sm text-muted-foreground">25% des utilisations totales</p>
                      </div>
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full w-[25%] bg-green-500"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-medium">Compression PDF</p>
                        <p className="text-sm text-muted-foreground">20% des utilisations totales</p>
                      </div>
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full w-[20%] bg-amber-500"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-medium">OCR PDF</p>
                        <p className="text-sm text-muted-foreground">10% des utilisations totales</p>
                      </div>
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full w-[10%] bg-purple-500"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button onClick={() => handleGenerateReport("d'utilisation des outils")}>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger le rapport complet
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ReportsPage;
