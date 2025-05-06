
import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types"; 
import { useToast } from "@/hooks/use-toast";

type AppRole = Database["public"]["Enums"]["app_role"];

export const useUserRole = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Reset role on logout
  const clearRole = () => {
    setRole(null);
  };

  // Check if this is the special admin user
  const isSpecialAdmin = user?.email === 'konointer@gmail.com';

  // Apply super_admin role for special user
  const applySpecialAdminRole = () => {
    if (isSpecialAdmin) {
      console.log("Application du rôle super_admin pour l'utilisateur spécial");
      setRole('super_admin');
    }
  };

  // Function to manually refresh the role
  const refreshRole = async () => {
    if (!user) {
      clearRole();
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Actualisation du rôle pour", user.email);
      
      // For the special user, always set super_admin role locally
      if (isSpecialAdmin) {
        applySpecialAdminRole();
        
        // Try to also update the database record
        try {
          const { error } = await supabase
            .from("user_roles")
            .upsert({ 
              user_id: user.id, 
              role: "super_admin" 
            }, { onConflict: "user_id" });
            
          if (error) {
            console.log("Erreur lors de l'upsert direct:", error);
          }
        } catch (err) {
          // Silent error, we've already set the role locally
          console.warn("Erreur silencieuse lors de l'upsert:", err);
        }
        
        setIsLoading(false);
        return;
      }
      
      // For regular users, try to get role from database
      try {
        const { data: userRole, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error("Erreur lors de la récupération du rôle:", error);
          setRole(null);
        } else {
          console.log("Rôle récupéré:", userRole?.role);
          setRole(userRole?.role || null);
        }
      } catch (error) {
        console.error("Erreur lors de l'actualisation du rôle:", error);
        setRole(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load role when user changes
  useEffect(() => {
    refreshRole();
  }, [user]);

  // Force super_admin role for special user
  useEffect(() => {
    if (isSpecialAdmin && role !== 'super_admin') {
      applySpecialAdminRole();
    }
  }, [isSpecialAdmin, role]);

  return { 
    role, 
    isLoading, 
    refreshRole, 
    clearRole,
    isSpecialAdmin
  };
};
