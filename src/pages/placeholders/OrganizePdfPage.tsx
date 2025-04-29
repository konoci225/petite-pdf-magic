
import React from "react";
import Layout from "@/components/layout/Layout";
import FileUploader from "@/components/tools/FileUploader";
import { Button } from "@/components/ui/button";
import { Layout as LayoutIcon, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FileItem from "@/components/tools/FileItem";
import { useState } from "react";
import { Card } from "@/components/ui/card";

interface PdfPage {
  id: number;
  number: number;
}

const OrganizePdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pages, setPages] = useState<PdfPage[]>([]);
  const { toast } = useToast();

  const handleFilesSelected = (selectedFiles: File[]) => {
    if (selectedFiles.length > 0) {
      setFile(selectedFiles[0]);
      // Simulate extracting pages from PDF
      const dummyPages = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        number: i + 1,
      }));
      setPages(dummyPages);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPages([]);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newPages = [...pages];
    [newPages[index], newPages[index - 1]] = [newPages[index - 1], newPages[index]];
    setPages(newPages);
  };

  const handleMoveDown = (index: number) => {
    if (index === pages.length - 1) return;
    const newPages = [...pages];
    [newPages[index], newPages[index + 1]] = [newPages[index + 1], newPages[index]];
    setPages(newPages);
  };

  const handleRemovePage = (index: number) => {
    const newPages = pages.filter((_, i) => i !== index);
    setPages(newPages);
  };

  const handleProcess = () => {
    if (!file) {
      toast({
        title: "Aucun fichier sélectionné",
        description: "Veuillez sélectionner un fichier PDF pour continuer.",
        variant: "destructive",
      });
      return;
    }

    if (pages.length === 0) {
      toast({
        title: "Aucune page disponible",
        description: "Il n'y a pas de pages à organiser.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      toast({
        title: "PDF réorganisé",
        description: "Les pages de votre PDF ont été réorganisées.",
      });
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Organiser PDF</h1>
          <p className="text-gray-600 mb-8">
            Réorganisez les pages de votre document PDF.
          </p>

          {!file ? (
            <FileUploader
              onFilesSelected={handleFilesSelected}
              multiple={false}
              acceptedFileTypes={[".pdf"]}
            />
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg border">
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">Fichier à organiser</h3>
                <FileItem file={file} onRemove={handleRemoveFile} />
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">Pages</h3>
                <div className="space-y-3">
                  {pages.map((page, index) => (
                    <Card key={page.id} className="p-3 flex justify-between items-center">
                      <div>Page {page.number}</div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === pages.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleRemovePage(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className="gap-2"
                >
                  {isProcessing ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <LayoutIcon className="h-5 w-5" />
                  )}
                  {isProcessing ? "Organisation en cours..." : "Organiser le PDF"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default OrganizePdfPage;
