
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import FileUploader from "@/components/tools/FileUploader";
import FileItem from "@/components/tools/FileItem";
import { Button } from "@/components/ui/button";
import { Merge } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MergePage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newFiles = [...files];
    [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
    setFiles(newFiles);
  };

  const handleMoveDown = (index: number) => {
    if (index === files.length - 1) return;
    const newFiles = [...files];
    [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
    setFiles(newFiles);
  };

  const handleMerge = () => {
    if (files.length < 2) {
      toast({
        title: "Pas assez de fichiers",
        description: "Vous avez besoin d'au moins 2 fichiers PDF pour les fusionner.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    // Here we would normally process the files, but for this demo we'll just simulate it
    setTimeout(() => {
      toast({
        title: "Fichiers fusionnés",
        description: "Vos fichiers PDF ont été fusionnés avec succès.",
      });
      setIsProcessing(false);
      // In a real app, we would provide a download link here
    }, 1500);
  };

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Fusionner des PDFs</h1>
          <p className="text-gray-600 mb-8">
            Combinez plusieurs fichiers PDF en un seul document. Faites glisser et déposez pour réorganiser l'ordre des fichiers.
          </p>

          {files.length === 0 ? (
            <FileUploader
              onFilesSelected={handleFilesSelected}
              multiple={true}
              acceptedFileTypes={[".pdf"]}
            />
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg border">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Fichiers à fusionner</h3>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = ".pdf";
                      input.multiple = true;
                      input.onchange = (e) => {
                        const target = e.target as HTMLInputElement;
                        if (target.files) {
                          const selectedFiles = Array.from(target.files);
                          handleFilesSelected(selectedFiles);
                        }
                      };
                      input.click();
                    }}
                  >
                    Ajouter plus de fichiers
                  </Button>
                </div>

                <div className="space-y-3">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-grow">
                        <FileItem file={file} onRemove={() => handleRemoveFile(index)} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={index === 0}
                          onClick={() => handleMoveUp(index)}
                          className="px-2"
                        >
                          ↑
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={index === files.length - 1}
                          onClick={() => handleMoveDown(index)}
                          className="px-2"
                        >
                          ↓
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleMerge}
                  disabled={files.length < 2 || isProcessing}
                  className="gap-2"
                >
                  {isProcessing ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Merge className="h-5 w-5" />
                  )}
                  {isProcessing ? "Fusion en cours..." : "Fusionner les PDFs"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MergePage;
