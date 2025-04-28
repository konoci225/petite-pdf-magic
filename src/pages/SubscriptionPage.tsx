
import React from "react";
import Layout from "@/components/layout/Layout";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserSubscription } from "@/hooks/useUserSubscription";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  X,
  Loader2,
  Calendar,
  CreditCard,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const plans = [
  {
    id: "basic",
    name: "Gratuit",
    price: "0",
    description: "Fonctionnalités de base pour les utilisateurs occasionnels",
    features: [
      { name: "Fusion de PDF (max 3 fichiers)", included: true },
      { name: "Visualiseur PDF", included: true },
      { name: "Compression basique", included: true },
      { name: "Stockage 7 jours", included: true },
      { name: "Outils premium", included: false },
      { name: "Stockage illimité", included: false },
      { name: "Pas de limite de taille", included: false },
      { name: "Support prioritaire", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "9,99",
    description: "Pour les professionnels qui ont besoin d'outils avancés",
    features: [
      { name: "Fusion de PDF illimitée", included: true },
      { name: "Visualiseur PDF", included: true },
      { name: "Compression avancée", included: true },
      { name: "Stockage 30 jours", included: true },
      { name: "OCR et édition PDF", included: true },
      { name: "Signature électronique", included: true },
      { name: "Limite de taille 100 Mo", included: true },
      { name: "Support par email", included: true },
    ],
    popular: true,
  },
  {
    id: "business",
    name: "Business",
    price: "19,99",
    description: "Solution complète pour les entreprises",
    features: [
      { name: "Fusion de PDF illimitée", included: true },
      { name: "Tous les outils premium", included: true },
      { name: "Compression avancée", included: true },
      { name: "Stockage illimité", included: true },
      { name: "OCR et édition PDF avancés", included: true },
      { name: "Signature électronique avancée", included: true },
      { name: "Pas de limite de taille", included: true },
      { name: "Support prioritaire 24/7", included: true },
    ],
  },
];

const SubscriptionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { role } = useUserRole();
  const { subscription, isLoading } = useUserSubscription();
  
  const isSubscriber = role === "subscriber";
  const [subscribing, setSubscribing] = React.useState(false);

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    setSubscribing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, this would connect to a payment processor
      // and handle the subscription creation
      
      // After successful payment, show success message
      toast({
        title: "Abonnement réussi",
        description: `Vous êtes maintenant abonné au plan ${planId}.`,
      });
      
      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'abonnement.",
        variant: "destructive",
      });
    } finally {
      setSubscribing(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Abonnement annulé",
        description: "Votre abonnement a été annulé avec succès.",
      });
      
      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'annulation de l'abonnement.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Abonnements</h1>

        <Tabs defaultValue={isSubscriber ? "current" : "plans"} className="w-full">
          <TabsList className="mb-6">
            {isSubscriber && (
              <TabsTrigger value="current">
                <CreditCard className="h-4 w-4 mr-2" />
                Mon abonnement
              </TabsTrigger>
            )}
            <TabsTrigger value="plans">
              <Calendar className="h-4 w-4 mr-2" />
              Plans disponibles
            </TabsTrigger>
          </TabsList>

          {isSubscriber && (
            <TabsContent value="current">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">
                        Plan {subscription?.plan || "Pro"}
                        <Badge 
                          variant="outline" 
                          className="ml-2 bg-green-50 text-green-700 border-green-200"
                        >
                          Actif
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-2">
                        Détails de votre abonnement actuel
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg flex-1">
                        <p className="text-sm text-muted-foreground">Date de début</p>
                        <p className="font-medium">
                          {formatDate(subscription?.start_date || new Date().toISOString())}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg flex-1">
                        <p className="text-sm text-muted-foreground">Prochain paiement</p>
                        <p className="font-medium">
                          {formatDate(subscription?.end_date || new Date(Date.now() + 30*24*60*60*1000).toISOString())}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg flex-1">
                        <p className="text-sm text-muted-foreground">Montant</p>
                        <p className="font-medium">9,99 € / mois</p>
                      </div>
                    </div>

                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Fonctionnalités incluses</h3>
                      <ul className="grid gap-2">
                        {plans[1].features.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            <span>{feature.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-4">
                  <Button className="w-full sm:w-auto">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Changer de plan
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full sm:w-auto">
                        Annuler l'abonnement
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr de vouloir annuler ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          En annulant votre abonnement, vous perdrez l'accès à toutes les fonctionnalités premium
                          à la fin de votre période de facturation actuelle.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Retour</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancelSubscription}>
                          Confirmer l'annulation
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="plans">
            <div className="grid gap-6 md:grid-cols-3">
              {plans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={
                    plan.popular 
                      ? "border-primary shadow-md relative" 
                      : ""
                  }
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-0 right-0 flex justify-center">
                      <Badge className="bg-primary hover:bg-primary">Populaire</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">{plan.price}€</span>
                      <span className="text-muted-foreground ml-1">/mois</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          {feature.included ? (
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                          ) : (
                            <X className="h-4 w-4 text-red-500 mr-2 mt-0.5" />
                          )}
                          <span className={!feature.included ? "text-muted-foreground" : ""}>
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    {plan.id === "basic" ? (
                      isSubscriber ? (
                        <Button variant="outline" className="w-full" disabled>
                          Plan actuel
                        </Button>
                      ) : (
                        <Button variant="outline" className="w-full" disabled>
                          Plan actuel
                        </Button>
                      )
                    ) : (
                      <Button
                        className={`w-full ${plan.popular ? "bg-primary hover:bg-primary/90" : ""}`}
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={subscribing}
                      >
                        {subscribing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Traitement...
                          </>
                        ) : (
                          <>S'abonner</>
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            <Card className="mt-8 border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center text-amber-800">
                  <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
                  Informations importantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-amber-700">
                  Dans cette version de démonstration, les paiements ne sont pas traités réellement. 
                  En situation réelle, vous seriez redirigé vers notre processeur de paiement sécurisé pour compléter votre abonnement.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SubscriptionPage;
