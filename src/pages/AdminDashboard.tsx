
import { useState, useEffect, useCallback } from "react";
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
import FixRoleButton from "@/components/admin/users/FixRoleButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { role, isLoading: roleLoading, refreshRole } = useUserRole();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isKnownAdmin, setIsKnownAdmin] = useState(false);
  const [tablesAccessible, setTablesAccessible] = useState(false);

  console.log("AdminDashboard - Current user:", user?.id, "Email:", user?.email, "Role:", role, "Loading:", isLoading);

  useEffect(() => {
    // Vérifier si l'utilisateur est konointer@gmail.com
    if (user?.email === "konointer@gmail.com") {
      setIsKnownAdmin(true);
    }
  }, [user]);

  // Fonction séparée pour vérifier l'existence des tables
  const ensureTablesExist = useCallback(async () => {
    try {
      console.log("Checking required tables...");
      
      // Vérifier l'existence de la table modules
      const { error: modulesError } = await supabase
        .from('modules')
        .select('id')
        .limit(1);

      if (modulesError) {
        console.error("Erreur lors de la vérification de la table modules:", modulesError);
        return false;
      }

      // Vérifier l'existence de la table user_roles
      const { error: userRolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .limit(1);

      if (userRolesError) {
        console.error("Erreur lors de la vérification de la table user_roles:", userRolesError);
        return false;
      }

      // Vérifier l'existence de la table user_modules
      const { error: userModulesError } = await supabase
        .from('user_modules')
        .select('user_id, module_id')
        .limit(1);

      if (userModulesError) {
        console.error("Erreur lors de la vérification de la table user_modules:", userModulesError);
        return false;
      }
      
      console.log("All required tables exist and are accessible.");
      return true;
    } catch (error) {
      console.error("Error checking tables:", error);
      return false;
    }
  }, []);

  useEffect(() => {
    const checkAccess = async () => {
      setIsLoading(true);
      try {
        console.log("Checking database tables access...");
        // Vérifier si les tables requises existent
        const accessible = await ensureTablesExist();
        setTablesAccessible(accessible);
        
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
  }, [roleLoading, user, toast, ensureTablesExist]);

  // Actualiser le rôle manuellement
  const handleRefreshRole = async () => {
    await refreshRole();
  };

  // Show loading screen when role is still loading
  if (roleLoading) {
    console.log("Role still loading...");
    return <AdminDashboardLoader />;
  }

  // Si c'est un admin connu mais sans le bon rôle, proposer de réparer
  if (isKnownAdmin && role !== "super_admin") {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Problème de droits d'accès</AlertTitle>
            <AlertDescription>
              Votre compte devrait avoir accès au tableau de bord Super Admin, mais vos droits ne sont pas correctement configurés.
              <div className="mt-4 flex gap-4">
                <FixRoleButton />
                <button 
                  onClick={handleRefreshRole}
                  className="text-sm underline"
                >
                  Actualiser mon rôle
                </button>
              </div>
            </AlertDescription>
          </Alert>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Détails de diagnostic</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Rôle actuel:</strong> {role || 'Non défini'}</p>
              <p><strong>ID utilisateur:</strong> {user?.id}</p>
            </div>
          </div>
        </div>
      </Layout>
    );
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

  // Show error if tables are not accessible
  if (!tablesAccessible) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Problème d'accès aux données</AlertTitle>
            <AlertDescription>
              Impossible d'accéder aux tables nécessaires dans la base de données.
              <div className="mt-4">
                <button 
                  onClick={() => window.location.reload()}
                  className="text-sm underline"
                >
                  Rafraîchir la page
                </button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
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
