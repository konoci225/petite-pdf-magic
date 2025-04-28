
import React, { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface DownloadableReportsProps {
  totalUsers: number;
  totalFiles: number;
  activeSubscribers: number;
}

export const DownloadableReports = ({ totalUsers, totalFiles, activeSubscribers }: DownloadableReportsProps) => {
  const [generatingReport, setGeneratingReport] = useState(false);
  const { toast } = useToast();

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
              disabled={generatingReport || totalUsers === 0}
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
              disabled={generatingReport || totalFiles === 0}
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
              disabled={generatingReport || activeSubscribers === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
          </CardFooter>
        </Card>
      </CardContent>
    </Card>
  );
};
