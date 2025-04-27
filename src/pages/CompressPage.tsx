
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import FileUploader from "@/components/tools/FileUploader";
import FileItem from "@/components/tools/FileItem";
import { Button } from "@/components/ui/button";
import { FileImage } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";

const CompressPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<number>(75);
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

  const getCompressionLabel = (value: number) => {
    if (value <= 25) return "Maximum (qualité inférieure)";
    if (value <= 50) return "Forte (bon équilibre)";
    if (value <= 75) return "Moyenne (qualité préservée)";
    return "Légère (haute qualité)";
  };

  const handleCompress = () => {
    if (!file) {
      toast({
        title: "Aucun fichier sélectionné",
        description: "Veuillez sélectionner un fichier PDF à compresser.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      toast({
        title: "PDF compressé",
        description: "Votre fichier PDF a été compressé avec succès.",
      });
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Compresser PDF</h1>
          <p className="text-gray-600 mb-8">
            Réduisez la taille de votre fichier PDF tout en préservant sa qualité.
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
                <h3 className="text-lg font-medium mb-4">Fichier à compresser</h3>
                <FileItem file={file} onRemove={handleRemoveFile} />
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">Niveau de compression</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Compression maximale</span>
                    <span>Qualité maximale</span>
                  </div>
                  <Slider
                    value={[compressionLevel]}
                    onValueChange={(values) => setCompressionLevel(values[0])}
                    min={0}
                    max={100}
                    step={25}
                    className="mb-2"
                  />
                  <div className="text-center font-medium text-pdf-primary">
                    {getCompressionLabel(compressionLevel)}
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    {compressionLevel <= 50 
                      ? "Une compression plus élevée peut réduire la qualité des images et des graphiques."
                      : "Cette option préserve une meilleure qualité mais avec une réduction de taille moindre."}
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleCompress}
                  disabled={isProcessing}
                  className="gap-2"
                >
                  {isProcessing ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <FileImage className="h-5 w-5" />
                  )}
                  {isProcessing ? "Compression en cours..." : "Compresser le PDF"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CompressPage;
