
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/providers/AuthProvider";
import { Eye, EyeOff, Lock, Mail, Check, ArrowRight, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Validation pour la connexion
const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  rememberMe: z.boolean().optional(),
});

// Validation pour l'inscription
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

const AuthPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { lastName: "", firstName: "", email: "", password: "", confirmPassword: "", acceptTerms: false },
  });

  useEffect(() => {
    if (user) navigate("/"); // Rediriger si l'utilisateur est déjà connecté
  }, [user, navigate]);

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 12) strength += 10;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;
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
      const { data, error } = await supabase.auth.signInWithPassword({ email: values.email, password: values.password });
      if (error) throw error;

      toast({ title: "Connexion réussie", description: "Bienvenue sur votre espace personnel" });
      navigate("/");
    } catch (error: any) {
      toast({ title: "Erreur de connexion", description: error.message || "Identifiants incorrects", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (values: RegisterFormValues) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: { data: { first_name: values.firstName, last_name: values.lastName } },
      });
      if (error) throw error;

      toast({ title: "Inscription réussie", description: "Vérifiez votre email pour confirmer votre compte." });
      navigate("/");
    } catch (error: any) {
      toast({ title: "Erreur lors de l'inscription", description: error.message || "Une erreur est survenue", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = loginForm.getValues("email");
    if (!email) {
      toast({ title: "Email requis", description: "Veuillez saisir votre adresse email", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;

      toast({ title: "Email envoyé", description: "Vérifiez votre boîte de réception pour réinitialiser votre mot de passe" });
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message || "Une erreur est survenue", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Bienvenue sur Petite PDF Magic</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Connexion</TabsTrigger>
              <TabsTrigger value="signup">Inscription</TabsTrigger>
            </TabsList>

            {/* Connexion */}
            <TabsContent value="signin">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleSignIn)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-10" placeholder="Votre email" {...field} />
                          </div>
                        </FormControl>
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
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              className="pl-10 pr-10"
                              type={showPassword ? "text" : "password"}
                              placeholder="Votre mot de passe"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-2.5 text-muted-foreground"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-between">
                    <FormField
                      control={loginForm.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm">Se souvenir de moi</FormLabel>
                        </FormItem>
                      )}
                    />
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-primary hover:underline"
                    >
                      Mot de passe oublié?
                    </button>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                    Se connecter
                  </Button>
                </form>
              </Form>
            </TabsContent>

            {/* Inscription */}
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
                          <FormControl>
                            <Input placeholder="Votre nom" {...field} />
                          </FormControl>
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
                          <FormControl>
                            <Input placeholder="Votre prénom" {...field} />
                          </FormControl>
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-10" placeholder="Votre email" {...field} />
                          </div>
                        </FormControl>
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
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              className="pl-10 pr-10"
                              type={showPassword ? "text" : "password"}
                              placeholder="Votre mot de passe"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handlePasswordChange(e);
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-2.5 text-muted-foreground"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs">Force du mot de passe:</span>
                            <span className={`text-xs ${getPasswordStrengthText().color}`}>
                              {getPasswordStrengthText().text}
                            </span>
                          </div>
                          <Progress value={passwordStrength} className={getProgressColor()} />
                        </div>
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
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              className="pl-10 pr-10"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirmez votre mot de passe"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-2.5 text-muted-foreground"
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="acceptTerms"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm">
                            J'accepte les <a href="#" className="text-primary hover:underline">conditions générales</a>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                    S'inscrire
                  </Button>
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
