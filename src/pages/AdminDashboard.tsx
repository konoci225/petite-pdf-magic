
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModuleManagement } from "@/components/admin/ModuleManagement";
import { UserManagement } from "@/components/admin/UserManagement";
import { SubscriptionManagement } from "@/components/admin/SubscriptionManagement";
import { AdminDashboardHeader } from "@/components/admin/AdminDashboardHeader";
import { AdminDashboardLoader } from "@/components/admin/AdminDashboardLoader";
import { useUserRole } from "@/hooks/useUserRole";
import { Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { role, isLoading: roleLoading } = useUserRole();
  const { toast } = useToast();

  useEffect(() => {
    const checkAccess = async () => {
      setIsLoading(true);
      try {
        // Vérifier si les tables requises existent
        await ensureTablesExist();
        
        // In a real app, you might check more detailed permissions here
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      } catch (error: any) {
        console.error("Error checking admin access:", error);
        toast({
          title: "Erreur",
          description: "Problème d'accès au tableau de bord administrateur: " + error.message,
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };
    
    if (!roleLoading) {
      checkAccess();
    }
  }, [roleLoading, toast]);

  // Fonction pour s'assurer que les tables nécessaires existent
  const ensureTablesExist = async () => {
    try {
      // Vérifier l'existence de la table modules
      const { error: modulesError } = await supabase
        .from('modules')
        .select('id')
        .limit(1);

      if (modulesError) {
        console.error("Erreur lors de la vérification de la table modules:", modulesError);
        throw new Error("La table modules est inaccessible");
      }

      // Vérifier l'existence de la table user_roles
      const { error: userRolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .limit(1);

      if (userRolesError) {
        console.error("Erreur lors de la vérification de la table user_roles:", userRolesError);
        throw new Error("La table user_roles est inaccessible");
      }

      // Vérifier l'existence de la table user_modules
      const { error: userModulesError } = await supabase
        .from('user_modules')
        .select('user_id, module_id')
        .limit(1);

      if (userModulesError) {
        console.error("Erreur lors de la vérification de la table user_modules:", userModulesError);
        throw new Error("La table user_modules est inaccessible");
      }
    } catch (error) {
      console.error("Error checking tables:", error);
      throw error;
    }
  };

  // Redirect if not super_admin
  if (!roleLoading && role !== "super_admin") {
    return <Navigate to="/dashboard" />;
  }

  if (isLoading || roleLoading) {
    return <AdminDashboardLoader />;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <AdminDashboardHeader />
        
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
            <SubscriptionManagement />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
