
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Save } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

export const SecuritySettings = () => {
  const { settings, updateSettings } = useSettings();

  const saveSecuritySettings = () => {
    updateSettings({
      twoFactorAuth: settings.twoFactorAuth,
      sessionTimeout: settings.sessionTimeout
    }, "de sécurité");
  };

  return (
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
            checked={settings.twoFactorAuth}
            onCheckedChange={() => updateSettings({ 
              twoFactorAuth: !settings.twoFactorAuth 
            })}
          />
        </div>
        
        <Separator />
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Expiration de session</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Définissez la durée d'inactivité avant d'être déconnecté automatiquement.
            </p>
          </div>
          <Select 
            value={settings.sessionTimeout} 
            onValueChange={(value) => updateSettings({ sessionTimeout: value })}
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
        <Button onClick={saveSecuritySettings}>
          <Save className="h-4 w-4 mr-2" />
          Sauvegarder les paramètres
        </Button>
      </CardFooter>
    </Card>
  );
};
