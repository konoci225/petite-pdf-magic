
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminStatisticsSectionProps {
  stats: {
    totalUsers: number;
    activeModules: number;
    premiumModules: number;
    activeSubscriptions: number;
  };
  loading: boolean;
}

export const AdminStatisticsSection = ({ stats, loading }: AdminStatisticsSectionProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? '...' : stats.totalUsers}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Modules Actifs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? '...' : stats.activeModules}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Modules Premium</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? '...' : stats.premiumModules}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Abonnements Actifs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? '...' : stats.activeSubscriptions}</div>
        </CardContent>
      </Card>
    </div>
  );
};
