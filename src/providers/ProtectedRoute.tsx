
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
  const { user, session } = useAuth();
  const { role, isLoading } = useUserRole();
  const location = useLocation();
  const { toast } = useToast();

  console.log("ProtectedRoute check:", { 
    user: user?.id, 
    session: session?.access_token ? "Valid" : "None",
    role, 
    isLoading, 
    allowedRoles,
    hasPermission: role && allowedRoles ? allowedRoles.includes(role) : true
  });

  // Afficher le loader pendant le chargement du rôle
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Si aucun utilisateur n'est connecté, rediriger vers la page d'authentification
  if (!user || !session) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Cas spécial pour super_admin - ils devraient pouvoir accéder à tout
  const isSuperAdmin = role === "super_admin";
  const hasPermission = isSuperAdmin || (role && allowedRoles ? allowedRoles.includes(role) : true);

  // Si des rôles sont spécifiés et que l'utilisateur n'a pas la permission
  if (allowedRoles && allowedRoles.length > 0 && !hasPermission) {
    console.error(`Accès refusé: L'utilisateur a le rôle ${role}, mais a besoin d'un de ces rôles: ${allowedRoles.join(', ')}`);
    
    toast({
      title: "Accès non autorisé",
      description: `Vous avez le rôle ${role}, mais vous avez besoin d'un de ces rôles: ${allowedRoles.join(', ')}`,
      variant: "destructive"
    });
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
