
import React from "react";
import { Badge } from "@/components/ui/badge";

export const AdminDashboardHeader = () => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord administrateur</h1>
        <p className="text-gray-600">Gérez les modules, utilisateurs et abonnements de votre application.</p>
      </div>
      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1">
        Super Admin
      </Badge>
    </div>
  );
};
