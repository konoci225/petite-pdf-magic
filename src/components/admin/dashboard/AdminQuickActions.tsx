
import { Button } from "@/components/ui/button";
import { Info, RefreshCw, Loader2 } from "lucide-react";

interface AdminQuickActionsProps {
  isKonointer: boolean;
  isInitializing: boolean;
  onRunDiagnostic: () => void;
  onInitializeModules: () => void;
}

const AdminQuickActions = ({ 
  isKonointer,
  isInitializing,
  onRunDiagnostic,
  onInitializeModules
}: AdminQuickActionsProps) => {
  if (!isKonointer) return null;

  return (
    <div className="flex justify-end mb-4 gap-2">
      <Button 
        variant="ghost" 
        size="sm"
        onClick={onRunDiagnostic}
        className="text-blue-600 text-xs"
      >
        <Info className="h-3.5 w-3.5 mr-1" />
        Diagnostic système
      </Button>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={onInitializeModules}
        className="text-green-600 text-xs"
        disabled={isInitializing}
      >
        {isInitializing ? (
          <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
        ) : (
          <RefreshCw className="h-3.5 w-3.5 mr-1" />
        )}
        Initialiser modules
      </Button>
    </div>
  );
};

export default AdminQuickActions;
