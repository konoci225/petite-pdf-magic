
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { AdminStatisticsSection } from "./admin/AdminStatisticsSection";
import { ModuleManagementSection } from "./admin/ModuleManagementSection";
import { UserManagementSection } from "./admin/UserManagementSection";
import { SubscriptionManagementSection } from "./admin/SubscriptionManagementSection";
import { AdminQuickActions } from "./admin/AdminQuickActions";
import { useReportData } from "@/hooks/useReportData";

const SuperAdminHome = () => {
  // Use the report data hook instead of direct fetching
  const { stats, isLoading, error } = useReportData();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord administrateur</h1>
          <p className="text-gray-600">Gérez les modules, utilisateurs et abonnements de votre application.</p>
        </div>
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1">
          Super Admin
        </Badge>
      </div>

      <AdminStatisticsSection stats={stats} loading={isLoading} />
      
      <ModuleManagementSection stats={stats} loading={isLoading} />
      
      <UserManagementSection stats={stats} loading={isLoading} />
      
      <SubscriptionManagementSection stats={stats} loading={isLoading} />

      <AdminQuickActions />
    </div>
  );
};

export default SuperAdminHome;
