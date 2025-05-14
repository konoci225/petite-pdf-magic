
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  total_users: number;
  active_modules: number;
  premium_modules: number;
  active_subscriptions: number;
}

export interface ReportStats {
  totalUsers: number;
  totalFiles: number;
  activeSubscribers: number;
  activeModules: number;
  premiumModules: number;
  activeSubscriptions: number;
  newUserGrowth: number;
  fileGrowth: number;
  subscriberGrowth: number;
}

export const useReportData = () => {
  const [stats, setStats] = useState<ReportStats>({
    totalUsers: 0,
    totalFiles: 0,
    activeSubscribers: 0,
    activeModules: 0,
    premiumModules: 0,
    activeSubscriptions: 0,
    newUserGrowth: 0,
    fileGrowth: 0,
    subscriberGrowth: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState("month");
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const { toast } = useToast();

  // Debounced fetch function to prevent excessive calls
  const fetchStats = useCallback(async () => {
    // Prevent excessive calls (minimum 2 seconds between calls)
    const now = Date.now();
    if (now - lastFetchTime < 2000) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setLastFetchTime(now);
    
    try {
      // Use the Edge Function to fetch dashboard stats
      const { data, error } = await supabase.functions.invoke('get_admin_dashboard_stats');
      
      if (error) {
        console.error("Error calling Edge Function:", error);
        throw new Error(error.message);
      }
      
      if (data) {
        setStats({
          totalUsers: data.totalUsers || 0,
          totalFiles: 0, // This data is not available yet
          activeSubscribers: data.activeSubscriptions || 0,
          activeModules: data.activeModules || 0,
          premiumModules: data.premiumModules || 0,
          activeSubscriptions: data.activeSubscriptions || 0,
          newUserGrowth: data.totalUsers ? Math.floor(Math.random() * 30) : 0, // Placeholder growth data
          fileGrowth: 0,
          subscriberGrowth: data.activeSubscriptions ? Math.floor(Math.random() * 40) : 0 // Placeholder growth data
        });
      } else {
        // Fallback method: fetch data directly from tables
        const [usersResult, modulesResult, subscribersResult] = await Promise.all([
          supabase.from('user_roles').select('*', { count: 'exact' }),
          supabase.from('modules').select('*'),
          supabase.from('subscriptions').select('*').eq('status', 'active')
        ]);
        
        if (usersResult.error) throw usersResult.error;
        if (modulesResult.error) throw modulesResult.error;
        if (subscribersResult.error) throw subscribersResult.error;
        
        const activeModules = modulesResult.data?.filter(m => m.is_active)?.length || 0;
        const premiumModules = modulesResult.data?.filter(m => m.is_premium)?.length || 0;
        
        // Calculate stats based on actual data
        setStats({
          totalUsers: usersResult.count ?? 0,
          totalFiles: 0,
          activeSubscribers: subscribersResult.data?.length || 0,
          activeModules: activeModules,
          premiumModules: premiumModules,
          activeSubscriptions: subscribersResult.data?.length || 0,
          newUserGrowth: usersResult.count ? Math.floor(Math.random() * 30) : 0, // Placeholder growth data
          fileGrowth: 0,
          subscriberGrowth: subscribersResult.data?.length ? Math.floor(Math.random() * 40) : 0 // Placeholder growth data
        });
      }
    } catch (error: any) {
      console.error("Error fetching statistics:", error);
      setError(error.message || "Could not fetch statistics");
      toast({
        title: "Error",
        description: "Could not fetch statistics: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [timeframe, lastFetchTime, toast]);

  // Fetch data when timeframe changes
  useEffect(() => {
    fetchStats();
    
    // Set up auto-refresh interval (every 60 seconds)
    const refreshInterval = setInterval(() => {
      fetchStats();
    }, 60000);
    
    return () => clearInterval(refreshInterval);
  }, [timeframe, fetchStats]);

  return {
    stats,
    isLoading,
    error,
    timeframe,
    setTimeframe,
    fetchStats
  };
};
