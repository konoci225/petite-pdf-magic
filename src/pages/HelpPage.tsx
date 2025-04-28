
import React from "react";
import Layout from "@/components/layout/Layout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileQuestion, 
  MessageSquare, 
  Book, 
  PlayCircle, 
  Send,
  HelpCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const HelpPage = () => {
  const { toast } = useToast();

  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({
      title: "Message envoyé",
      description: "Votre message a été envoyé. Nous vous répondrons dans les plus brefs délais.",
    });
    // Reset form
    (e.target as HTMLFormElement).reset();
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Aide et Support</h1>

        <Tabs defaultValue="faq" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="faq">
              <FileQuestion className="h-4 w-4 mr-2" />
              FAQ
            </TabsTrigger>
            <TabsTrigger value="tutorials">
              <PlayCircle className="h-4 w-4 mr-2" />
              Tutoriels
            </TabsTrigger>
            <TabsTrigger value="contact">
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact
            </TabsTrigger>
            <TabsTrigger value="documentation">
              <Book className="h-4 w-4 mr-2" />
              Documentation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle>Questions fréquemment posées</CardTitle>
                <CardDescription>
                  Retrouvez les réponses aux questions les plus fréquentes sur notre application.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Comment fusionner des fichiers PDF ?</AccordionTrigger>
                    <AccordionContent>
                      <p>Pour fusionner des fichiers PDF :</p>
                      <ol className="list-decimal pl-5 space-y-2 mt-2">
                        <li>Accédez à l'outil "Fusion de PDF" depuis la page Outils</li>
                        <li>Sélectionnez les fichiers PDF que vous souhaitez fusionner</li>
                        <li>Organisez-les dans l'ordre souhaité par glisser-déposer</li>
                        <li>Cliquez sur le bouton "Fusionner"</li>
                        <li>Téléchargez votre nouveau fichier PDF fusionné</li>
                      </ol>
                      <p className="mt-2 text-muted-foreground">Note : Les utilisateurs gratuits sont limités à 3 fichiers par fusion.</p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Comment compresser un fichier PDF ?</AccordionTrigger>
                    <AccordionContent>
                      <p>Pour compresser un fichier PDF :</p>
                      <ol className="list-decimal pl-5 space-y-2 mt-2">
                        <li>Accédez à l'outil "Compression PDF" depuis la page Outils</li>
                        <li>Sélectionnez le fichier PDF que vous souhaitez compresser</li>
                        <li>Choisissez le niveau de compression souhaité (faible, moyen, fort)</li>
                        <li>Cliquez sur le bouton "Compresser"</li>
                        <li>Téléchargez votre fichier PDF compressé</li>
                      </ol>
                      <p className="mt-2 text-muted-foreground">Note : Une compression plus forte peut réduire la qualité du document.</p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Comment passer à l'abonnement premium ?</AccordionTrigger>
                    <AccordionContent>
                      <p>Pour passer à l'abonnement premium :</p>
                      <ol className="list-decimal pl-5 space-y-2 mt-2">
                        <li>Connectez-vous à votre compte</li>
                        <li>Cliquez sur "S'abonner maintenant" sur votre tableau de bord</li>
                        <li>Choisissez la formule d'abonnement qui vous convient</li>
                        <li>Renseignez vos informations de paiement</li>
                        <li>Validez votre abonnement</li>
                      </ol>
                      <p className="mt-2">Vous aurez immédiatement accès à tous nos outils premium.</p>
                      <Button 
                        className="mt-4" 
                        onClick={() => window.location.href = '/subscription'}
                      >
                        Voir les offres d'abonnement
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4">
                    <AccordionTrigger>Comment retrouver mes fichiers traités ?</AccordionTrigger>
                    <AccordionContent>
                      <p>Pour accéder à vos fichiers traités :</p>
                      <ol className="list-decimal pl-5 space-y-2 mt-2">
                        <li>Connectez-vous à votre compte</li>
                        <li>Accédez à la section "Mes fichiers" depuis le menu principal</li>
                        <li>Tous vos fichiers y sont répertoriés par date, type d'opération etc.</li>
                      </ol>
                      <p className="mt-2 text-muted-foreground">Note : Les fichiers sont conservés pendant 30 jours pour les utilisateurs gratuits et indéfiniment pour les abonnés premium.</p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-5">
                    <AccordionTrigger>Comment diviser un document PDF ?</AccordionTrigger>
                    <AccordionContent>
                      <p>Pour diviser un document PDF (fonctionnalité premium) :</p>
                      <ol className="list-decimal pl-5 space-y-2 mt-2">
                        <li>Accédez à l'outil "Division de PDF" depuis la page Outils</li>
                        <li>Sélectionnez le fichier PDF que vous souhaitez diviser</li>
                        <li>Choisissez la méthode de division (par page, par intervalle, etc.)</li>
                        <li>Définissez les paramètres de division</li>
                        <li>Cliquez sur "Diviser" et téléchargez les fichiers résultants</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tutorials">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Comment utiliser la fusion de PDF</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-slate-100 rounded-md flex items-center justify-center mb-4">
                    <PlayCircle className="h-16 w-16 text-slate-400" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ce tutoriel vous montre comment utiliser l'outil de fusion de PDF pour combiner plusieurs documents en un seul fichier.
                  </p>
                  <Button className="mt-4 w-full">Voir le tutoriel</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Compression de PDF sans perte de qualité</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-slate-100 rounded-md flex items-center justify-center mb-4">
                    <PlayCircle className="h-16 w-16 text-slate-400" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Découvrez comment compresser vos documents PDF tout en préservant leur qualité grâce à nos options avancées.
                  </p>
                  <Button className="mt-4 w-full">Voir le tutoriel</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Division de PDF en plusieurs fichiers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-slate-100 rounded-md flex items-center justify-center mb-4">
                    <PlayCircle className="h-16 w-16 text-slate-400" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Apprenez à diviser un document PDF en plusieurs fichiers ou à extraire des pages spécifiques.
                  </p>
                  <Button className="mt-4 w-full">Voir le tutoriel</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Utiliser l'OCR pour rendre votre PDF éditable</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-slate-100 rounded-md flex items-center justify-center mb-4">
                    <PlayCircle className="h-16 w-16 text-slate-400" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ce tutoriel vous montre comment utiliser notre technologie OCR pour convertir des images en texte éditable.
                  </p>
                  <Button className="mt-4 w-full">Voir le tutoriel</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contactez notre support</CardTitle>
                <CardDescription>
                  Envoyez-nous un message et notre équipe vous répondra dans les plus brefs délais.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Nom
                      </label>
                      <Input id="name" placeholder="Votre nom" required />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email
                      </label>
                      <Input id="email" type="email" placeholder="votre@email.com" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">
                      Sujet
                    </label>
                    <Input id="subject" placeholder="Sujet de votre demande" required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Détaillez votre problème ou votre question..."
                      rows={5}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer le message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documentation">
            <Card>
              <CardHeader>
                <CardTitle>Documentation</CardTitle>
                <CardDescription>
                  Consultez notre documentation complète pour tirer le meilleur parti de nos outils.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Guide de l'utilisateur</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">Documentation complète sur toutes les fonctionnalités</p>
                      <Button variant="outline" className="w-full mt-4">
                        <Book className="h-4 w-4 mr-2" />
                        Consulter
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">API Documentation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">Pour les développeurs souhaitant intégrer nos services</p>
                      <Button variant="outline" className="w-full mt-4">
                        <Book className="h-4 w-4 mr-2" />
                        Consulter
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Guides pas à pas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">Tutoriels détaillés sur des cas d'utilisation spécifiques</p>
                      <Button variant="outline" className="w-full mt-4">
                        <Book className="h-4 w-4 mr-2" />
                        Consulter
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default HelpPage;
