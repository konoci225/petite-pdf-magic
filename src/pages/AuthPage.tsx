
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import AuthContainer from "@/components/auth/AuthContainer";

const AuthPage = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Set document title
    document.title = "Connexion | Petite PDF Magic";
  }, []);

  // If user is already logged in, redirect to home
  if (user) {
    return <Navigate to="/" replace />;
  }

  return <AuthContainer />;
};

export default AuthPage;
