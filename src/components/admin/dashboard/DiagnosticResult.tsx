
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

interface DiagnosticResultProps {
  isOpen: boolean;
  data: any;
  onClose: () => void;
}

const DiagnosticResult = ({ isOpen, data, onClose }: DiagnosticResultProps) => {
  if (!isOpen || !data) return null;
  
  const renderStatusIcon = (success: boolean) => {
    return success ? 
      <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
  };
  
  // Extract key status indicators from diagnostic data
  const hasRole = data.roleData?.role === 'super_admin';
  const canAccessModules = data.moduleAccessResult === true;
  const canExecuteRpc = data.rpcAccessResult === true || data.rpcSuccess === true;
  
  return (
    <div className="mt-8 border rounded-lg p-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Rapport de diagnostic</h3>
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
            {renderStatusIcon(data.forcedAdminMode)}
            <span>Mode forcé: {data.forcedAdminMode ? 'Activé' : 'Désactivé'}</span>
          </li>
        </ul>
        
        {/* Recommendations based on diagnostic results */}
        {!canExecuteRpc && (
          <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
            <strong>Recommandation:</strong> Activez le mode forcé d'administration pour contourner les problèmes d'accès.
          </div>
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
