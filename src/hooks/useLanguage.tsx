
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export type Language = "fr" | "en" | "es" | "de";

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>(() => {
    // Récupérer la langue depuis localStorage ou utiliser "fr" par défaut
    return (localStorage.getItem("language") as Language) || "fr";
  });
  const { toast } = useToast();

  // Appliquer la langue à l'élément HTML
  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem("language", language);
  }, [language]);

  // Fonction pour changer de langue
  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
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
