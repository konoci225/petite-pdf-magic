
import React from "react";
import { Users, FileText, Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StatsCardsProps {
  totalUsers: number;
  totalFiles: number;
  activeSubscribers: number;
  newUserGrowth: number;
  fileGrowth: number;
  subscriberGrowth: number;
}

export const StatsCards = ({
  totalUsers,
  totalFiles,
  activeSubscribers,
  newUserGrowth,
  fileGrowth,
  subscriberGrowth
}: StatsCardsProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Utilisateurs Totaux</CardTitle>
          <Users className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalUsers}</div>
          {newUserGrowth > 0 && (
            <p className="text-xs text-muted-foreground">+{newUserGrowth}% depuis le mois dernier</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Fichiers Traités</CardTitle>
          <FileText className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalFiles}</div>
          {fileGrowth > 0 && (
            <p className="text-xs text-muted-foreground">+{fileGrowth}% depuis le mois dernier</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Abonnés Actifs</CardTitle>
          <Calendar className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{activeSubscribers}</div>
          {subscriberGrowth > 0 && (
            <p className="text-xs text-muted-foreground">+{subscriberGrowth}% depuis le mois dernier</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
