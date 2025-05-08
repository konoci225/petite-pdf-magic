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
import { AlertCircle, ShieldCheck, Info, RefreshCw, Loader2 } from "lucide-react";

// Storage key for forced admin mode
const FORCED_ADMIN_MODE_KEY = 'app_forced_admin_mode';
const SPECIAL_ADMIN_EMAIL = 'konointer@gmail.com';

const AdminDashboard = () => {
  const { role, isLoading: roleLoading, refreshRole, isSpecialAdmin, diagnosticRole, enableForcedAdminMode } = useUserRole();
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
  const [isAdminRepairOpen, setIsAdminRepairOpen] = useState(true);
  const defaultTab = searchParams.get('tab') || 'modules';
  
  // Explicit detection of special email for bypass
  const isKonointer = user?.email === SPECIAL_ADMIN_EMAIL;

  console.log("AdminDashboard - Current user:", user?.id, "Email:", user?.email, "Role:", role, "isSpecialAdmin:", isSpecialAdmin);
  console.log("tablesAccessible:", tablesAccessible, "isSpecialAdminAccess:", isSpecialAdminAccess, "forcedAdminMode:", forcedAdminMode);

  // Enable forced admin mode for special admin
  const handleEnableForcedAdminMode = () => {
    if (isKonointer) {
      localStorage.setItem(FORCED_ADMIN_MODE_KEY, 'true');
      setForcedAdminMode(true);
      toast({
        title: "Mode administration forcé activé",
        description: "Contournement des vérifications de sécurité pour l'administrateur spécial.",
      });
      
      // Reload after short delay
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };
  
  // Disable forced admin mode
  const handleDisableForcedAdminMode = () => {
    localStorage.removeItem(FORCED_ADMIN_MODE_KEY);
    setForcedAdminMode(false);
    toast({
      title: "Mode administration forcé désactivé",
      description: "Retour au mode de vérification normal.",
    });
    
    // Force refresh
    window.location.reload();
  };

  // Run diagnostic for better troubleshooting
  const runAdminDiagnostic = async () => {
    if (isKonointer) {
      try {
        setDiagnosticData(null);  // Clear previous data
        const data = await diagnosticRole();
        setDiagnosticData(data);
        setIsDiagnosticOpen(true);
        
        if (data) {
          toast({
            title: "Diagnostic terminé",
            description: `État du rôle: ${data.role || 'Non défini'}`,
          });
        }
      } catch (error) {
        console.error("Diagnostic error:", error);
        toast({
          title: "Erreur de diagnostic",
          description: "Impossible d'exécuter le diagnostic complet",
          variant: "destructive",
        });
      }
    }
  };

  // Initialize modules if needed
  const initializeAdminAccess = async () => {
    if (!user || isInitializing) return;
    
    setIsInitializing(true);
    try {
      console.log("Attempting to initialize admin tables...");
      
      // Try to initialize default modules
      const { error } = await supabase.rpc('create_default_modules' as any);
      
      if (error) {
        console.warn("Error initializing modules:", error);
        toast({
          title: "Erreur d'initialisation",
          description: `Impossible de créer les modules par défaut: ${error.message}`,
          variant: "destructive",
        });
      } else {
        console.log("Module initialization successful");
        toast({
          title: "Initialisation réussie",
          description: "Les modules par défaut ont été créés."
        });
      }
    } catch (error: any) {
      console.error("Error during initialization:", error);
      toast({
        title: "Erreur d'initialisation",
        description: `${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsInitializing(false);
    }
  };

  // Update forcedAdminMode from URL parameter
  useEffect(() => {
    const forceParam = searchParams.get('forceAdmin');
    if (forceParam === 'true' && isKonointer) {
      localStorage.setItem(FORCED_ADMIN_MODE_KEY, 'true');
      setForcedAdminMode(true);
      // Refresh role to apply changes
      refreshRole(true);
    }
  }, [searchParams, isKonointer, refreshRole]);

  // Auto-repair function on component mount
  useEffect(() => {
    const repairAdminRole = async () => {
      if (isKonointer && role !== "super_admin") {
        console.log("Automatic role repair via Edge Function...");
        
        try {
          const { data, error } = await supabase.functions.invoke("set-admin-role", {
            body: { 
              email: user?.email,
              userId: user?.id,
              forceRepair: true
            }
          });
          
          console.log("Edge function response for repair:", data);
          
          if (data?.success) {
            await refreshRole(true);
            toast({
              title: "Rôle réparé",
              description: "Le rôle d'administrateur a été attribué avec succès.",
            });
          } else if (error) {
            console.error("Auto-repair error:", error);
            // Fallback to forced admin mode
            if (!forcedAdminMode) {
              handleEnableForcedAdminMode();
            }
          }
        } catch (error) {
          console.error("Error during automatic repair:", error);
          // Fallback to forced admin mode
          if (!forcedAdminMode) {
            handleEnableForcedAdminMode();
          }
        }
      }
    };
    
    repairAdminRole();
  }, [isKonointer, role, user, refreshRole, forcedAdminMode]);

  // Initialize tables on load
  useEffect(() => {
    if (user && (isSpecialAdmin || role === "super_admin" || forcedAdminMode)) {
      initializeAdminAccess();
    }
  }, [user, role, isSpecialAdmin, forcedAdminMode]);

  // Show loading screen when role is loading
  if (roleLoading) {
    return <AdminDashboardLoader />;
  }

  // Fallback for special admin: If konointer@gmail.com but no admin access
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
                  onClick={handleEnableForcedAdminMode} 
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

  // Access control: Forced mode, special admin, or super_admin role
  const hasAdminAccess = forcedAdminMode || isSpecialAdmin || isSpecialAdminAccess || role === "super_admin";
  
  // If no admin access, redirect to dashboard
  if (!hasAdminAccess) {
    return <Navigate to="/dashboard" />;
  }

  // Loading screen while checking tables
  if (!forcedAdminMode && isLoading) {
    return <AdminDashboardLoader />;
  }

  // Display error if tables aren't accessible (unless forced mode or special admin)
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
              onClick={handleDisableForcedAdminMode}
              variant="outline"
              size="sm"
              className="border-amber-300 text-amber-800 hover:bg-amber-100"
            >
              Désactiver le mode forcé
            </Button>
          </div>
        )}
        
        {isKonointer && !forcedAdminMode && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4 flex justify-between items-center">
            <div>
              <h3 className="font-medium text-blue-800">Vous êtes connecté en tant qu'administrateur spécial</h3>
              <p className="text-sm text-blue-700">
                Si vous rencontrez des problèmes d'accès, utilisez le mode forcé ou le diagnostic.
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={runAdminDiagnostic}
                variant="outline"
                size="sm"
                className="border-blue-300 text-blue-800 hover:bg-blue-100"
              >
                <Info className="mr-2 h-4 w-4" />
                Diagnostic
              </Button>
              <Button 
                onClick={handleEnableForcedAdminMode}
                variant="outline"
                size="sm"
                className="border-amber-300 text-amber-800 hover:bg-amber-100"
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                Activer mode forcé
              </Button>
            </div>
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
            <Button 
              variant="ghost" 
              size="sm"
              onClick={initializeAdminAccess}
              className="text-green-600 text-xs"
              disabled={isInitializing}
            >
              {isInitializing ? (
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
              )}
              Initialiser modules
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
