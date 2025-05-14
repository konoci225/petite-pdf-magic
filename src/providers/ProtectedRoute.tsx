
import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: AppRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, session } = useAuth();
  const { role, isLoading, refreshRole } = useUserRole();
  const location = useLocation();

  useEffect(() => {
    // If user is logged in but we don't have a role, try to refresh it
    if (user && !role && !isLoading) {
      console.log("Attempting to refresh missing role...");
      refreshRole();
    }
  }, [user, role, isLoading, refreshRole]);

  console.log("ProtectedRoute check:", { 
    user: user?.id, 
    email: user?.email,
    session: session?.access_token ? "Valid" : "None",
    role, 
    isLoading, 
    allowedRoles,
    path: location.pathname
  });

  // Show loader while role is loading
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If no user is logged in, redirect to auth page
  if (!user || !session) {
    console.log("No user or session, redirecting to auth");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Special case for super_admin - they should be able to access everything
  if (role === "super_admin") {
    console.log(`User ${user.email} is super_admin, access granted`);
    return <>{children}</>;
  }
  
  // Check if any roles are required
  if (!allowedRoles || allowedRoles.length === 0) {
    // If no specific role is required, allow access
    console.log("No specific role required, access granted");
    return <>{children}</>;
  }

  // Permission check
  const hasPermission = allowedRoles.includes(role as AppRole);
  
  // Standard role check
  if (hasPermission) {
    console.log(`User has required role: ${role}, access granted`);
    return <>{children}</>;
  }
  
  // User doesn't have necessary permissions
  console.error(`Access denied: User has role ${role}, but needs one of these roles: ${allowedRoles.join(', ')}`);
  
  toast({
    title: "Accès non autorisé",
    description: `Vous avez le rôle ${role || 'non défini'}, mais vous avez besoin d'un de ces rôles: ${allowedRoles.join(', ')}`,
    variant: "destructive"
  });
  
  return <Navigate to="/" replace />;
};
