
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useUserRole } from "@/hooks/useUserRole";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileSearch } from "@/components/files/FileSearch";
import { FilesList } from "@/components/files/FilesList";
import { StorageStats } from "@/components/files/StorageStats";
import { Loader2 } from "lucide-react";

interface FileItem {
  id: string;
  file_name: string;
  file_type: string;
  created_at: string;
  user_id: string;
  storage_path: string | null;
  user_email?: string;
}

const FilesPage = () => {
  const { role, isLoading: roleLoading } = useUserRole();
  const { toast } = useToast();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [fileTypeFilter, setFileTypeFilter] = useState("all");
  const [totalStorage, setTotalStorage] = useState(0);
  const [fileTypeCount, setFileTypeCount] = useState<{[key: string]: number}>({});

  if (!roleLoading && role !== "super_admin") {
    return <Navigate to="/dashboard" />;
  }

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('files')
        .select(`
          id, 
          file_name, 
          file_type, 
          created_at, 
          user_id, 
          storage_path
        `);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const filesWithUserEmail = await Promise.all(data.map(async (file) => {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', file.user_id)
            .single();
          
          return {
            ...file,
            user_email: userData ? `user-${userData.id.substring(0, 8)}` : 'Unknown User'
          };
        }));
        
        setFiles(filesWithUserEmail);
        
        const avgFileSizeMB = 3;
        setTotalStorage(filesWithUserEmail.length * avgFileSizeMB);
        
        const typeCounts: {[key: string]: number} = {};
        filesWithUserEmail.forEach(file => {
          const type = file.file_type || 'unknown';
          typeCounts[type] = (typeCounts[type] || 0) + 1;
        });
        setFileTypeCount(typeCounts);
      } else {
        setFiles([]);
        setTotalStorage(0);
        setFileTypeCount({});
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer la liste des fichiers: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (file.user_email && file.user_email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = fileTypeFilter === "all" || file.file_type === fileTypeFilter;
    
    return matchesSearch && matchesType;
  });

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Gestion des fichiers</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Fichiers stockés sur la plateforme</CardTitle>
            <CardDescription>
              Consultez et gérez tous les fichiers téléchargés par les utilisateurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileSearch 
              searchTerm={searchTerm}
              fileTypeFilter={fileTypeFilter}
              onSearchChange={setSearchTerm}
              onFileTypeChange={setFileTypeFilter}
              onRefresh={fetchFiles}
            />

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <FilesList 
                files={filteredFiles} 
                onFilesChange={fetchFiles} 
              />
            )}
          </CardContent>
          <CardFooter className="justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Affichage de {filteredFiles.length} fichiers sur {files.length} au total
              </p>
            </div>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Statistiques de stockage</CardTitle>
            <CardDescription>
              Informations générales sur l'utilisation de l'espace de stockage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StorageStats 
              totalStorage={totalStorage} 
              fileTypeCount={fileTypeCount} 
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default FilesPage;
