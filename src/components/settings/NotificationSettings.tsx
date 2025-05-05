
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

export const NotificationSettings = () => {
  const { settings, updateSettings } = useSettings();
  
  const handleNotificationChange = (key: keyof typeof settings) => {
    updateSettings({ [key]: !settings[key] }, "de notification");
  };

  return (
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
            checked={settings.emailNotifications}
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
            checked={settings.pushNotifications}
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
            checked={settings.weeklyDigest}
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
            checked={settings.marketingEmails}
            onCheckedChange={() => handleNotificationChange("marketingEmails")}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => updateSettings(settings, "de notification")}>
          <Save className="h-4 w-4 mr-2" />
          Sauvegarder les paramètres
        </Button>
      </CardFooter>
    </Card>
  );
};
