
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, Shield } from "lucide-react";

interface RoleRepairStatusProps {
  errorMessage: string | null;
  attempts: number;
  isSuccess: boolean;
  isForcedAdminMode: boolean;
  showFallbackOption: boolean;
  onEnableForcedMode: () => void;
}

const RoleRepairStatus = ({
  errorMessage,
  attempts,
  isSuccess,
  isForcedAdminMode,
  showFallbackOption,
  onEnableForcedMode
}: RoleRepairStatusProps) => {
  return (
    <div className="space-y-3">
      {isForcedAdminMode && (
        <Alert variant="default" className="text-xs p-3 bg-amber-50 border-amber-300 text-amber-800">
          <Info className="h-4 w-4" />
          <AlertTitle className="text-xs font-medium">Mode forcé actif</AlertTitle>
          <AlertDescription className="text-xs">
            Le mode administrateur forcé est déjà activé. Vous avez accès aux fonctions d'administration.
          </AlertDescription>
        </Alert>
      )}
      
      {errorMessage && (
        <div className="text-xs bg-yellow-50 border border-yellow-200 text-yellow-800 p-2 rounded">
          <div className="flex items-center mb-1">
            <AlertTriangle className="h-3 w-3 mr-1" />
            <span className="font-medium">Erreur détectée</span>
          </div>
          <p>{errorMessage}</p>
          <p className="mt-1 text-xs">Essai {attempts}/3</p>
        </div>
      )}
      
      {showFallbackOption && !isSuccess && !isForcedAdminMode && (
        <Alert variant="destructive" className="p-3 mt-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-xs font-medium">Méthodes standards échouées</AlertTitle>
          <AlertDescription className="text-xs">
            Impossible de réparer le rôle via les méthodes standards. Activer le mode administrateur forcé?
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-2 w-full bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
              onClick={onEnableForcedMode}
            >
              <Shield className="mr-1 h-3.5 w-3.5" /> Activer le mode forcé
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default RoleRepairStatus;
