
import { useState, useEffect } from "react";
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
  newUserGrowth: number;
  fileGrowth: number;
  subscriberGrowth: number;
}

export const useReportData = () => {
  const [stats, setStats] = useState<ReportStats>({
    totalUsers: 0,
    totalFiles: 0,
    activeSubscribers: 0,
    newUserGrowth: 0,
    fileGrowth: 0,
    subscriberGrowth: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState("month");
  const { toast } = useToast();

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    
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
          newUserGrowth: data.totalUsers ? Math.floor(Math.random() * 30) : 0, // Placeholder growth data
          fileGrowth: 0,
          subscriberGrowth: data.activeSubscriptions ? Math.floor(Math.random() * 40) : 0 // Placeholder growth data
        });
      } else {
        // Fallback method: fetch data directly from tables
        const [usersResult, subscribersResult] = await Promise.all([
          supabase.from('user_roles').select('*', { count: 'exact' }),
          supabase.from('subscriptions').select('*').eq('status', 'active')
        ]);
        
        if (usersResult.error) throw usersResult.error;
        if (subscribersResult.error) throw subscribersResult.error;
        
        // Calculate stats based on actual data
        setStats({
          totalUsers: usersResult.count || 0,
          totalFiles: 0,
          activeSubscribers: subscribersResult.data?.length || 0,
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
  };

  useEffect(() => {
    fetchStats();
  }, [timeframe]);

  return {
    stats,
    isLoading,
    error,
    timeframe,
    setTimeframe,
    fetchStats
  };
};
