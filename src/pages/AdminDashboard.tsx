
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
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

const AdminDashboard = () => {
  const { role, isLoading: roleLoading, refreshRole, isSpecialAdmin } = useUserRole();
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    isLoading,
    tablesAccessible,
    retryCount,
    forceRefreshPermissions,
    isSpecialAdminAccess
  } = useAdminAccess();
  const [searchParams] = useSearchParams();
  const [isInitializing, setIsInitializing] = useState(false);
  const [forcedAdminMode, setForcedAdminMode] = useState(false);
  const defaultTab = searchParams.get('tab') || 'modules';
  
  // Détection explicite de l'email spécial pour le contournement
  const isKonointer = user?.email === "konointer@gmail.com";

  console.log("AdminDashboard - Current user:", user?.id, "Email:", user?.email, "Role:", role, "isSpecialAdmin:", isSpecialAdmin);
  console.log("tablesAccessible:", tablesAccessible, "isSpecialAdminAccess:", isSpecialAdminAccess);

  // Fonction pour activer le mode admin forcé pour konointer@gmail.com
  const enableForcedAdminMode = () => {
    if (isKonointer) {
      setForcedAdminMode(true);
      toast({
        title: "Mode administration forcé activé",
        description: "Contournement des vérifications de sécurité pour l'administrateur spécial.",
      });
    }
  };

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
    if (user && (isSpecialAdmin || role === "super_admin" || forcedAdminMode)) {
      initializeAdminAccess();
    }
  }, [user, role, isSpecialAdmin, forcedAdminMode]);

  // Afficher l'écran de chargement quand le rôle est en cours de chargement
  if (roleLoading) {
    console.log("Chargement du rôle en cours...");
    return <AdminDashboardLoader />;
  }

  // Contournement de secours: Si konointer@gmail.com mais sans accès admin
  if (isKonointer && role !== "super_admin" && !forcedAdminMode) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
            <div className="flex items-center mb-4 text-amber-600">
              <AlertCircle className="h-6 w-6 mr-2" />
              <h2 className="text-xl font-semibold">Problème de droits administrateur détecté</h2>
            </div>
            
            <p className="mb-4">
              Votre compte devrait avoir accès au tableau de bord Super Admin, mais vos droits ne sont pas correctement configurés.
              Vous pouvez essayer de réparer les autorisations ou utiliser le mode d'administration forcé.
            </p>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Option 1: Réparer les autorisations</h3>
                <FixRoleButton />
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Option 2: Mode administration forcé</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Ce mode contourne les vérifications de sécurité et vous donne accès au tableau de bord administrateur,
                  même si votre rôle n'est pas correctement configuré dans la base de données.
                </p>
                <Button 
                  onClick={enableForcedAdminMode} 
                  variant="outline"
                  className="bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                >
                  Activer le mode administration forcé
                </Button>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Détails de diagnostic</h3>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Rôle actuel:</strong> {role || 'Non défini'}</p>
                  <p><strong>ID utilisateur:</strong> {user?.id}</p>
                  <p><strong>Accès aux tables:</strong> {tablesAccessible ? 'Oui' : 'Non'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Mode administrateur forcé pour konointer@gmail.com
  if (forcedAdminMode && isKonointer) {
    console.log("Mode administrateur forcé activé pour konointer@gmail.com");
    // Continuer avec l'accès au tableau de bord
  }
  // L'admin spécial a toujours accès, même si son rôle n'est pas super_admin
  else if (isSpecialAdmin || isSpecialAdminAccess) {
    console.log("Accès autorisé pour l'utilisateur spécial ou avec accès spécial");
    // Continuer avec l'accès au tableau de bord
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

  // Afficher une erreur si les tables ne sont pas accessibles (sauf en mode forcé ou admin spécial)
  if (!tablesAccessible && !isSpecialAdmin && !isSpecialAdminAccess && !forcedAdminMode) {
    return (
      <Layout>
        <ErrorMessage 
          title="Problème d'accès aux données"
          description="Impossible d'accéder aux tables nécessaires dans la base de données."
          onRefresh={forceRefreshPermissions}
          retryCount={retryCount}
          showFixRole={isKonointer}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <AdminDashboardHeader isAdminForcedMode={forcedAdminMode} />
        
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
