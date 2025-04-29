
import React from "react";
import Layout from "@/components/layout/Layout";
import { useUserRole } from "@/hooks/useUserRole";
import { Navigate } from "react-router-dom";
import { 
  FileText, 
  Scissors, 
  Compass, 
  Eye, 
  Upload, 
  Download,
  Lock,
  FileSignature,
  FileWord,
  FileImage,
  FileSpreadsheet,
  FilePresentation
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PremiumTool {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  path: string;
  comingSoon?: boolean;
}

const PremiumToolsPage = () => {
  const { role, isLoading } = useUserRole();
  const navigate = useNavigate();
  
  if (!isLoading && role !== "subscriber" && role !== "super_admin") {
    return <Navigate to="/subscription" />;
  }

  const premiumTools: PremiumTool[] = [
    {
      id: "merge-pro",
      name: "Fusion de PDF Pro",
      description: "Combinez un nombre illimité de fichiers PDF, réorganisez les pages et ajoutez des métadonnées.",
      icon: FileText,
      path: "/merge"
    },
    {
      id: "split",
      name: "Division de PDF",
      description: "Divisez un PDF en plusieurs fichiers ou extrayez des pages spécifiques.",
      icon: Scissors,
      path: "/split"
    },
    {
      id: "compress-pro",
      name: "Compression PDF Avancée",
      description: "Réduisez la taille de vos fichiers PDF avec des options de qualité personnalisables.",
      icon: Compass,
      path: "/compress"
    },
    {
      id: "ocr",
      name: "OCR PDF",
      description: "Convertissez des images PDF en texte éditable et recherchable.",
      icon: Eye,
      path: "/ocr"
    },
    {
      id: "edit",
      name: "Édition PDF",
      description: "Modifiez le texte et les images de vos documents PDF directement.",
      icon: Upload,
      path: "/edit"
    },
    {
      id: "signature",
      name: "Signature PDF",
      description: "Ajoutez des signatures électroniques à vos documents PDF.",
      icon: FileSignature,
      path: "/signature"
    },
    {
      id: "pdf-to-word",
      name: "PDF en Word",
      description: "Convertissez vos documents PDF en fichiers Word éditables.",
      icon: FileWord,
      path: "/pdf-to-word"
    },
    {
      id: "pdf-to-excel",
      name: "PDF en Excel",
      description: "Convertissez vos tableaux PDF en feuilles de calcul Excel.",
      icon: FileSpreadsheet,
      path: "/pdf-to-excel"
    },
    {
      id: "pdf-to-powerpoint",
      name: "PDF en PowerPoint",
      description: "Convertissez vos présentations PDF en fichiers PowerPoint.",
      icon: FilePresentation,
      path: "/pdf-to-powerpoint"
    },
    {
      id: "pdf-to-jpg",
      name: "PDF en JPG",
      description: "Convertissez les pages de votre PDF en images JPG.",
      icon: FileImage,
      path: "/pdf-to-jpg"
    },
    {
      id: "word-to-pdf",
      name: "Word en PDF",
      description: "Convertissez vos documents Word en PDF de haute qualité.",
      icon: FileText,
      path: "/word-to-pdf"
    },
    {
      id: "excel-to-pdf",
      name: "Excel en PDF",
      description: "Convertissez vos feuilles de calcul Excel en PDF.",
      icon: FileText,
      path: "/excel-to-pdf"
    },
    {
      id: "powerpoint-to-pdf",
      name: "PowerPoint en PDF",
      description: "Convertissez vos présentations PowerPoint en PDF.",
      icon: FileText,
      path: "/powerpoint-to-pdf"
    },
    {
      id: "jpg-to-pdf",
      name: "JPG en PDF",
      description: "Convertissez vos images JPG en documents PDF.",
      icon: FileText,
      path: "/jpg-to-pdf"
    },
    {
      id: "watermark",
      name: "Filigrane PDF",
      description: "Ajoutez des filigranes personnalisés à vos documents PDF.",
      icon: FileText,
      path: "/watermark",
      comingSoon: true
    },
    {
      id: "password",
      name: "Protection par mot de passe",
      description: "Sécurisez vos PDF avec un mot de passe et des restrictions d'édition.",
      icon: Lock,
      path: "/password",
      comingSoon: true
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Outils Premium</h1>
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-sm">
            Accès Premium
          </Badge>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <p className="text-blue-700">
            En tant qu'abonné premium, vous avez accès à toute notre suite d'outils avancés. Découvrez toutes les fonctionnalités disponibles ci-dessous.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {premiumTools.map((tool) => (
            <Card key={tool.id} className={tool.comingSoon ? "bg-gray-50 border-dashed" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="flex items-center gap-2">
                    {tool.name}
                    {tool.comingSoon && (
                      <Badge variant="outline" className="ml-2">
                        Bientôt disponible
                      </Badge>
                    )}
                  </CardTitle>
                  <tool.icon className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <p>{tool.description}</p>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  variant={tool.comingSoon ? "outline" : "default"}
                  disabled={tool.comingSoon}
                  onClick={() => navigate(tool.path)}
                >
                  {tool.comingSoon ? "Prochainement" : "Utiliser"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default PremiumToolsPage;
