
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import FileUploader from "@/components/tools/FileUploader";
import FileItem from "@/components/tools/FileItem";
import { Button } from "@/components/ui/button";
import { Scissors } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const SplitPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [splitMethod, setSplitMethod] = useState<"all" | "range" | "specific">("all");
  const [pageRange, setPageRange] = useState<string>("");
  const [specificPages, setSpecificPages] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFilesSelected = (selectedFiles: File[]) => {
    if (selectedFiles.length > 0) {
      setFile(selectedFiles[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleSplit = () => {
    if (!file) {
      toast({
        title: "Aucun fichier sélectionné",
        description: "Veuillez sélectionner un fichier PDF à diviser.",
        variant: "destructive",
      });
      return;
    }

    if (splitMethod === "range" && !pageRange) {
      toast({
        title: "Plage de pages non spécifiée",
        description: "Veuillez entrer une plage de pages valide (ex: 1-3,5-8).",
        variant: "destructive",
      });
      return;
    }

    if (splitMethod === "specific" && !specificPages) {
      toast({
        title: "Pages spécifiques non spécifiées",
        description: "Veuillez entrer les numéros de pages à extraire (ex: 1,3,5).",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      toast({
        title: "PDF divisé",
        description: "Votre fichier PDF a été divisé avec succès.",
      });
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Diviser un PDF</h1>
          <p className="text-gray-600 mb-8">
            Séparez votre PDF en plusieurs fichiers ou extrayez des pages spécifiques.
          </p>

          {!file ? (
            <FileUploader
              onFilesSelected={handleFilesSelected}
              multiple={false}
              accept=".pdf"
            />
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg border">
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">Fichier à diviser</h3>
                <FileItem file={file} onRemove={handleRemoveFile} />
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">Options de division</h3>
                
                <RadioGroup value={splitMethod} onValueChange={(value) => setSplitMethod(value as "all" | "range" | "specific")} className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all">Extraire toutes les pages individuellement</Label>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="range" id="range" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="range">Extraire par plages de pages</Label>
                      <Input
                        id="range"
                        placeholder="Ex: 1-3,5-8"
                        value={pageRange}
                        onChange={(e) => setPageRange(e.target.value)}
                        disabled={splitMethod !== "range"}
                        className="mt-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Format: 1-3,5-8 pour les pages 1 à 3 et 5 à 8
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="specific" id="specific" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="specific">Extraire des pages spécifiques</Label>
                      <Input
                        id="specific"
                        placeholder="Ex: 1,3,5"
                        value={specificPages}
                        onChange={(e) => setSpecificPages(e.target.value)}
                        disabled={splitMethod !== "specific"}
                        className="mt-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Format: 1,3,5 pour extraire uniquement les pages 1, 3 et 5
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleSplit}
                  disabled={isProcessing}
                  className="gap-2"
                >
                  {isProcessing ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Scissors className="h-5 w-5" />
                  )}
                  {isProcessing ? "Division en cours..." : "Diviser le PDF"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SplitPage;
