
import React from "react";
import { BarChart } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ReportChartsProps {
  totalUsers: number;
  totalFiles: number;
}

export const ReportCharts = ({ totalUsers, totalFiles }: ReportChartsProps) => {
  return (
    <div className="grid gap-6 mt-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Évolution des utilisateurs</CardTitle>
          <CardDescription>Croissance des utilisateurs au fil du temps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex flex-col items-center justify-center bg-slate-50 rounded-md">
            {totalUsers > 0 ? (
              <div className="text-center">
                <BarChart className="h-16 w-16 mx-auto text-slate-300 mb-2" />
                <p>Données disponibles pour {totalUsers} utilisateurs</p>
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
            {totalFiles > 0 ? (
              <div className="text-center">
                <BarChart className="h-16 w-16 mx-auto text-slate-300 mb-2" />
                <p>Données disponibles pour {totalFiles} fichiers</p>
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
  );
};
