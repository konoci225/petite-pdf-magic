
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Save } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

export const AdminSettings = () => {
  const { updateSettings, settings } = useSettings();
  
  const saveSystemSettings = () => {
    updateSettings({
      // System settings would go here
    }, "système");
  };

  return (
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
            <Select defaultValue="fr" onValueChange={(value) => updateSettings({ language: value })}>
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
          <Button onClick={saveSystemSettings}>
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
          <Button onClick={() => updateSettings(settings, "de l'API")}>
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder les paramètres
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
