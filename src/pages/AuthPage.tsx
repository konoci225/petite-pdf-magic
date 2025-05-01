import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/providers/AuthProvider";
import { Loader2, Eye, EyeOff, Lock, Mail, User, Check, ArrowRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

console.log('Loading AuthPage component');

const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  rememberMe: z.boolean().optional(),
});

const registerSchema = z.object({
  lastName: z.string().min(1, "Le nom est requis"),
  firstName: z.string().min(1, "Le prénom est requis"),
  email: z.string().email("Adresse email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une lettre majuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les conditions générales",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

console.log('Rendering AuthPage component');

const AuthPage = () => {
  console.log('Rendering AuthPage component');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      lastName: "",
      firstName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  useEffect(() => {
    if (user) {
      console.log("User already logged in, redirecting to home");
      navigate("/");
    }
  }, [user, navigate]);

  const calculatePasswordStrength = (password: string) => {
    if (!password) return 0;
    
    let strength = 0;
    // Length contribution (up to 25%)
    strength += Math.min(password.length * 2.5, 25);
    
    // Complexity contribution
    if (/[A-Z]/.test(password)) strength += 15; // uppercase
    if (/[a-z]/.test(password)) strength += 15; // lowercase
    if (/[0-9]/.test(password)) strength += 15; // digits
    if (/[^A-Za-z0-9]/.test(password)) strength += 20; // special chars
    if (password.length >= 12) strength += 10; // bonus for length

    return Math.min(strength, 100);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    registerForm.setValue("password", password);
    setPasswordStrength(calculatePasswordStrength(password));
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength >= 80) return { text: "Fort", color: "text-green-500" };
    if (passwordStrength >= 50) return { text: "Moyen", color: "text-yellow-500" };
    return { text: "Faible", color: "text-red-500" };
  };

  const getProgressColor = () => {
    if (passwordStrength >= 80) return "bg-green-500";
    if (passwordStrength >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const handleSignIn = async (values: LoginFormValues) => {
    try {
      setLoading(true);
      console.log("Attempting login with email:", values.email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;

      console.log("Authentication successful:", data);

      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur votre espace personnel",
      });
      
      navigate("/");
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Erreur de connexion",
        description: error.message || "Identifiants incorrects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (values: RegisterFormValues) => {
    try {
      setLoading(true);
      console.log("Attempting signup with email:", values.email);
      
      // Include first and last name in the signup metadata
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName
          }
        }
      });

      if (error) throw error;
      
      console.log("Signup successful:", data);

      toast({
        title: "Inscription réussie",
        description: "Vérifiez votre email pour confirmer votre compte.",
      });
      
      navigate("/");
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Erreur lors de l'inscription",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = loginForm.getValues("email");
    if (!email) {
      toast({
        title: "Email requis",
        description: "Veuillez saisir votre adresse email",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) throw error;
      
      toast({
        title: "Email envoyé",
        description: "Vérifiez votre boîte de réception pour réinitialiser votre mot de passe",
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  console.log('Before rendering AuthPage JSX');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {console.log('Rendering AuthPage JSX')}
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pdf-primary to-pdf-secondary flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
          </div>
          <CardTitle className="text-center text-2xl font-bold">
            Bienvenue sur Petite PDF Magic
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            {console.log('Rendering Tabs component')}
            <TabsList className="grid w-full grid-cols-2 mb-6">
              {console.log('Rendering TabsList component')}
              <TabsTrigger value="signin">Connexion</TabsTrigger>
              <TabsTrigger value="signup">Inscription</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleSignIn)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse email</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input 
                              placeholder="Votre adresse email" 
                              {...field} 
                              className="pl-10" 
                            />
                          </FormControl>
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              placeholder="Votre mot de passe" 
                              {...field} 
                              className="pl-10 pr-10" 
                            />
                          </FormControl>
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)} 
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-between">
                    <FormField
                      control={loginForm.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="remember-me" 
                            checked={field.value} 
                            onCheckedChange={field.onChange} 
                          />
                          <Label 
                            htmlFor="remember-me" 
                            className="text-sm cursor-pointer"
                          >
                            Se souvenir de moi
                          </Label>
                        </div>
                      )}
                    />
                    <button 
                      type="button" 
                      onClick={handleForgotPassword} 
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connexion...
                      </>
                    ) : (
                      "Se connecter"
                    )}
                  </Button>

                  <div className="text-center mt-6">
                    <p className="text-sm text-gray-600">
                      Vous n'avez pas de compte ? 
                      <TabsTrigger value="signup" className="inline-block text-blue-600 hover:underline ml-1 p-0">
                        Créer un compte <ArrowRight className="inline ml-1 h-3 w-3" />
                      </TabsTrigger>
                    </p>
                  </div>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="signup">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(handleSignUp)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={registerForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input 
                                placeholder="Votre nom" 
                                {...field} 
                                className="pl-10" 
                              />
                            </FormControl>
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input 
                                placeholder="Votre prénom" 
                                {...field} 
                                className="pl-10" 
                              />
                            </FormControl>
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse email</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input 
                              placeholder="Votre adresse email" 
                              {...field} 
                              className="pl-10" 
                            />
                          </FormControl>
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              placeholder="Votre mot de passe" 
                              {...field} 
                              onChange={(e) => handlePasswordChange(e)}
                              className="pl-10 pr-10" 
                            />
                          </FormControl>
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)} 
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {field.value && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs">Force du mot de passe:</span>
                              <span className={`text-xs font-semibold ${getPasswordStrengthText().color}`}>
                                {getPasswordStrengthText().text}
                              </span>
                            </div>
                            <Progress value={passwordStrength} className={getProgressColor()} />
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmer le mot de passe</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input 
                              type={showConfirmPassword ? "text" : "password"} 
                              placeholder="Confirmez votre mot de passe" 
                              {...field} 
                              className="pl-10 pr-10" 
                            />
                          </FormControl>
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <button 
                            type="button" 
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="acceptTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 my-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm cursor-pointer">
                            J'accepte les conditions générales d'utilisation
                          </FormLabel>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Inscription...
                      </>
                    ) : (
                      <>
                        S'inscrire
                        <Check className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <div className="text-center mt-6">
                    <p className="text-sm text-gray-600">
                      Vous avez déjà un compte ? 
                      <TabsTrigger value="signin" className="inline-block text-blue-600 hover:underline ml-1 p-0">
                        Se connecter
                      </TabsTrigger>
                    </p>
                  </div>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
