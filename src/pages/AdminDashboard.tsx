
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModuleManagement } from "@/components/admin/ModuleManagement";
import { UserManagement } from "@/components/admin/users/UserManagement";
import { SubscriptionManagement } from "@/components/admin/SubscriptionManagement";
import { AdminDashboardHeader } from "@/components/admin/AdminDashboardHeader";
import { AdminDashboardLoader } from "@/components/admin/AdminDashboardLoader";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/providers/AuthProvider";
import { Navigate, useSearchParams } from "react-router-dom";
import { ErrorMessage } from "@/components/admin/ErrorMessage";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import FixRoleButton from "@/components/admin/users/FixRoleButton";

const AdminDashboard = () => {
  const { role, isLoading: roleLoading, refreshRole, isSpecialAdmin } = useUserRole();
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    isLoading,
    tablesAccessible,
    retryCount,
    forceRefreshPermissions
  } = useAdminAccess();
  const [searchParams] = useSearchParams();
  const [isInitializing, setIsInitializing] = useState(false);
  const defaultTab = searchParams.get('tab') || 'modules';

  console.log("AdminDashboard - Current user:", user?.id, "Email:", user?.email, "Role:", role, "isSpecialAdmin:", isSpecialAdmin);

  // Fonction simplifiée pour initialiser les tables si nécessaire
  const initializeAdminAccess = async () => {
    if (!user || isInitializing) return;
    
    setIsInitializing(true);
    try {
      console.log("Tentative d'initialisation des tables administrateur...");
      
      // Essayer d'initialiser les modules par défaut
      const { error } = await supabase.rpc('create_default_modules' as any);
      
      if (error) {
        console.warn("Erreur lors de l'initialisation des modules:", error);
      } else {
        console.log("Initialisation des modules réussie");
        toast({
          title: "Initialisation réussie",
          description: "Les modules par défaut ont été créés."
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'initialisation:", error);
    } finally {
      setIsInitializing(false);
    }
  };

  // Tenter d'initialiser les tables au chargement
  useEffect(() => {
    if (user && (isSpecialAdmin || role === "super_admin")) {
      initializeAdminAccess();
    }
  }, [user, role, isSpecialAdmin]);

  // Afficher l'écran de chargement quand le rôle est en cours de chargement
  if (roleLoading) {
    console.log("Chargement du rôle en cours...");
    return <AdminDashboardLoader />;
  }

  // Pour l'admin spécial sans le bon rôle affiché, proposer de réparer
  if (isSpecialAdmin && role !== "super_admin") {
    return (
      <Layout>
        <ErrorMessage 
          title="Problème de droits d'accès"
          description="Votre compte devrait avoir accès au tableau de bord Super Admin, mais vos droits ne sont pas correctement configurés."
          showFixRole={true}
          onRefreshRole={refreshRole}
        />
        
        <div className="container mx-auto mt-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Détails de diagnostic</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Rôle actuel:</strong> {role || 'Non défini'}</p>
              <p><strong>ID utilisateur:</strong> {user?.id}</p>
            </div>
            
            <div className="mt-6">
              <FixRoleButton />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // L'admin spécial a toujours accès, même si son rôle n'est pas super_admin
  if (isSpecialAdmin) {
    console.log("Accès autorisé pour l'utilisateur spécial konointer@gmail.com");
    // Continue avec l'accès au tableau de bord
  } 
  // Sinon, vérification normale du rôle
  else if (!roleLoading && role !== "super_admin") {
    console.log("L'utilisateur n'est pas super_admin, redirection...");
    return <Navigate to="/dashboard" />;
  }

  // Écran de chargement pendant la vérification des tables
  if (isLoading) {
    console.log("Vérification de l'accès aux tables...");
    return <AdminDashboardLoader />;
  }

  // Afficher une erreur si les tables ne sont pas accessibles
  if (!tablesAccessible && !isSpecialAdmin) {
    return (
      <Layout>
        <ErrorMessage 
          title="Problème d'accès aux données"
          description="Impossible d'accéder aux tables nécessaires dans la base de données."
          onRefresh={forceRefreshPermissions}
          retryCount={retryCount}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <AdminDashboardHeader />
        
        <Tabs defaultValue={defaultTab} className="w-full">
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
