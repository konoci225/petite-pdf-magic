
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

type Theme = "light" | "dark" | "system";

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Récupérer le thème depuis localStorage ou utiliser "light" par défaut
    return (localStorage.getItem("theme") as Theme) || "light";
  });
  const { toast } = useToast();

  // Appliquer le thème à l'élément HTML
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Supprimer les classes existantes
    root.classList.remove("light", "dark");
    
    if (theme === "system") {
      // Vérifier la préférence du système
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      localStorage.setItem("theme", theme);
    } else {
      // Appliquer le thème choisi
      root.classList.add(theme);
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  // Fonction pour changer de thème
  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    toast({
      title: "Thème mis à jour",
      description: `Le thème a été changé en mode ${
        newTheme === "light" ? "clair" : newTheme === "dark" ? "sombre" : "système"
      }`,
    });
  };

  return { theme, changeTheme };
};
