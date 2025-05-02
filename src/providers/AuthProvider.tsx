
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
  refreshSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  session: null,
  loading: true,
  error: null,
  refreshSession: async () => {},
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
  const refreshSession = async (): Promise<void> => {
    try {
      const { data, error: refreshError } = await supabase.auth.getSession();
      if (refreshError) throw refreshError;
      setSession(data.session);
      setUser(data.session?.user || null);
    } catch (err: any) {
      console.error("Erreur lors de l'actualisation de la session:", err);
      setError(err);
    }
  };

  useEffect(() => {
    const setupAuth = async () => {
      setLoading(true);
      try {
        // Récupérer la session initiale
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (initialSession) {
          console.log("Session trouvée:", initialSession.user?.email);
          setSession(initialSession);
          setUser(initialSession.user);
        } else {
          console.log("Aucune session active trouvée");
          setSession(null);
          setUser(null);
        }

        // Mettre en place l'écouteur de changement d'état d'authentification
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
          console.log("Changement d'état d'authentification:", event);
          setSession(newSession);
          setUser(newSession?.user || null);
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (err: any) {
        console.error("Erreur d'initialisation de l'authentification:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    setupAuth();
  }, []);

  // Fournir le contexte d'authentification aux composants enfants
  const value = {
    user,
    session,
    loading,
    error,
    refreshSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
