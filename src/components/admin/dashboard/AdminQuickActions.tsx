
import { Button } from "@/components/ui/button";
import { Info, RefreshCw, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { useState } from "react";

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
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);
  
  const handleRunDiagnostic = async () => {
    setIsDiagnosticRunning(true);
    try {
      await onRunDiagnostic();
    } finally {
      setIsDiagnosticRunning(false);
    }
  };

  if (!isKonointer) return null;

  return (
    <div className="flex justify-end mb-4 gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleRunDiagnostic}
        className="text-blue-600 text-xs flex items-center"
        disabled={isDiagnosticRunning}
      >
        {isDiagnosticRunning ? (
          <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
        ) : (
          <Info className="h-3.5 w-3.5 mr-1" />
        )}
        Diagnostic système
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={onInitializeModules}
        className="text-green-600 text-xs flex items-center"
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
