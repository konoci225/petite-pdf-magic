
import React from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/providers/AuthProvider";
import { FileText, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileUploader from "@/components/tools/FileUploader";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface FileItem {
  id: string;
  file_name: string;
  file_type: string;
  created_at: string;
}

const MyFilesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      if (user) {
        const { data, error } = await supabase
          .from("files")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setFiles(data || []);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer vos fichiers: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [user]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("files").delete().eq("id", id);
      
      if (error) throw error;
      
      toast({
        title: "Fichier supprimé",
        description: "Le fichier a été supprimé avec succès",
      });
      
      // Update files list
      setFiles(files.filter(file => file.id !== id));
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le fichier: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleUploadComplete = () => {
    fetchFiles();
    toast({
      title: "Chargement réussi",
      description: "Votre fichier a été chargé avec succès",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Mes Fichiers</h1>

        <Tabs defaultValue="files" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="files">Mes fichiers</TabsTrigger>
            <TabsTrigger value="upload">Télécharger un fichier</TabsTrigger>
          </TabsList>
          
          <TabsContent value="files">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : files.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {files.map((file) => (
                  <Card key={file.id} className="overflow-hidden">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        <span className="truncate">{file.file_name}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Type: {file.file_type}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Créé le: {formatDate(file.created_at)}
                      </p>
                    </CardContent>
                    <CardFooter className="bg-slate-50 flex justify-between">
                      <Button variant="outline" size="sm">
                        Télécharger
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleDelete(file.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Supprimer
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <FileText className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun fichier</h3>
                <p className="mt-2 text-gray-500">
                  Vous n'avez pas encore téléchargé de fichiers
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Télécharger un nouveau fichier</CardTitle>
              </CardHeader>
              <CardContent>
                <FileUploader 
                  onUploadComplete={handleUploadComplete} 
                  maxFiles={5}
                  acceptedFileTypes={[".pdf", ".docx", ".doc", ".xlsx", ".xls", ".pptx", ".ppt"]}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MyFilesPage;
