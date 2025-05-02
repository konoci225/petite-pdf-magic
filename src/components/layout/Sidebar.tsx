
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import {
  LayoutDashboard,
  Users,
  FileText,
  PieChart,
  Settings,
  Wrench,
  Star,
  Calendar,
  HelpCircle,
  LogOut,
  Folder,
  ShieldAlert
} from "lucide-react";
import { 
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface MenuItem {
  title: string;
  icon: React.ElementType;
  path: string;
  roles?: Array<string>;
}

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { role, refreshRole } = useUserRole();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès",
      });
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Erreur de déconnexion",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const menuItems: MenuItem[] = [
    {
      title: "Accueil",
      icon: LayoutDashboard,
      path: "/",
      roles: ["subscriber", "super_admin", "visitor"]
    },
    {
      title: "Tableau de bord",
      icon: LayoutDashboard,
      path: "/dashboard",
      roles: ["subscriber", "super_admin", "visitor"]
    },
    {
      title: "Administration",
      icon: ShieldAlert,
      path: "/admin",
      roles: ["super_admin"]
    },
    {
      title: "Gestion des utilisateurs",
      icon: Users,
      path: "/admin?tab=users",
      roles: ["super_admin"]
    },
    {
      title: "Fichiers",
      icon: Folder,
      path: "/files",
      roles: ["super_admin"]
    },
    {
      title: "Rapports",
      icon: PieChart,
      path: "/reports",
      roles: ["super_admin"]
    },
    {
      title: "Paramètres",
      icon: Settings,
      path: "/settings",
      roles: ["super_admin", "subscriber"]
    },
    {
      title: "Mes fichiers",
      icon: FileText,
      path: "/my-files",
      roles: ["subscriber", "visitor"]
    },
    {
      title: "Outils",
      icon: Wrench,
      path: "/tools",
      roles: ["subscriber", "visitor"]
    },
    {
      title: "Outils premium",
      icon: Star,
      path: "/premium-tools",
      roles: ["subscriber"]
    },
    {
      title: "Mon abonnement",
      icon: Calendar,
      path: "/subscription",
      roles: ["subscriber"]
    },
    {
      title: "Aide",
      icon: HelpCircle,
      path: "/help",
      roles: ["subscriber", "visitor", "super_admin"]
    },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles) return true;
    return role && item.roles.includes(role);
  });

  return (
    <SidebarComponent collapsible="icon">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pdf-primary to-pdf-secondary flex items-center justify-center">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-pdf-dark">PDF Magic</span>
            {role === "super_admin" && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                Super Admin
              </Badge>
            )}
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={location.pathname === item.path}
                    asChild
                    tooltip={item.title}
                  >
                    <Link to={item.path}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border p-4">
        {user && (
          <div className="flex flex-col gap-2">
            <div className="text-sm text-muted-foreground">
              Connecté en tant que:
            </div>
            <div className="text-sm font-semibold truncate">
              {user?.email}
              {role && (
                <div className="text-xs text-muted-foreground mt-1">
                  Rôle: {role}
                </div>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-2"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" /> Déconnexion
            </Button>
          </div>
        )}
      </SidebarFooter>
    </SidebarComponent>
  );
};

export default Sidebar;
