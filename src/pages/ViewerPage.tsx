
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import FileUploader from "@/components/tools/FileUploader";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Upload,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ViewerPage = () => {
  const { toast } = useToast();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleUploadComplete = (files: File[]) => {
    if (files && files.length > 0) {
      const file = files[0];
      
      // Create a URL for the file
      const fileUrl = URL.createObjectURL(file);
      setPdfUrl(fileUrl);
      
      toast({
        title: "Fichier chargé",
        description: "Le document est prêt à être visualisé.",
      });
    }
  };

  const handleZoomIn = () => {
    if (zoom < 200) {
      setZoom(zoom + 25);
    }
  };

  const handleZoomOut = () => {
    if (zoom > 50) {
      setZoom(zoom - 25);
    }
  };

  const handleRotateClockwise = () => {
    setRotation((rotation + 90) % 360);
  };

  const handleRotateCounterClockwise = () => {
    setRotation((rotation - 90 + 360) % 360);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const resetViewer = () => {
    setPdfUrl(null);
    setZoom(100);
    setRotation(0);
    setCurrentPage(1);
    setTotalPages(1);
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Visualiseur PDF</h1>

        {!pdfUrl ? (
          <Card>
            <CardHeader>
              <CardTitle>Chargez un document PDF</CardTitle>
              <CardDescription>
                Sélectionnez un fichier PDF pour le visualiser directement dans le navigateur.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploader 
                onUploadComplete={handleUploadComplete} 
                maxFiles={1}
                acceptedFileTypes={[".pdf"]}
              />
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Les fichiers ne sont pas stockés sur nos serveurs, sauf si vous les enregistrez explicitement.
              </p>
            </CardFooter>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <CardTitle>Visualisation du document</CardTitle>
                  <CardDescription>
                    Page {currentPage} sur {totalPages}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleZoomOut}
                    disabled={zoom <= 50}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">{zoom}%</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleZoomIn}
                    disabled={zoom >= 200}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRotateCounterClockwise}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRotateClockwise}
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={resetViewer}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="overflow-hidden">
                <div className="bg-gray-100 rounded-md overflow-auto min-h-[70vh]">
                  <div className="min-h-[70vh] flex items-center justify-center">
                    <div 
                      style={{ 
                        transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                        transition: "transform 0.3s ease" 
                      }}
                    >
                      <iframe
                        src={`${pdfUrl}#page=${currentPage}`}
                        className="w-[800px] h-[600px] border-none"
                        title="PDF Viewer"
                        onLoad={() => {
                          // In a real app, you would calculate total pages
                          setTotalPages(10); // Placeholder
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handlePrevPage}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Précédent
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages}
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div>
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                </div>
              </CardFooter>
            </Card>

            <Alert>
              <FileText className="h-4 w-4" />
              <AlertTitle>Note importante</AlertTitle>
              <AlertDescription>
                Sur certains navigateurs, les contrôles PDF natifs peuvent apparaître. 
                Vous pouvez utiliser soit ces contrôles, soit ceux fournis ci-dessus.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ViewerPage;
