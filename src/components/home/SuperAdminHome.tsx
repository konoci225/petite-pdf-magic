
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminStatisticsSection } from "./admin/AdminStatisticsSection";
import { ModuleManagementSection } from "./admin/ModuleManagementSection";
import { UserManagementSection } from "./admin/UserManagementSection";
import { SubscriptionManagementSection } from "./admin/SubscriptionManagementSection";
import { AdminQuickActions } from "./admin/AdminQuickActions";
import { Badge } from "@/components/ui/badge";

// Dashboard statistics type
interface DashboardStats {
  totalUsers: number;
  activeModules: number;
  premiumModules: number;
  activeSubscriptions: number;
}

const SuperAdminHome = () => {
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
        
        if (userError) throw userError;
        
        // Fetch module counts
        const { data: modules, error: moduleError } = await supabase
          .from('modules')
          .select('*');
        
        if (moduleError) throw moduleError;
        
        // Fetch subscription count
        const { count: subscriptionCount, error: subError } = await supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');
        
        if (subError) throw subError;
        
        setStats({
          totalUsers: userCount || 0,
          activeModules: modules ? modules.filter(m => m.is_active).length : 0,
          premiumModules: modules ? modules.filter(m => m.is_premium).length : 0,
          activeSubscriptions: subscriptionCount || 0
        });
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

      <AdminStatisticsSection stats={stats} loading={loading} />
      
      <ModuleManagementSection stats={stats} loading={loading} />
      
      <UserManagementSection stats={stats} loading={loading} />
      
      <SubscriptionManagementSection stats={stats} loading={loading} />

      <AdminQuickActions />
    </div>
  );
};

export default SuperAdminHome;
