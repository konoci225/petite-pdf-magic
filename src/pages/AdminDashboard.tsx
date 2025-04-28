
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModuleManagement } from "@/components/admin/ModuleManagement";
import { UserManagement } from "@/components/admin/UserManagement";
import { Loader2 } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { Navigate } from "react-router-dom";

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { role, isLoading: roleLoading } = useUserRole();

  useEffect(() => {
    const checkAccess = async () => {
      setIsLoading(true);
      try {
        // In a real app, you might check more detailed permissions here
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error("Error checking admin access:", error);
        setIsLoading(false);
      }
    };
    
    if (!roleLoading) {
      checkAccess();
    }
  }, [roleLoading]);

  // Redirect if not super_admin
  if (!roleLoading && role !== "super_admin") {
    return <Navigate to="/dashboard" />;
  }

  if (isLoading || roleLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Tableau de bord administrateur</h1>
        
        <Tabs defaultValue="modules" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="modules">Gestion des modules</TabsTrigger>
            <TabsTrigger value="users">Gestion des utilisateurs</TabsTrigger>
            <TabsTrigger value="subscriptions">Gestion des abonnements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="modules">
            <ModuleManagement />
          </TabsContent>
          
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="subscriptions">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Gestion des abonnements</h2>
              <p className="text-gray-500">Ajoutez, modifiez ou supprimez des abonnements utilisateur ici.</p>
              <p className="text-gray-500 mt-4">Fonctionnalité à implémenter.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
