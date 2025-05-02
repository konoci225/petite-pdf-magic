
import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  session: null,
  refreshSession: async () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();

  // Fonction pour rafraîchir manuellement la session
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        throw error;
      }
      
      if (data && data.session) {
        setSession(data.session);
        setUser(data.session.user);
        console.log("Session actualisée avec succès");
      }
    } catch (error: any) {
      console.error("Erreur lors de l'actualisation de la session:", error);
      toast({
        title: "Erreur de session",
        description: "Impossible d'actualiser votre session",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    console.log("Configuration du fournisseur d'authentification...");

    // Configurer d'abord l'écouteur d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("État d'authentification changé:", event, currentSession?.user?.id);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (event === 'SIGNED_OUT') {
          console.log("Utilisateur déconnecté");
        } else if (event === 'SIGNED_IN') {
          console.log("Utilisateur connecté:", currentSession?.user?.email);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log("Token de session actualisé");
        }
      }
    );

    // Ensuite vérifier la session existante
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Vérification de session initiale:", currentSession?.user?.id);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
    });

    return () => {
      console.log("Nettoyage de l'abonnement d'authentification");
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
};
