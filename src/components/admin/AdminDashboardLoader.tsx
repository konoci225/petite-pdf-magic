
import React from 'react';
import Layout from "@/components/layout/Layout";
import { Loader2 } from "lucide-react";

export const AdminDashboardLoader = () => {
  return (
    <Layout>
      <div className="container mx-auto py-8 flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </Layout>
  );
};
