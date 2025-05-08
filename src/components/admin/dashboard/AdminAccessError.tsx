
import { Shield, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import FixRoleButton from "@/components/admin/users/FixRoleButton";

interface AdminAccessErrorProps {
  user: any;
  role: string | null;
  isSpecialAdmin: boolean;
  onEnableForcedAdminMode: () => void;
  onRunDiagnostic: () => void;
  diagnosticData: any;
  isDiagnosticOpen: boolean;
}

const AdminAccessError = ({ 
  user,
  role,
  isSpecialAdmin,
  onEnableForcedAdminMode,
  onRunDiagnostic,
  diagnosticData,
  isDiagnosticOpen
}: AdminAccessErrorProps) => {
  if (!isSpecialAdmin || role === "super_admin") return null;
  
  return (
    <div className="container mx-auto py-8">
      <div className="bg-white shadow-lg rounded-lg p-6 mb-8 border-l-4 border-amber-500">
        <div className="flex items-center mb-4 text-amber-600">
          <AlertCircle className="h-6 w-6 mr-2" />
          <h2 className="text-xl font-semibold">Problème de droits administrateur détecté</h2>
        </div>
        
        <p className="mb-4">
          Votre compte devrait avoir accès au tableau de bord Super Admin, mais vos droits ne sont pas correctement configurés.
          Vous pouvez essayer de réparer les autorisations ou utiliser le mode d'administration forcé.
        </p>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Option 1: Réparer les autorisations</h3>
            <FixRoleButton size="lg" />
          </div>
          
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Option 2: Mode administration forcé</h3>
            <p className="text-sm text-gray-600 mb-2">
              Ce mode contourne les vérifications de sécurité et vous donne accès au tableau de bord administrateur,
              même si votre rôle n'est pas correctement configuré dans la base de données.
            </p>
            <Button 
              onClick={onEnableForcedAdminMode} 
              variant="outline"
              size="lg"
              className="bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
            >
              <Shield className="mr-2 h-4 w-4" />
              Activer le mode administration forcé
            </Button>
          </div>
          
          <div className="border-t pt-4 flex justify-between">
            <div>
              <h3 className="font-medium mb-2">Détails de diagnostic</h3>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Rôle actuel:</strong> {role || 'Non défini'}</p>
                <p><strong>ID utilisateur:</strong> {user?.id}</p>
              </div>
            </div>
            
            <Button
              onClick={onRunDiagnostic}
              variant="ghost"
              size="sm"
              className="h-8 mt-2 text-blue-600"
            >
              <AlertCircle className="h-4 w-4 mr-1" />
              Diagnostic avancé
            </Button>
          </div>
          
          {isDiagnosticOpen && diagnosticData && (
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                Rapport de diagnostic complet
              </h3>
              <div className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-60">
                <pre className="whitespace-pre-wrap break-words">{JSON.stringify(diagnosticData, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAccessError;
