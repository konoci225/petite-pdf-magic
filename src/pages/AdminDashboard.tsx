
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
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { role, isLoading: roleLoading, refreshRole } = useUserRole();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isKnownAdmin, setIsKnownAdmin] = useState(false);
  const [tablesAccessible, setTablesAccessible] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  console.log("AdminDashboard - Current user:", user?.id, "Email:", user?.email, "Role:", role, "Loading:", isLoading);

  // Vérification spéciale pour konointer@gmail.com - toujours admin
  const isSpecialAdmin = user?.email === "konointer@gmail.com";

  useEffect(() => {
    // Vérifier si l'utilisateur est konointer@gmail.com
    if (isSpecialAdmin) {
      setIsKnownAdmin(true);
    }
  }, [user, isSpecialAdmin]);

  // Fonction séparée pour vérifier l'existence des tables
  const ensureTablesExist = useCallback(async () => {
    try {
      console.log("Vérification des tables requises...");
      
      // Essayer de récupérer des données de test via la vue
      const { error: viewError } = await supabase
        .from('admin_dashboard_stats')
        .select('*')
        .maybeSingle();
        
      if (!viewError) {
        console.log("La vue admin est accessible");
        return true;
      }
      
      console.log("Vue non accessible, vérification des tables individuellement");
      
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
      
      console.log("Toutes les tables requises existent et sont accessibles.");
      return true;
    } catch (error) {
      console.error("Erreur lors de la vérification des tables:", error);
      return false;
    }
  }, []);

  // Actualisation forcée des autorisations
  const forceRefreshPermissions = async () => {
    setIsLoading(true);
    try {
      // Actualiser la session pour obtenir les dernières autorisations
      console.log("Actualisation forcée des autorisations...");
      
      if (isSpecialAdmin) {
        // Tentative d'attribution directe du rôle super_admin
        const { error: rpcError } = await supabase.rpc(
          'force_set_super_admin_role',
          { target_user_id: user?.id }
        );
        
        if (rpcError) {
          console.error("Erreur lors de l'attribution forcée du rôle:", rpcError);
          
          // Tentative alternative
          const { error: upsertError } = await supabase
            .from("user_roles")
            .upsert({ 
              user_id: user?.id,
              role: "super_admin" 
            }, { onConflict: "user_id" });
            
          if (upsertError) {
            console.error("Erreur lors de l'upsert direct:", upsertError);
          }
        }
      }
      
      // Actualiser le rôle
      await refreshRole();
      
      // Vérifier de nouveau l'accès aux tables
      const accessible = await ensureTablesExist();
      setTablesAccessible(accessible);
      
      if (accessible) {
        toast({
          title: "Accès restauré",
          description: "L'accès aux données a été restauré avec succès.",
        });
      }
      
      setRetryCount(prev => prev + 1);
    } catch (error) {
      console.error("Erreur lors de l'actualisation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkAccess = async () => {
      setIsLoading(true);
      try {
        console.log("Vérification de l'accès aux tables de la base de données...");
        // Vérifier si les tables requises existent
        const accessible = await ensureTablesExist();
        setTablesAccessible(accessible);
        
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
      console.log("Chargement du rôle terminé, vérification de l'accès...");
      checkAccess();
    }
  }, [roleLoading, user, toast, ensureTablesExist]);

  // Actualiser le rôle manuellement
  const handleRefreshRole = async () => {
    await refreshRole();
  };

  // Show loading screen when role is still loading
  if (roleLoading) {
    console.log("Chargement du rôle en cours...");
    return <AdminDashboardLoader />;
  }

  // Si c'est l'admin spécial mais sans le bon rôle affiché, proposer de réparer
  if (isSpecialAdmin && role !== "super_admin") {
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

  // Si c'est l'admin spécial konointer@gmail.com, autoriser l'accès même si le rôle n'est pas super_admin
  if (isSpecialAdmin) {
    console.log("Accès autorisé pour l'utilisateur spécial konointer@gmail.com");
    // Continue avec l'accès au tableau de bord
  } 
  // Sinon, vérifier le rôle normalement
  else if (!roleLoading && role !== "super_admin") {
    console.log("L'utilisateur n'est pas super_admin, redirection...");
    toast({
      title: "Accès refusé",
      description: "Vous n'avez pas les permissions d'administrateur",
      variant: "destructive"
    });
    return <Navigate to="/dashboard" />;
  }

  // Show loading screen while checking tables
  if (isLoading) {
    console.log("Vérification de l'accès aux tables...");
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
              <p>Impossible d'accéder aux tables nécessaires dans la base de données.</p>
              <div className="mt-4 flex gap-2">
                <Button 
                  onClick={forceRefreshPermissions}
                  className="flex items-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réparer les autorisations
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Rafraîchir la page
                </Button>
              </div>
            </AlertDescription>
          </Alert>
          
          {retryCount > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800">
                Tentative de réparation #{retryCount} - Si le problème persiste après plusieurs tentatives, 
                veuillez vérifier les politiques d'accès dans votre base de données Supabase.
              </p>
            </div>
          )}
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
