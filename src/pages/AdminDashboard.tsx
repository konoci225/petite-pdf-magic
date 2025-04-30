
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModuleManagement } from "@/components/admin/ModuleManagement";
import { UserManagement } from "@/components/admin/users/UserManagement";
import { SubscriptionManagement } from "@/components/admin/SubscriptionManagement";
import { AdminDashboardHeader } from "@/components/admin/AdminDashboardHeader";
import { AdminDashboardLoader } from "@/components/admin/AdminDashboardLoader";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/providers/AuthProvider";
import { Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { role, isLoading: roleLoading } = useUserRole();
  const { user } = useAuth();
  const { toast } = useToast();

  console.log("AdminDashboard - Current user:", user?.id, "Role:", role, "Loading:", isLoading);

  useEffect(() => {
    const checkAccess = async () => {
      setIsLoading(true);
      try {
        console.log("Checking database tables access...");
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
    
    if (!roleLoading && user) {
      console.log("Role loading completed, checking access...");
      checkAccess();
    }
  }, [roleLoading, user, toast]);

  // Fonction pour s'assurer que les tables nécessaires existent
  const ensureTablesExist = async () => {
    try {
      console.log("Checking required tables...");
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
      
      console.log("All required tables exist and are accessible.");
    } catch (error) {
      console.error("Error checking tables:", error);
      throw error;
    }
  };

  // Show loading screen when role is still loading
  if (roleLoading) {
    console.log("Role still loading...");
    return <AdminDashboardLoader />;
  }

  // Redirect if not super_admin
  if (!roleLoading && role !== "super_admin") {
    console.log("User is not super_admin, redirecting...");
    toast({
      title: "Accès refusé",
      description: "Vous n'avez pas les permissions d'administrateur",
      variant: "destructive"
    });
    return <Navigate to="/dashboard" />;
  }

  // Show loading screen while checking tables
  if (isLoading) {
    console.log("Checking table access...");
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
