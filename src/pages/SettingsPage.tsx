
import React from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/providers/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { 
  BellRing, 
  Mail, 
  Globe, 
  Laptop, 
  Moon, 
  Sun, 
  Lock, 
  FileText, 
  Save, 
  Database 
} from "lucide-react";

const SettingsPage = () => {
  const { user } = useAuth();
  const { role } = useUserRole();
  const { toast } = useToast();
  const isSuperAdmin = role === "super_admin";
  
  const [notificationSettings, setNotificationSettings] = React.useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
    marketingEmails: false,
  });
  
  const [displaySettings, setDisplaySettings] = React.useState({
    language: "fr",
    theme: "light",
    fileDisplayMode: "list",
  });
  
  const [securitySettings, setSecuritySettings] = React.useState({
    twoFactorAuth: false,
    sessionTimeout: "30",
  });
  
  const handleNotificationChange = (key: string) => {
    setNotificationSettings({
      ...notificationSettings,
      [key]: !notificationSettings[key as keyof typeof notificationSettings],
    });
  };
  
  const saveSettings = (type: string) => {
    toast({
      title: "Paramètres sauvegardés",
      description: `Les paramètres ${type} ont été mis à jour avec succès.`,
    });
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Paramètres</h1>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
            {isSuperAdmin && <TabsTrigger value="admin">Administration</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres généraux</CardTitle>
                <CardDescription>
                  Configurez l'apparence et le comportement de l'application.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="language">Langue</Label>
                  <Select 
                    value={displaySettings.language} 
                    onValueChange={(value) => setDisplaySettings({...displaySettings, language: value})}
                  >
                    <SelectTrigger className="w-full sm:w-72">
                      <SelectValue placeholder="Sélectionnez une langue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="theme">Thème</Label>
                  <div className="flex items-center space-x-4">
                    <Button 
                      variant={displaySettings.theme === "light" ? "default" : "outline"} 
                      className="flex items-center"
                      onClick={() => setDisplaySettings({...displaySettings, theme: "light"})}
                    >
                      <Sun className="h-4 w-4 mr-2" />
                      Clair
                    </Button>
                    <Button 
                      variant={displaySettings.theme === "dark" ? "default" : "outline"} 
                      className="flex items-center"
                      onClick={() => setDisplaySettings({...displaySettings, theme: "dark"})}
                    >
                      <Moon className="h-4 w-4 mr-2" />
                      Sombre
                    </Button>
                    <Button 
                      variant={displaySettings.theme === "system" ? "default" : "outline"} 
                      className="flex items-center"
                      onClick={() => setDisplaySettings({...displaySettings, theme: "system"})}
                    >
                      <Laptop className="h-4 w-4 mr-2" />
                      Système
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="fileDisplayMode">Affichage des fichiers</Label>
                  <div className="flex items-center space-x-4">
                    <Button 
                      variant={displaySettings.fileDisplayMode === "grid" ? "default" : "outline"} 
                      className="flex items-center"
                      onClick={() => setDisplaySettings({...displaySettings, fileDisplayMode: "grid"})}
                    >
                      Grille
                    </Button>
                    <Button 
                      variant={displaySettings.fileDisplayMode === "list" ? "default" : "outline"} 
                      className="flex items-center"
                      onClick={() => setDisplaySettings({...displaySettings, fileDisplayMode: "list"})}
                    >
                      Liste
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => saveSettings("généraux")}>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder les paramètres
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de notification</CardTitle>
                <CardDescription>
                  Configurez la façon dont vous recevez les notifications.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Notifications par email</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevez des notifications par email pour les activités importantes.
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={() => handleNotificationChange("emailNotifications")}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Notifications push</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevez des notifications dans le navigateur.
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={() => handleNotificationChange("pushNotifications")}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Résumé hebdomadaire</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevez un résumé hebdomadaire de votre activité.
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.weeklyDigest}
                    onCheckedChange={() => handleNotificationChange("weeklyDigest")}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Emails marketing</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevez des offres spéciales et des mises à jour sur nos services.
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.marketingEmails}
                    onCheckedChange={() => handleNotificationChange("marketingEmails")}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => saveSettings("de notification")}>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder les paramètres
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de sécurité</CardTitle>
                <CardDescription>
                  Configurez les paramètres de sécurité de votre compte.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Authentification à deux facteurs</Label>
                    <p className="text-sm text-muted-foreground">
                      Ajoutez une couche de sécurité supplémentaire à votre compte.
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={() => setSecuritySettings({
                      ...securitySettings, 
                      twoFactorAuth: !securitySettings.twoFactorAuth
                    })}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Expiration de session</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Définissez la durée d'inactivité avant d'être déconnecté automatiquement.
                  </p>
                  <Select 
                    value={securitySettings.sessionTimeout} 
                    onValueChange={(value) => setSecuritySettings({...securitySettings, sessionTimeout: value})}
                  >
                    <SelectTrigger className="w-full sm:w-72">
                      <SelectValue placeholder="Sélectionnez une durée" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 heure</SelectItem>
                      <SelectItem value="120">2 heures</SelectItem>
                      <SelectItem value="240">4 heures</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Dernières connexions</Label>
                  <div className="border rounded-md divide-y">
                    <div className="p-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium">Chrome sur Windows</p>
                        <p className="text-sm text-muted-foreground">Paris, France</p>
                      </div>
                      <p className="text-sm text-muted-foreground">Aujourd'hui, 10:23</p>
                    </div>
                    <div className="p-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium">Safari sur iPhone</p>
                        <p className="text-sm text-muted-foreground">Lyon, France</p>
                      </div>
                      <p className="text-sm text-muted-foreground">Hier, 18:45</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => saveSettings("de sécurité")}>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder les paramètres
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {isSuperAdmin && (
            <TabsContent value="admin">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Paramètres système</CardTitle>
                    <CardDescription>
                      Configurez les paramètres globaux de l'application.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="defaultLang">Langue par défaut</Label>
                      <Select defaultValue="fr">
                        <SelectTrigger className="w-full sm:w-72">
                          <SelectValue placeholder="Sélectionnez une langue" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="de">Deutsch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Maintenance planifiée</Label>
                        <p className="text-sm text-muted-foreground">
                          Activez le mode maintenance pour les tâches système.
                        </p>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="fileRetention">Conservation des fichiers</Label>
                      <Select defaultValue="30">
                        <SelectTrigger className="w-full sm:w-72">
                          <SelectValue placeholder="Sélectionnez une durée" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7 jours</SelectItem>
                          <SelectItem value="14">14 jours</SelectItem>
                          <SelectItem value="30">30 jours</SelectItem>
                          <SelectItem value="60">60 jours</SelectItem>
                          <SelectItem value="90">90 jours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={() => saveSettings("système")}>
                      <Save className="h-4 w-4 mr-2" />
                      Sauvegarder les paramètres
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Configuration de l'API</CardTitle>
                    <CardDescription>
                      Gérez les clés API et les intégrations pour votre application.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="apiKey">Clé API</Label>
                      <div className="flex">
                        <Input
                          id="apiKey"
                          value="sk_test_43edf94839393939393939"
                          readOnly
                          type="password"
                          className="rounded-r-none"
                        />
                        <Button className="rounded-l-none">
                          Générer une nouvelle clé
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Utilisée pour l'authentification des requêtes API.
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Journalisation des API</Label>
                        <p className="text-sm text-muted-foreground">
                          Activez la journalisation détaillée des appels API.
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="webhookUrl">URL de Webhook</Label>
                      <Input
                        id="webhookUrl"
                        placeholder="https://votre-site.com/webhook"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        URL à laquelle les événements système seront envoyés.
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={() => saveSettings("de l'API")}>
                      <Save className="h-4 w-4 mr-2" />
                      Sauvegarder les paramètres
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

export default SettingsPage;
