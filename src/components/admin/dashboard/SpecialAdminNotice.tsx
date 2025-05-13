
import { Button } from "@/components/ui/button";
import { Info, ShieldCheck, Loader2 } from "lucide-react";
import { useState } from "react";

interface SpecialAdminNoticeProps {
  isVisible: boolean;
  onRunDiagnostic: () => void;
  onEnableForcedMode: () => void;
}

const SpecialAdminNotice = ({ 
  isVisible, 
  onRunDiagnostic, 
  onEnableForcedMode 
}: SpecialAdminNoticeProps) => {
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);
  
  const handleDiagnostic = async () => {
    setIsDiagnosticRunning(true);
    try {
      await onRunDiagnostic();
    } finally {
      setIsDiagnosticRunning(false);
    }
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4 flex justify-between items-center">
      <div>
        <h3 className="font-medium text-blue-800 flex items-center">
          <Info className="h-4 w-4 mr-2" />
          Vous êtes connecté en tant qu'administrateur spécial
        </h3>
        <p className="text-sm text-blue-700 mt-1">
          Si vous rencontrez des problèmes d'accès, utilisez le mode forcé ou le diagnostic.
        </p>
      </div>
      <div className="flex gap-2">
        <Button 
          onClick={handleDiagnostic}
          variant="outline"
          size="sm"
          className="border-blue-300 text-blue-800 hover:bg-blue-100 gap-1"
          disabled={isDiagnosticRunning}
        >
          {isDiagnosticRunning ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : (
            <Info className="mr-1 h-4 w-4" />
          )}
          Diagnostic
        </Button>
        <Button 
          onClick={onEnableForcedMode}
          variant="outline"
          size="sm"
          className="border-amber-300 text-amber-800 hover:bg-amber-100 gap-1"
        >
          <ShieldCheck className="mr-1 h-4 w-4" />
          Activer mode forcé
        </Button>
      </div>
    </div>
  );
};

export default SpecialAdminNotice;
