
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
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
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
      // Settings could be stored in a user_settings table, here we use localStorage as a simple demo
      const savedSettings = localStorage.getItem(`user_settings_${user.id}`);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
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
    if (!user) return;
    
    try {
      const updatedSettings = { ...settings, ...newSettings };
      localStorage.setItem(`user_settings_${user.id}`, JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
      
      toast({
        title: "Paramètres sauvegardés",
        description: category 
          ? `Les paramètres ${category} ont été mis à jour avec succès.`
          : "Vos paramètres ont été mis à jour avec succès.",
      });
      
      // In a real app, you would call an API to update settings in the database
      // const { error } = await supabase
      //   .from('user_settings')
      //   .upsert({ 
      //     user_id: user.id,
      //     settings: updatedSettings,
      //     updated_at: new Date().toISOString()
      //   });
      // if (error) throw error;
      
      return true;
    } catch (error: any) {
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
  
  return { settings, updateSettings, isLoading };
};
