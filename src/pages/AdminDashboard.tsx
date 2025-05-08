
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
import { AlertCircle, ShieldCheck, Info } from "lucide-react";

// Storage key for forced admin mode
const FORCED_ADMIN_MODE_KEY = 'app_forced_admin_mode';

const AdminDashboard = () => {
  const { role, isLoading: roleLoading, refreshRole, isSpecialAdmin, diagnosticRole } = useUserRole();
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
  const [forcedAdminMode, setForcedAdminMode] = useState(() => {
    // Check URL parameter first
    const urlParam = searchParams.get('forceAdmin');
    if (urlParam === 'true') {
      localStorage.setItem(FORCED_ADMIN_MODE_KEY, 'true');
      return true;
    }
    // Then check localStorage
    return localStorage.getItem(FORCED_ADMIN_MODE_KEY) === 'true';
  });
  const [diagnosticData, setDiagnosticData] = useState<any>(null);
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const defaultTab = searchParams.get('tab') || 'modules';
  
  // Détection explicite de l'email spécial pour le contournement
  const isKonointer = user?.email === "konointer@gmail.com";

  console.log("AdminDashboard - Current user:", user?.id, "Email:", user?.email, "Role:", role, "isSpecialAdmin:", isSpecialAdmin);
  console.log("tablesAccessible:", tablesAccessible, "isSpecialAdminAccess:", isSpecialAdminAccess, "forcedAdminMode:", forcedAdminMode);

  // Fonction pour activer le mode admin forcé pour konointer@gmail.com
  const enableForcedAdminMode = () => {
    if (isKonointer) {
      localStorage.setItem(FORCED_ADMIN_MODE_KEY, 'true');
      setForcedAdminMode(true);
      toast({
        title: "Mode administration forcé activé",
        description: "Contournement des vérifications de sécurité pour l'administrateur spécial.",
      });
      
      // Attendez un court instant avant de rafraîchir
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };
  
  // Fonction pour désactiver le mode admin forcé
  const disableForcedAdminMode = () => {
    localStorage.removeItem(FORCED_ADMIN_MODE_KEY);
    setForcedAdminMode(false);
    toast({
      title: "Mode administration forcé désactivé",
      description: "Retour au mode de vérification normal.",
    });
    
    // Force refresh
    window.location.reload();
  };

  const runAdminDiagnostic = async () => {
    if (isKonointer) {
      try {
        const data = await diagnosticRole();
        setDiagnosticData(data);
        setIsDiagnosticOpen(true);
      } catch (error) {
        console.error("Erreur de diagnostic:", error);
      }
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

  // Check for forceAdmin param and update localStorage 
  useEffect(() => {
    const forceParam = searchParams.get('forceAdmin');
    if (forceParam === 'true' && isKonointer) {
      localStorage.setItem(FORCED_ADMIN_MODE_KEY, 'true');
      setForcedAdminMode(true);
    }
  }, [searchParams, isKonointer]);

  // Attempt to repair admin role using edge function on component mount
  useEffect(() => {
    const repairAdminRole = async () => {
      if (isKonointer && role !== "super_admin") {
        console.log("Réparation automatique du rôle via Edge Function...");
        
        try {
          const { data, error } = await supabase.functions.invoke("set-admin-role", {
            body: { 
              email: user?.email,
              userId: user?.id,
              forceRepair: true
            }
          });
          
          console.log("Réponse de la fonction Edge pour réparation:", data);
          
          if (data?.success) {
            await refreshRole();
            toast({
              title: "Rôle réparé",
              description: "Le rôle d'administrateur a été attribué avec succès.",
            });
          }
        } catch (error) {
          console.error("Erreur lors de la réparation automatique:", error);
        }
      }
    };
    
    repairAdminRole();
  }, [isKonointer, role, user, refreshRole]);

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
          <div className="bg-white shadow-lg rounded-lg p-6 mb-8 border-l-4 border-amber-500">
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
                <FixRoleButton size="lg" />
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
                  size="lg"
                  className="bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                >
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Activer le mode administration forcé
                </Button>
              </div>
              
              <div className="border-t pt-4 flex justify-between">
                <div>
                  <h3 className="font-medium mb-2">Détails de diagnostic</h3>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>Rôle actuel:</strong> {role || 'Non défini'}</p>
                    <p><strong>ID utilisateur:</strong> {user?.id}</p>
                    <p><strong>Accès aux tables:</strong> {tablesAccessible ? 'Oui' : 'Non'}</p>
                    <p><strong>Est admin spécial:</strong> {isSpecialAdmin ? 'Oui' : 'Non'}</p>
                  </div>
                </div>
                
                <Button
                  onClick={runAdminDiagnostic}
                  variant="ghost"
                  size="sm"
                  className="h-8 mt-2 text-blue-600"
                >
                  <Info className="h-4 w-4 mr-1" />
                  Diagnostic avancé
                </Button>
              </div>
              
              {isDiagnosticOpen && diagnosticData && (
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Info className="h-4 w-4 mr-1" />
                    Rapport de diagnostic complet
                  </h3>
                  <div className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-60">
                    <pre className="whitespace-pre-wrap break-words">{JSON.stringify(diagnosticData, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Mode administrateur forcé pour konointer@gmail.com
  const hasAdminAccess = forcedAdminMode || isSpecialAdmin || isSpecialAdminAccess || role === "super_admin";
  
  // Si l'utilisateur n'a pas d'accès administrateur, redirection
  if (!hasAdminAccess) {
    console.log("L'utilisateur n'a pas d'accès administrateur, redirection...");
    return <Navigate to="/dashboard" />;
  }

  // Écran de chargement pendant la vérification des tables
  if (!forcedAdminMode && isLoading) {
    console.log("Vérification de l'accès aux tables...");
    return <AdminDashboardLoader />;
  }

  // Afficher une erreur si les tables ne sont pas accessibles (sauf en mode forcé ou admin spécial)
  if (!forcedAdminMode && !tablesAccessible && !isSpecialAdmin && !isSpecialAdminAccess) {
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
        
        {forcedAdminMode && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-md p-4 flex justify-between items-center">
            <div>
              <h3 className="font-medium text-amber-800">Mode administration forcé actif</h3>
              <p className="text-sm text-amber-700">Les vérifications de sécurité sont contournées pour l'accès administrateur.</p>
            </div>
            <Button 
              onClick={disableForcedAdminMode}
              variant="outline"
              size="sm"
              className="border-amber-300 text-amber-800 hover:bg-amber-100"
            >
              Désactiver le mode forcé
            </Button>
          </div>
        )}
        
        {isKonointer && (
          <div className="flex justify-end mb-4 gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={runAdminDiagnostic}
              className="text-blue-600 text-xs"
            >
              <Info className="h-3.5 w-3.5 mr-1" />
              Diagnostic système
            </Button>
          </div>
        )}
        
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
        
        {isDiagnosticOpen && diagnosticData && (
          <div className="mt-8 border rounded-lg p-4 bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Rapport de diagnostic</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsDiagnosticOpen(false)}>Fermer</Button>
            </div>
            <div className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-96">
              <pre className="whitespace-pre-wrap break-words">{JSON.stringify(diagnosticData, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
