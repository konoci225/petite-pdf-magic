
import React from "react";
import Layout from "@/components/layout/Layout";
import { Loader2 } from "lucide-react";

export const AdminDashboardLoader = () => {
  return (
    <Layout>
      <div className="container mx-auto py-20">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">
            Chargement du tableau de bord administrateur...
          </p>
        </div>
      </div>
    </Layout>
  );
};
