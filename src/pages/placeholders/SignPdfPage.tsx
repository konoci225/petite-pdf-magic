
import React from "react";
import Layout from "@/components/layout/Layout";
import FileUploader from "@/components/tools/FileUploader";
import { Button } from "@/components/ui/button";
import { FileSignature } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FileItem from "@/components/tools/FileItem";
import { useState } from "react";

const SignPdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
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

  const handleProcess = () => {
    if (!file) {
      toast({
        title: "Aucun fichier sélectionné",
        description: "Veuillez sélectionner un fichier PDF pour continuer.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      toast({
        title: "Signature ajoutée",
        description: "Votre signature a été ajoutée au document PDF.",
      });
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Signer PDF</h1>
          <p className="text-gray-600 mb-8">
            Ajoutez votre signature électronique à votre document PDF.
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
                <h3 className="text-lg font-medium mb-4">Fichier à signer</h3>
                <FileItem file={file} onRemove={handleRemoveFile} />
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
                    <FileSignature className="h-5 w-5" />
                  )}
                  {isProcessing ? "Signature en cours..." : "Signer le document"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SignPdfPage;
