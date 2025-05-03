
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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
  Folder,
  ShieldAlert,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu as SidebarMenuComponent,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

interface MenuItem {
  title: string;
  icon: React.ElementType;
  path: string;
  roles?: Array<string>;
}

const SidebarMenu = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { role } = useUserRole();
  const [isKnownAdmin, setIsKnownAdmin] = useState(false);

  // Vérifier si l'utilisateur est konointer@gmail.com
  useEffect(() => {
    if (user?.email === "konointer@gmail.com") {
      setIsKnownAdmin(true);
    } else {
      setIsKnownAdmin(false);
    }
  }, [user]);

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

  // Si c'est un admin connu, ajouter toujours les routes d'admin
  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles) return true;
    
    if (isKnownAdmin && item.roles.includes("super_admin")) {
      return true;
    }
    
    return role && item.roles.includes(role);
  });

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenuComponent>
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
        </SidebarMenuComponent>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default SidebarMenu;
