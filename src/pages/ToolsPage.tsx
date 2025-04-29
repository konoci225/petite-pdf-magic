
import React from "react";
import Layout from "@/components/layout/Layout";
import { useUserRole } from "@/hooks/useUserRole";
import { 
  FileText, 
  Scissors, 
  Compass, 
  Eye, 
  Upload, 
  Download,
  Lock,
  File,
  FileImage,
  FileSpreadsheet,
  Presentation,
  FileSignature
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
  isPremium: boolean;
}

const ToolsPage = () => {
  const { role, isLoading } = useUserRole();
  const navigate = useNavigate();

  const isSubscriber = role === "subscriber" || role === "super_admin";

  const freeTools: Tool[] = [
    {
      id: "merge-basic",
      name: "Fusion de PDF (limité)",
      description: "Combinez jusqu'à 3 fichiers PDF gratuitement.",
      icon: FileText,
      path: "/merge",
      isPremium: false
    },
    {
      id: "view",
      name: "Visualiseur PDF",
      description: "Consultez vos documents PDF en ligne gratuitement.",
      icon: Eye,
      path: "/view",
      isPremium: false
    },
    {
      id: "compress-basic",
      name: "Compression PDF (basique)",
      description: "Réduisez la taille de vos fichiers PDF avec une qualité basique.",
      icon: Compass,
      path: "/compress",
      isPremium: false
    }
  ];

  const premiumTools: Tool[] = [
    {
      id: "merge-pro",
      name: "Fusion de PDF Pro",
      description: "Combinez un nombre illimité de fichiers PDF et organisez les pages.",
      icon: FileText,
      path: "/merge",
      isPremium: true
    },
    {
      id: "split",
      name: "Division de PDF",
      description: "Divisez un PDF en plusieurs fichiers séparés.",
      icon: Scissors,
      path: "/split",
      isPremium: true
    },
    {
      id: "compress-pro",
      name: "Compression PDF Pro",
      description: "Réduisez la taille de vos fichiers PDF avec des options avancées.",
      icon: Compass,
      path: "/compress",
      isPremium: true
    },
    {
      id: "ocr",
      name: "OCR PDF",
      description: "Convertissez des images PDF en texte éditable.",
      icon: Eye,
      path: "/ocr",
      isPremium: true
    },
    {
      id: "signature",
      name: "Signature PDF",
      description: "Ajoutez des signatures numériques à vos documents PDF.",
      icon: FileSignature,
      path: "/signature",
      isPremium: true
    },
    {
      id: "edit",
      name: "Édition PDF",
      description: "Modifiez le texte et les images de vos documents PDF.",
      icon: FileText,
      path: "/edit",
      isPremium: true
    },
    {
      id: "pdf-to-word",
      name: "PDF en Word",
      description: "Convertissez vos documents PDF en fichiers Word éditables.",
      icon: File,
      path: "/pdf-to-word",
      isPremium: true
    },
    {
      id: "pdf-to-excel",
      name: "PDF en Excel",
      description: "Convertissez vos tableaux PDF en feuilles de calcul Excel.",
      icon: FileSpreadsheet,
      path: "/pdf-to-excel",
      isPremium: true
    },
    {
      id: "pdf-to-powerpoint",
      name: "PDF en PowerPoint",
      description: "Convertissez vos présentations PDF en fichiers PowerPoint.",
      icon: Presentation,
      path: "/pdf-to-powerpoint",
      isPremium: true
    },
    {
      id: "pdf-to-jpg",
      name: "PDF en JPG",
      description: "Convertissez les pages de votre PDF en images JPG.",
      icon: FileImage,
      path: "/pdf-to-jpg",
      isPremium: true
    },
    {
      id: "word-to-pdf",
      name: "Word en PDF",
      description: "Convertissez vos documents Word en PDF de haute qualité.",
      icon: FileText,
      path: "/word-to-pdf",
      isPremium: true
    },
    {
      id: "excel-to-pdf",
      name: "Excel en PDF",
      description: "Convertissez vos feuilles de calcul Excel en PDF.",
      icon: FileText,
      path: "/excel-to-pdf",
      isPremium: true
    },
    {
      id: "powerpoint-to-pdf",
      name: "PowerPoint en PDF",
      description: "Convertissez vos présentations PowerPoint en PDF.",
      icon: FileText,
      path: "/powerpoint-to-pdf",
      isPremium: true
    },
    {
      id: "jpg-to-pdf",
      name: "JPG en PDF",
      description: "Convertissez vos images JPG en documents PDF.",
      icon: FileText,
      path: "/jpg-to-pdf",
      isPremium: true
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

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Outils PDF</h1>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">Tous les outils</TabsTrigger>
            <TabsTrigger value="free">Outils gratuits</TabsTrigger>
            {isSubscriber && (
              <TabsTrigger value="premium">Outils premium</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="all">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {freeTools.map(tool => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  navigate={navigate}
                  isSubscriber={isSubscriber}
                />
              ))}
              
              {premiumTools.map(tool => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  navigate={navigate}
                  isSubscriber={isSubscriber}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="free">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {freeTools.map(tool => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  navigate={navigate}
                  isSubscriber={isSubscriber}
                />
              ))}
            </div>
          </TabsContent>

          {isSubscriber && (
            <TabsContent value="premium">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {premiumTools.map(tool => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    navigate={navigate}
                    isSubscriber={isSubscriber}
                  />
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

interface ToolCardProps {
  tool: Tool;
  navigate: (path: string) => void;
  isSubscriber: boolean;
}

const ToolCard = ({ tool, navigate, isSubscriber }: ToolCardProps) => {
  const handleClick = () => {
    if (tool.isPremium && !isSubscriber) {
      navigate("/subscription");
    } else {
      navigate(tool.path);
    }
  };

  const Icon = tool.icon;

  return (
    <Card className={`${tool.isPremium && !isSubscriber ? 'bg-gray-50 opacity-80' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {tool.name}
            {tool.isPremium && (
              <Badge variant="secondary" className="bg-amber-50 text-amber-700 ml-2">
                Premium
              </Badge>
            )}
          </CardTitle>
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <p>{tool.description}</p>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleClick} 
          className="w-full"
          variant={tool.isPremium && !isSubscriber ? "outline" : "default"}
        >
          {tool.isPremium && !isSubscriber ? (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Débloquer
            </>
          ) : (
            "Utiliser"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ToolsPage;
