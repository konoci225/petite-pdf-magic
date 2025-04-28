
import { useState } from "react";
import { FileText, Eye, Download, Trash2, MoreVertical } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FileItem {
  id: string;
  file_name: string;
  file_type: string;
  created_at: string;
  user_id: string;
  storage_path: string | null;
  user_email?: string;
}

interface FilesListProps {
  files: FileItem[];
  onFilesChange: () => void;
}

export const FilesList = ({ files, onFilesChange }: FilesListProps) => {
  const { toast } = useToast();
  
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
  
  const handleDelete = async (id: string) => {
    try {
      const { data: fileData, error: fileError } = await supabase
        .from('files')
        .select('storage_path')
        .eq('id', id)
        .single();
      
      if (fileError) throw fileError;
      
      if (fileData && fileData.storage_path) {
        const { error: storageError } = await supabase.storage
          .from('files')
          .remove([fileData.storage_path]);
        
        if (storageError) throw storageError;
      }
      
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Fichier supprimé",
        description: "Le fichier a été supprimé avec succès",
      });
      
      onFilesChange();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le fichier: " + error.message,
        variant: "destructive",
      });
    }
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <FileText className="h-12 w-12 mx-auto text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun fichier trouvé</h3>
        <p className="mt-2 text-gray-500">
          Aucun fichier ne correspond à votre recherche
        </p>
      </div>
    );
  }
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom du fichier</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Utilisateur</TableHead>
            <TableHead>Date de création</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.id}>
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-blue-500" />
                  {file.file_name}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="uppercase">
                  {file.file_type}
                </Badge>
              </TableCell>
              <TableCell>{file.user_email}</TableCell>
              <TableCell>{formatDate(file.created_at)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem className="flex items-center">
                      <Eye className="h-4 w-4 mr-2" />
                      Visualiser
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="flex items-center text-red-600"
                      onClick={() => handleDelete(file.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
