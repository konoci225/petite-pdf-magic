
import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface UserSettings {
  theme: "light" | "dark" | "system";
  language: string;
  fileDisplayMode: "grid" | "list";
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  marketingEmails: boolean;
  twoFactorAuth: boolean;
  sessionTimeout: string;
}

const defaultSettings: UserSettings = {
  theme: "light",
  language: "fr",
  fileDisplayMode: "list",
  emailNotifications: true,
  pushNotifications: false, 
  weeklyDigest: true,
  marketingEmails: false,
  twoFactorAuth: false,
  sessionTimeout: "30"
};

export const useSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings>(() => {
    // Charger les paramètres depuis localStorage si disponibles
    if (user) {
      const savedSettings = localStorage.getItem(`user_settings_${user.id}`);
      if (savedSettings) {
        try {
          return JSON.parse(savedSettings);
        } catch (e) {
          console.error("Erreur lors du parsing des paramètres:", e);
        }
      }
    }
    return defaultSettings;
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Function to load settings
  const loadSettings = async () => {
    if (!user) {
      setSettings(defaultSettings);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Essayer de charger depuis localStorage d'abord
      const savedSettings = localStorage.getItem(`user_settings_${user.id}`);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        
        // Appliquer le thème immédiatement
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        if (parsedSettings.theme === "system") {
          const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
          root.classList.add(systemTheme);
        } else {
          root.classList.add(parsedSettings.theme);
        }
        
        // Appliquer la langue immédiatement
        document.documentElement.lang = parsedSettings.language || "fr";
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      // Fallback to defaults
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to update settings
  const updateSettings = async (newSettings: Partial<UserSettings>, category?: string) => {
    if (!user) return false;
    
    try {
      const updatedSettings = { ...settings, ...newSettings };
      localStorage.setItem(`user_settings_${user.id}`, JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
      
      // Appliquer le thème immédiatement si modifié
      if (newSettings.theme) {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        if (newSettings.theme === "system") {
          const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
          root.classList.add(systemTheme);
        } else {
          root.classList.add(newSettings.theme);
        }
      }
      
      // Appliquer la langue immédiatement si modifiée
      if (newSettings.language) {
        document.documentElement.lang = newSettings.language;
      }
      
      toast({
        title: "Paramètres sauvegardés",
        description: category 
          ? `Les paramètres ${category} ont été mis à jour avec succès.`
          : "Vos paramètres ont été mis à jour avec succès.",
      });
      
      // Pour un usage réel, sauvegarde dans la base de données
      // try {
      //   const { error } = await supabase
      //     .from('user_settings')
      //     .upsert({ 
      //       user_id: user.id,
      //       settings: updatedSettings,
      //       updated_at: new Date().toISOString()
      //     });
      //   if (error) throw error;
      // } catch (dbError) {
      //   console.error("Erreur lors de la sauvegarde en BDD:", dbError);
      // }
      
      return true;
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour des paramètres:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les paramètres: " + error.message,
        variant: "destructive",
      });
      return false;
    }
  };
  
  // Update settings when user changes
  useEffect(() => {
    loadSettings();
  }, [user]);
  
  return { settings, updateSettings, isLoading, loadSettings };
};
