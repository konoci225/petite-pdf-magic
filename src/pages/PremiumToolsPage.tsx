
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
  File,
  FileImage,
  FileSpreadsheet,
  Presentation,
  Shield,
  Layout as LayoutIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  path: string;
}

const PremiumToolsPage = () => {
  const { role, isLoading } = useUserRole();
  const navigate = useNavigate();
  
  const conversionTools = [
    {
      id: "pdf-to-word",
      name: "PDF en Word",
      description: "Convertissez vos documents PDF en fichiers Word éditables.",
      icon: File,
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
      icon: Presentation,
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
    }
  ];
  
  const advancedTools = [
    {
      id: "merge-pro",
      name: "Fusion de PDF Pro",
      description: "Combinez un nombre illimité de fichiers PDF et organisez les pages.",
      icon: FileText,
      path: "/merge"
    },
    {
      id: "split",
      name: "Division de PDF",
      description: "Divisez un PDF en plusieurs fichiers séparés.",
      icon: Scissors,
      path: "/split"
    },
    {
      id: "ocr",
      name: "OCR PDF",
      description: "Convertissez des images PDF en texte éditable.",
      icon: Eye,
      path: "/ocr"
    },
    {
      id: "signature",
      name: "Signature PDF",
      description: "Ajoutez des signatures numériques à vos documents PDF.",
      icon: FileSignature,
      path: "/sign-pdf"
    },
    {
      id: "edit",
      name: "Édition PDF",
      description: "Modifiez le texte et les images de vos documents PDF.",
      icon: FileText,
      path: "/edit-pdf"
    },
    {
      id: "watermark",
      name: "Filigrane PDF",
      description: "Ajoutez un filigrane à vos documents PDF.",
      icon: LayoutIcon,
      path: "/watermark-pdf"
    },
    {
      id: "protect",
      name: "Protéger PDF",
      description: "Sécurisez vos PDF avec un mot de passe.",
      icon: Shield,
      path: "/protect-pdf"
    },
    {
      id: "organize",
      name: "Organiser PDF",
      description: "Réorganisez les pages de votre PDF.",
      icon: LayoutIcon,
      path: "/organize-pdf"
    }
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // If the user is not a subscriber or super_admin, redirect them to the subscription page
  if (role !== 'subscriber' && role !== 'super_admin') {
    return <Navigate to="/subscription" />;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Outils Premium</h1>
            <p className="text-gray-600">Accédez à tous nos outils avancés pour la gestion de vos documents PDF.</p>
          </div>
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1">
            Premium
          </Badge>
        </div>

        <Tabs defaultValue="conversion" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="conversion">Conversion</TabsTrigger>
            <TabsTrigger value="advanced">Outils avancés</TabsTrigger>
          </TabsList>

          <TabsContent value="conversion">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {conversionTools.map(tool => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  navigate={navigate}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="advanced">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {advancedTools.map(tool => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  navigate={navigate}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

interface ToolCardProps {
  tool: Tool;
  navigate: (path: string) => void;
}

const ToolCard = ({ tool, navigate }: ToolCardProps) => {
  const Icon = tool.icon;

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {tool.name}
          </CardTitle>
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <p>{tool.description}</p>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => navigate(tool.path)} 
          className="w-full"
        >
          Utiliser cet outil
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PremiumToolsPage;
