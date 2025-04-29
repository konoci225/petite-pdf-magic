
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Settings, 
  FileText, 
  Bell, 
  ShieldAlert, 
  CreditCard, 
  Activity,
  Database,
  UserCog,
  Plus,
  Eye,
  BarChart2
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Dashboard statistics type
interface DashboardStats {
  totalUsers: number;
  activeModules: number;
  premiumModules: number;
  activeSubscriptions: number;
}

const SuperAdminHome = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeModules: 0,
    premiumModules: 0,
    activeSubscriptions: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch user count
        const { count: userCount, error: userError } = await supabase
          .from('user_roles')
          .select('*', { count: 'exact', head: true });
        
        // Fetch module counts
        const { data: modules, error: moduleError } = await supabase
          .from('modules')
          .select('*');
        
        // Fetch subscription count
        const { count: subscriptionCount, error: subError } = await supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');
        
        if (!userError && !moduleError && !subError && modules) {
          setStats({
            totalUsers: userCount || 0,
            activeModules: modules.filter(m => m.is_active).length,
            premiumModules: modules.filter(m => m.is_premium).length,
            activeSubscriptions: subscriptionCount || 0
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord administrateur</h1>
          <p className="text-gray-600">Gérez les modules, utilisateurs et abonnements de votre application.</p>
        </div>
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1">
          Super Admin
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.totalUsers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Modules Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.activeModules}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Modules Premium</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.premiumModules}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Abonnements Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.activeSubscriptions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Module Management Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Gestion des Modules</CardTitle>
              <CardDescription>
                Gérez l'activation, la désactivation et la création de modules au sein de l'application. Personnalisez l'application en fonction des besoins de l'association.
              </CardDescription>
            </div>
            <Database className="h-6 w-6 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button size="sm" onClick={() => navigate("/admin")} className="gap-2">
              <Plus className="h-4 w-4" />
              Créer un module
            </Button>
            <Button size="sm" onClick={() => navigate("/admin")} variant="outline" className="gap-2">
              <Eye className="h-4 w-4" />
              Voir tous les modules
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gray-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Modules actifs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : stats.activeModules}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Dernières modifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">Aujourd'hui, 10:23</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-50 border-orange-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Alerte</CardTitle>
                  <ShieldAlert className="h-4 w-4 text-orange-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-orange-700">Module OCR désactivé</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="secondary" className="w-full" onClick={() => navigate("/admin")}>
            Gérer tous les modules
          </Button>
        </CardFooter>
      </Card>

      {/* User Management Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Gestion des Utilisateurs</CardTitle>
              <CardDescription>
                Ajoutez de nouveaux membres, attribuez des rôles, et suivez les actions de chaque utilisateur. Maintenez la sécurité et l'organisation de l'application.
              </CardDescription>
            </div>
            <UserCog className="h-6 w-6 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button size="sm" onClick={() => navigate("/admin")} className="gap-2">
              <Plus className="h-4 w-4" />
              Ajouter un utilisateur
            </Button>
            <Button size="sm" onClick={() => navigate("/admin")} variant="outline" className="gap-2">
              <Users className="h-4 w-4" />
              Voir tous les utilisateurs
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gray-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Utilisateurs actifs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="text-2xl font-bold">{loading ? '...' : Math.floor(stats.totalUsers * 0.8)}</div>
                  <div className="text-xs bg-green-100 text-green-700 rounded px-1 h-fit my-auto">
                    {loading ? '' : `${Math.floor(stats.totalUsers * 0.8 / stats.totalUsers * 100)}%`}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Répartition des rôles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-xs font-medium">
                    <div className="bg-purple-200 h-2 rounded mb-1"></div>
                    <span>Admin</span>
                  </div>
                  <div className="text-xs font-medium">
                    <div className="bg-blue-200 h-2 rounded mb-1"></div>
                    <span>Abonnés</span>
                  </div>
                  <div className="text-xs font-medium">
                    <div className="bg-gray-200 h-2 rounded mb-1"></div>
                    <span>Visiteurs</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-50 border-blue-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Notification</CardTitle>
                  <Bell className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-blue-700">3 utilisateurs sans activité récente</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="secondary" className="w-full" onClick={() => navigate("/admin")}>
            Gérer tous les utilisateurs
          </Button>
        </CardFooter>
      </Card>

      {/* Subscription Management Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Gestion des Abonnements</CardTitle>
              <CardDescription>
                Gérez les abonnements des membres, suivez les paiements effectués, gérez les exemptions, et créez des rapports financiers détaillés.
              </CardDescription>
            </div>
            <CreditCard className="h-6 w-6 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button size="sm" onClick={() => navigate("/admin")} className="gap-2">
              <Plus className="h-4 w-4" />
              Ajouter un abonnement
            </Button>
            <Button size="sm" onClick={() => navigate("/reports")} variant="outline" className="gap-2">
              <BarChart2 className="h-4 w-4" />
              Générer un rapport
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gray-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Abonnements actifs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : stats.activeSubscriptions}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Paiements en retard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-50 border-red-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Alerte</CardTitle>
                  <Activity className="h-4 w-4 text-red-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-red-700">2 exemptions expirent cette semaine</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="secondary" className="w-full" onClick={() => navigate("/admin")}>
            Gérer tous les abonnements
          </Button>
        </CardFooter>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button variant="outline" className="gap-2" onClick={() => navigate("/settings")}>
          <Settings className="h-4 w-4" />
          Paramètres
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => navigate("/reports")}>
          <FileText className="h-4 w-4" />
          Rapports
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => navigate("/files")}>
          <FileText className="h-4 w-4" />
          Fichiers
        </Button>
      </div>
    </div>
  );
};

export default SuperAdminHome;
