
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { Menu, User, Bell, Globe } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const { user } = useAuth();
  const { role } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès",
      });
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Erreur de déconnexion",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pdf-primary to-pdf-secondary flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="hidden md:inline-block text-xl font-bold text-pdf-dark">
              Petite PDF Magic
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/dashboard" className="text-pdf-dark hover:text-pdf-primary transition-colors">
            Tableau de bord
          </Link>
          <Link to="/tools" className="text-pdf-dark hover:text-pdf-primary transition-colors">
            Outils
          </Link>
          {(role === 'subscriber' || role === 'super_admin') && (
            <Link to="/my-files" className="text-pdf-dark hover:text-pdf-primary transition-colors">
              Mes fichiers
            </Link>
          )}
          <Link to="/help" className="text-pdf-dark hover:text-pdf-primary transition-colors">
            Aide/Support
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Globe className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  Profil
                </DropdownMenuItem>
                {role === 'subscriber' && (
                  <DropdownMenuItem onClick={() => navigate('/subscription')}>
                    Abonnement
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => navigate('/auth')} className="bg-pdf-primary hover:bg-pdf-accent">
              Connexion
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
