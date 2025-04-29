
import React from "react";
import Layout from "@/components/layout/Layout";
import FileUploader from "@/components/tools/FileUploader";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FileItem from "@/components/tools/FileItem";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ProtectPdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

    if (!password) {
      toast({
        title: "Mot de passe manquant",
        description: "Veuillez saisir un mot de passe.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Les mots de passe ne correspondent pas",
        description: "Veuillez saisir des mots de passe identiques.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      toast({
        title: "PDF protégé",
        description: "Votre document PDF est maintenant protégé par mot de passe.",
      });
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Protéger PDF</h1>
          <p className="text-gray-600 mb-8">
            Sécurisez votre document PDF avec un mot de passe.
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
                <h3 className="text-lg font-medium mb-4">Fichier à protéger</h3>
                <FileItem file={file} onRemove={handleRemoveFile} />
              </div>

              <div className="mb-4">
                <Label htmlFor="password">Mot de passe</Label>
                <Input 
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Saisissez un mot de passe"
                  className="mt-2"
                />
              </div>

              <div className="mb-6">
                <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                <Input 
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmez le mot de passe"
                  className="mt-2"
                />
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
                    <Shield className="h-5 w-5" />
                  )}
                  {isProcessing ? "Protection en cours..." : "Protéger le PDF"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProtectPdfPage;
