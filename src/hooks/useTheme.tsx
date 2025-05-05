
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

type Theme = "light" | "dark" | "system";

export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Récupérer le thème depuis localStorage ou utiliser "light" par défaut
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("theme") as Theme;
      return storedTheme || "light";
    }
    return "light";
  });
  
  const { toast } = useToast();

  // Fonction pour appliquer le thème à l'élément HTML
  const applyTheme = (newTheme: Theme) => {
    const root = window.document.documentElement;
    
    // Supprimer les classes existantes
    root.classList.remove("light", "dark");
    
    if (newTheme === "system") {
      // Vérifier la préférence du système
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      // Appliquer le thème choisi
      root.classList.add(newTheme);
    }
  };

  // Appliquer le thème quand il change
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Écouter les changements de préférence système
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Fonction pour changer de thème
  const changeTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    
    toast({
      title: "Thème mis à jour",
      description: `Le thème a été changé en mode ${
        newTheme === "light" ? "clair" : newTheme === "dark" ? "sombre" : "système"
      }`,
    });
  };

  return { theme, changeTheme };
};
