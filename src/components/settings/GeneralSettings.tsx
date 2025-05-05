
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Moon, Laptop, Save } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage, Language } from "@/hooks/useLanguage";
import { useSettings } from "@/hooks/useSettings";

export const GeneralSettings = () => {
  const { settings, updateSettings } = useSettings();
  const { theme, changeTheme } = useTheme();
  const { language, changeLanguage } = useLanguage();
  
  const saveGeneralSettings = () => {
    updateSettings({
      theme: theme as "light" | "dark" | "system",
      language: language,
      fileDisplayMode: settings.fileDisplayMode
    }, "généraux");
  };

  return (
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
            value={language} 
            onValueChange={(value) => changeLanguage(value as Language)}
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
              variant={theme === "light" ? "default" : "outline"} 
              className="flex items-center"
              onClick={() => changeTheme("light")}
            >
              <Sun className="h-4 w-4 mr-2" />
              Clair
            </Button>
            <Button 
              variant={theme === "dark" ? "default" : "outline"} 
              className="flex items-center"
              onClick={() => changeTheme("dark")}
            >
              <Moon className="h-4 w-4 mr-2" />
              Sombre
            </Button>
            <Button 
              variant={theme === "system" ? "default" : "outline"} 
              className="flex items-center"
              onClick={() => changeTheme("system")}
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
              variant={settings.fileDisplayMode === "grid" ? "default" : "outline"} 
              className="flex items-center"
              onClick={() => updateSettings({ fileDisplayMode: "grid" })}
            >
              Grille
            </Button>
            <Button 
              variant={settings.fileDisplayMode === "list" ? "default" : "outline"} 
              className="flex items-center"
              onClick={() => updateSettings({ fileDisplayMode: "list" })}
            >
              Liste
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={saveGeneralSettings}>
          <Save className="h-4 w-4 mr-2" />
          Sauvegarder les paramètres
        </Button>
      </CardFooter>
    </Card>
  );
};
