
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useUserRole } from "@/hooks/useUserRole";
import { Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

import { StatsCards } from "@/components/reports/StatsCards";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { ReportTabs } from "@/components/reports/ReportTabs";
import { useReportData } from "@/hooks/useReportData";

const ReportsPage = () => {
  const { role, isLoading: roleLoading } = useUserRole();
  const { toast } = useToast();
  const [generatingReport, setGeneratingReport] = useState(false);
  const {
    stats,
    isLoading,
    error,
    timeframe,
    setTimeframe,
    fetchStats
  } = useReportData();

  // Redirect if not super_admin
  if (!roleLoading && role !== "super_admin") {
    return <Navigate to="/dashboard" />;
  }

  // Générer un rapport
  const handleGenerateReport = (reportType: string) => {
    setGeneratingReport(true);
    
    // Dans une implémentation réelle, ceci générerait et téléchargerait un rapport
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

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Erreur de récupération des données</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" onClick={fetchStats}>
                <RefreshCw className="h-4 w-4 mr-2" /> Réessayer
              </Button>
            </AlertDescription>
          </Alert>
        )}

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
          <ReportTabs 
            stats={stats} 
            onGenerateReport={handleGenerateReport} 
          />
        )}
      </div>
    </Layout>
  );
};

export default ReportsPage;
