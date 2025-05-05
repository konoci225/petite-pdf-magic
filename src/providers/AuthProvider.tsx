
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
  refreshSession: () => Promise<void>;
  signOut: () => Promise<void>; // Added signOut method to the interface
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  session: null,
  loading: true,
  error: null,
  refreshSession: async () => {},
  signOut: async () => {}, // Added empty implementation as default
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Fonction pour rafraîchir la session actuelle
  const refreshSession = useCallback(async (): Promise<void> => {
    try {
      const { data, error: refreshError } = await supabase.auth.getSession();
      if (refreshError) throw refreshError;

      // Ne rien faire si aucune session n'est trouvée
      if (!data.session) {
        console.log("Aucune session trouvée lors du rafraîchissement");
        return;
      }
      
      setSession(data.session);
      setUser(data.session?.user || null);
    } catch (err: any) {
      console.error("Erreur lors de l'actualisation de la session:", err);
      setError(err);
    }
  }, []);

  // Add signOut function
  const signOut = async (): Promise<void> => {
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      
      setUser(null);
      setSession(null);
    } catch (err: any) {
      console.error("Erreur lors de la déconnexion:", err);
      setError(err);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const setupAuth = async () => {
      if (!mounted) return;
      
      setLoading(true);
      try {
        // Récupérer la session initiale
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (initialSession && mounted) {
          console.log("Session trouvée:", initialSession.user?.email);
          setSession(initialSession);
          setUser(initialSession.user);
        } else if (mounted) {
          console.log("Aucune session active trouvée");
          setSession(null);
          setUser(null);
        }

      } catch (err: any) {
        console.error("Erreur d'initialisation de l'authentification:", err);
        if (mounted) {
          setError(err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Mettre en place l'écouteur de changement d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log("Changement d'état d'authentification:", event);
      if (mounted) {
        setSession(newSession);
        setUser(newSession?.user || null);
      }
    });

    setupAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Fournir le contexte d'authentification aux composants enfants
  const value = {
    user,
    session,
    loading,
    error,
    refreshSession,
    signOut // Added signOut to context value
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
