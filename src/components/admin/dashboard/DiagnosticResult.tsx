
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface DiagnosticResultProps {
  isOpen: boolean;
  data: any;
  onClose: () => void;
  onEnableForcedMode?: () => void;
}

const DiagnosticResult = ({ isOpen, data, onClose, onEnableForcedMode }: DiagnosticResultProps) => {
  if (!isOpen || !data) return null;
  
  const renderStatusIcon = (success: boolean) => {
    return success ? 
      <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
  };
  
  // Extract key status indicators from diagnostic data
  const hasRole = data.roleData?.role === 'super_admin' || data.role === 'super_admin';
  const canAccessModules = data.moduleAccessResult === true;
  const canExecuteRpc = data.rpcAccessResult === true || data.rpcSuccess === true;
  const hasSeriousIssues = !canAccessModules || !canExecuteRpc;
  
  return (
    <div className="mt-4 border rounded-lg p-4 bg-white shadow">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">Rapport de diagnostic</h3>
          <Badge variant={hasSeriousIssues ? "destructive" : "outline"} className="text-xs">
            {hasSeriousIssues ? "Problèmes détectés" : "Aucun problème majeur"}
          </Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>Fermer</Button>
      </div>
      
      {/* Quick summary */}
      <div className="mb-4 p-3 bg-gray-50 rounded-md">
        <h4 className="font-medium mb-2">Résumé</h4>
        <ul className="space-y-2">
          <li className="flex items-center gap-2">
            {renderStatusIcon(hasRole)}
            <span>Rôle Super Admin: {hasRole ? 'OK' : 'Non défini'}</span>
          </li>
          <li className="flex items-center gap-2">
            {renderStatusIcon(canAccessModules)}
            <span>Accès aux modules: {canAccessModules ? 'OK' : 'Échec'}</span>
          </li>
          <li className="flex items-center gap-2">
            {renderStatusIcon(canExecuteRpc)}
            <span>Exécution RPC: {canExecuteRpc ? 'OK' : 'Échec'}</span>
          </li>
          <li className="flex items-center gap-2">
            {data.forcedAdminMode ? 
              <ShieldCheck className="h-4 w-4 text-amber-500" /> : 
              <AlertTriangle className="h-4 w-4 text-gray-400" />}
            <span>Mode forcé: {data.forcedAdminMode ? 'Activé' : 'Désactivé'}</span>
          </li>
        </ul>
        
        {/* Recommendations based on diagnostic results */}
        {hasSeriousIssues && (
          <Alert variant="warning" className="mt-3">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Recommandation</AlertTitle>
            <AlertDescription>
              {!data.forcedAdminMode ? (
                <>
                  Activez le mode forcé d'administration pour contourner les problèmes d'accès.
                  {onEnableForcedMode && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="ml-2 mt-1"
                      onClick={onEnableForcedMode}
                    >
                      <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                      Activer
                    </Button>
                  )}
                </>
              ) : (
                "Le mode forcé est déjà actif. Utilisez-le pour gérer les modules et les utilisateurs."
              )}
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      {/* Detailed data */}
      <div className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-96">
        <h4 className="font-medium mb-2">Données détaillées</h4>
        <pre className="whitespace-pre-wrap break-words">{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
};

export default DiagnosticResult;
