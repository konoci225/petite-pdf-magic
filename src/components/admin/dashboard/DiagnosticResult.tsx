
import { Button } from "@/components/ui/button";

interface DiagnosticResultProps {
  isOpen: boolean;
  data: any;
  onClose: () => void;
}

const DiagnosticResult = ({ isOpen, data, onClose }: DiagnosticResultProps) => {
  if (!isOpen || !data) return null;
  
  return (
    <div className="mt-8 border rounded-lg p-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Rapport de diagnostic</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>Fermer</Button>
      </div>
      <div className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-96">
        <pre className="whitespace-pre-wrap break-words">{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
};

export default DiagnosticResult;
