
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Activity, BarChart2, CreditCard, Plus } from "lucide-react";

interface SubscriptionManagementSectionProps {
  stats: {
    activeSubscriptions: number;
  };
  loading: boolean;
}

export const SubscriptionManagementSection = ({ stats, loading }: SubscriptionManagementSectionProps) => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Gestion des Abonnements</CardTitle>
            <CardDescription>
              Gérez les abonnements des membres, suivez les paiements effectués, gérez les exemptions, et créez des rapports financiers détaillés.
            </CardDescription>
          </div>
          <CreditCard className="h-6 w-6 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <Button size="sm" onClick={() => navigate("/admin")} className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter un abonnement
          </Button>
          <Button size="sm" onClick={() => navigate("/reports")} variant="outline" className="gap-2">
            <BarChart2 className="h-4 w-4" />
            Générer un rapport
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Abonnements actifs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.activeSubscriptions}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Paiements en retard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-50 border-red-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Alerte</CardTitle>
                <Activity className="h-4 w-4 text-red-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-red-700">0 exemptions expirent cette semaine</div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="secondary" className="w-full" onClick={() => navigate("/admin")}>
          Gérer tous les abonnements
        </Button>
      </CardFooter>
    </Card>
  );
};
