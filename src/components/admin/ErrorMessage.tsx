
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import FixRoleButton from "@/components/admin/users/FixRoleButton";

interface ErrorMessageProps {
  title: string;
  description: string;
  onRefresh?: () => void;
  showFixRole?: boolean;
  onRefreshRole?: () => void;
  retryCount?: number;
}

export const ErrorMessage = ({
  title,
  description,
  onRefresh,
  showFixRole = false,
  onRefreshRole,
  retryCount
}: ErrorMessageProps) => {
  return (
    <div className="container mx-auto py-8">
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>
          <p>{description}</p>
          <div className="mt-4 flex gap-2">
            {showFixRole && <FixRoleButton />}
            
            {onRefreshRole && (
              <button 
                onClick={onRefreshRole}
                className="text-sm underline"
              >
                Actualiser mon rôle
              </button>
            )}
            
            {onRefresh && (
              <Button 
                onClick={onRefresh}
                className="flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réparer les autorisations
              </Button>
            )}
            
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Rafraîchir la page
            </Button>
          </div>
        </AlertDescription>
      </Alert>
      
      {retryCount !== undefined && retryCount > 0 && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800">
            Tentative de réparation #{retryCount} - Si le problème persiste après plusieurs tentatives, 
            veuillez vérifier les politiques d'accès dans votre base de données Supabase.
          </p>
        </div>
      )}
    </div>
  );
};
