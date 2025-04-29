
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import FileUploader from "@/components/tools/FileUploader";
import FileItem from "@/components/tools/FileItem";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  FileWord,
  FileSpreadsheet,
  FilePresentation,
  FileImage,
  ArrowRight
} from "lucide-react";

interface ConversionPageProps {
  type: string;
  title: string;
}

const ConversionPage: React.FC<ConversionPageProps> = ({ type, title }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Determine accepted file types based on conversion type
  const getAcceptedFileTypes = () => {
    if (type.startsWith("pdf-to")) {
      return [".pdf"];
    } else if (type.startsWith("word-to")) {
      return [".doc", ".docx"];
    } else if (type.startsWith("excel-to")) {
      return [".xls", ".xlsx"];
    } else if (type.startsWith("powerpoint-to")) {
      return [".ppt", ".pptx"];
    } else if (type.startsWith("jpg-to")) {
      return [".jpg", ".jpeg", ".png"];
    }
    return [".pdf"];
  };

  const getSourceIcon = () => {
    if (type.startsWith("pdf-to")) return FileText;
    if (type.startsWith("word-to")) return FileWord;
    if (type.startsWith("excel-to")) return FileSpreadsheet;
    if (type.startsWith("powerpoint-to")) return FilePresentation;
    if (type.startsWith("jpg-to")) return FileImage;
    return FileText;
  };

  const getTargetIcon = () => {
    if (type.includes("-to-word")) return FileWord;
    if (type.includes("-to-excel")) return FileSpreadsheet;
    if (type.includes("-to-powerpoint")) return FilePresentation;
    if (type.includes("-to-jpg")) return FileImage;
    if (type.includes("-to-pdf")) return FileText;
    return FileText;
  };

  const getDescription = () => {
    if (type === "pdf-to-word") {
      return "Convertissez vos documents PDF en fichiers Word éditables.";
    } else if (type === "pdf-to-excel") {
      return "Convertissez vos tableaux PDF en feuilles de calcul Excel.";
    } else if (type === "pdf-to-powerpoint") {
      return "Convertissez vos présentations PDF en fichiers PowerPoint.";
    } else if (type === "pdf-to-jpg") {
      return "Convertissez les pages de votre PDF en images JPG.";
    } else if (type === "word-to-pdf") {
      return "Convertissez vos documents Word en PDF de haute qualité.";
    } else if (type === "excel-to-pdf") {
      return "Convertissez vos feuilles de calcul Excel en PDF.";
    } else if (type === "powerpoint-to-pdf") {
      return "Convertissez vos présentations PowerPoint en PDF.";
    } else if (type === "jpg-to-pdf") {
      return "Convertissez vos images JPG en documents PDF.";
    }
    return "Convertissez votre fichier dans le format de votre choix.";
  };

  const getButtonText = () => {
    if (type.includes("-to-word")) return "Convertir en Word";
    if (type.includes("-to-excel")) return "Convertir en Excel";
    if (type.includes("-to-powerpoint")) return "Convertir en PowerPoint";
    if (type.includes("-to-jpg")) return "Convertir en JPG";
    if (type.includes("-to-pdf")) return "Convertir en PDF";
    return "Convertir";
  };

  const handleFilesSelected = (selectedFiles: File[]) => {
    if (selectedFiles.length > 0) {
      setFile(selectedFiles[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleConvert = () => {
    if (!file) {
      toast({
        title: "Aucun fichier sélectionné",
        description: "Veuillez sélectionner un fichier à convertir.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      toast({
        title: "Conversion réussie",
        description: "Votre fichier a été converti avec succès.",
      });
      setIsProcessing(false);
    }, 1500);
  };

  const SourceIcon = getSourceIcon();
  const TargetIcon = getTargetIcon();

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          <p className="text-gray-600 mb-8">
            {getDescription()}
          </p>

          {!file ? (
            <>
              <div className="flex justify-center items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                  <SourceIcon className="h-8 w-8 text-blue-600" />
                </div>
                <ArrowRight className="h-6 w-6 text-gray-400" />
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                  <TargetIcon className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <FileUploader
                onFilesSelected={handleFilesSelected}
                multiple={false}
                acceptedFileTypes={getAcceptedFileTypes()}
              />
            </>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg border">
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">Fichier à convertir</h3>
                <FileItem file={file} onRemove={handleRemoveFile} />
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleConvert}
                  disabled={isProcessing}
                  className="gap-2"
                >
                  {isProcessing ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <TargetIcon className="h-5 w-5" />
                  )}
                  {isProcessing ? "Conversion en cours..." : getButtonText()}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ConversionPage;
