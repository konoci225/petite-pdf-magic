
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Wrench, Clock, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { FileUploader } from "@/components/tools/FileUploader";
import { useToast } from "@/hooks/use-toast";

const SubscriberHome = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleUploadComplete = () => {
    toast({
      title: "Fichier téléchargé",
      description: "Votre fichier a été téléchargé avec succès",
    });
    navigate("/my-files");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Bienvenue sur votre Espace Premium</h1>
        <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-sm">
          Abonné
        </Badge>
      </div>
      
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-center">Déposez vos fichiers PDF ici</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <FileUploader 
            onUploadComplete={handleUploadComplete}
            maxFiles={10} 
            acceptedFileTypes={[".pdf", ".docx", ".doc", ".xlsx", ".xls", ".pptx", ".ppt"]}
          />
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Ou sélectionnez un outil ci-dessous pour démarrer
          </p>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Fichiers Traités</CardTitle>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">27</div>
            <p className="text-xs text-muted-foreground">Ce mois-ci</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Outils Utilisés</CardTitle>
            <Wrench className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Sur 7 disponibles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Abonnement</CardTitle>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-md font-bold text-green-600">Actif</div>
            <p className="text-xs text-muted-foreground">Expire le 15/05/2025</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mt-8">Outils Premium</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Fusion de PDF</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Combinez plusieurs fichiers PDF en un seul document.</p>
            <Button onClick={() => navigate("/merge")} className="w-full">
              Utiliser
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Division de PDF</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Divisez un PDF en plusieurs fichiers séparés.</p>
            <Button onClick={() => navigate("/split")} className="w-full">
              Utiliser
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Compression PDF</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Réduisez la taille de vos fichiers PDF sans perdre en qualité.</p>
            <Button onClick={() => navigate("/compress")} className="w-full">
              Utiliser
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center mt-4">
        <Button onClick={() => navigate("/premium-tools")} variant="outline">
          Voir tous les outils premium
        </Button>
      </div>
    </div>
  );
};

export default SubscriberHome;
