
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import FixRoleButton from "./users/FixRoleButton";

interface ErrorMessageProps {
  title: string;
  description: string;
  onRefresh?: () => void;
  isLoading?: boolean;
  retryCount?: number;
  showFixRole?: boolean;
}

export const ErrorMessage = ({
  title,
  description,
  onRefresh,
  isLoading = false,
  retryCount = 0,
  showFixRole = false,
}: ErrorMessageProps) => {
  return (
    <div className="container mx-auto py-8">
      <div className="bg-white shadow-lg rounded-lg p-6 border-l-4 border-red-500">
        <div className="flex items-center mb-4 text-red-600">
          <AlertCircle className="h-6 w-6 mr-2" />
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>

        <p className="mb-6 text-gray-700">{description}</p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {onRefresh && (
            <Button
              onClick={onRefresh}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              {retryCount > 0
                ? `Réessayer (${retryCount})`
                : "Actualiser les permissions"}
            </Button>
          )}
          
          {showFixRole && (
            <div className="w-full sm:w-auto">
              <FixRoleButton />
            </div>
          )}
        </div>
        
        {retryCount > 2 && (
          <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
            <p className="font-medium mb-1">Plusieurs tentatives ont échoué</p>
            <p>
              Le problème peut être lié aux permissions dans la base de données ou à la configuration du rôle utilisateur.
              Si vous êtes l'administrateur spécial, essayez le mode forcé depuis la page principale.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
