
import { FileText } from "lucide-react";

export const AuthHeader = () => {
  return (
    <div className="flex flex-col items-center space-y-2 text-center">
      <div className="rounded-full bg-primary/10 p-3">
        <FileText className="h-10 w-10 text-primary" />
      </div>
      <h1 className="text-2xl font-bold">Bienvenue sur Petite PDF Magic</h1>
      <p className="text-gray-500">
        Connectez-vous pour accéder à tous les outils de gestion de PDF
      </p>
    </div>
  );
};
