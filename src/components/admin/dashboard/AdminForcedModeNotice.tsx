
import { Button } from "@/components/ui/button";

interface AdminForcedModeNoticeProps {
  isActive: boolean;
  onDisable: () => void;
}

const AdminForcedModeNotice = ({ isActive, onDisable }: AdminForcedModeNoticeProps) => {
  if (!isActive) return null;
  
  return (
    <div className="mb-6 bg-amber-50 border border-amber-200 rounded-md p-4 flex justify-between items-center">
      <div>
        <h3 className="font-medium text-amber-800">Mode administration forcé actif</h3>
        <p className="text-sm text-amber-700">Les vérifications de sécurité sont contournées pour l'accès administrateur.</p>
      </div>
      <Button 
        onClick={onDisable}
        variant="outline"
        size="sm"
        className="border-amber-300 text-amber-800 hover:bg-amber-100"
      >
        Désactiver le mode forcé
      </Button>
    </div>
  );
};

export default AdminForcedModeNotice;
