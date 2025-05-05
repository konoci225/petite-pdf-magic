
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export type Language = "fr" | "en" | "es" | "de";

export const useLanguage = () => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Récupérer la langue depuis localStorage ou utiliser "fr" par défaut
    if (typeof window !== "undefined") {
      const storedLanguage = localStorage.getItem("language") as Language;
      return storedLanguage || "fr";
    }
    return "fr";
  });
  
  const { toast } = useToast();

  // Fonction pour appliquer la langue
  const applyLanguage = (newLanguage: Language) => {
    document.documentElement.lang = newLanguage;
    localStorage.setItem("language", newLanguage);
  };

  // Appliquer la langue à l'élément HTML quand elle change
  useEffect(() => {
    applyLanguage(language);
  }, [language]);

  // Fonction pour changer de langue
  const changeLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    
    toast({
      title: "Langue mise à jour",
      description: `La langue a été changée en ${
        newLanguage === "fr" ? "français" :
        newLanguage === "en" ? "anglais" :
        newLanguage === "es" ? "espagnol" :
        "allemand"
      }`,
    });
  };

  return { language, changeLanguage };
};
