
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthFooter } from "@/components/auth/AuthFooter";

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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-6 shadow-lg sm:p-8">
        <AuthHeader />
        <AuthForm />
        <AuthFooter />
      </div>
    </div>
  );
};

export default AuthPage;
