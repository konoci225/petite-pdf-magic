
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: AppRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user } = useAuth();
  const { role, isLoading } = useUserRole();
  const location = useLocation();
  const { toast } = useToast();

  console.log("ProtectedRoute check:", { 
    user: user?.id, 
    role, 
    isLoading, 
    allowedRoles,
    hasPermission: role && allowedRoles ? allowedRoles.includes(role) : true
  });

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If no user is logged in, redirect to auth page
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If roles are specified and user's role is not in allowed roles, redirect to home
  if (allowedRoles && allowedRoles.length > 0 && role && !allowedRoles.includes(role)) {
    console.error(`Access denied: User has role ${role}, but needs one of ${allowedRoles.join(', ')}`);
    
    toast({
      title: "Accès non autorisé",
      description: "Vous n'avez pas les permissions requises.",
      variant: "destructive"
    });
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
