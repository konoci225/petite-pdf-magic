
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Trash2,
  Download,
  MoreVertical,
  Search,
  Filter,
  RefreshCcw,
  Loader2,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  // Redirect if not super_admin
  if (!roleLoading && role !== "super_admin") {
    return <Navigate to="/dashboard" />;
  }

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      // In a real app, we would fetch from Supabase
      // Here we're just simulating data
      setTimeout(() => {
        const mockFiles = [
          {
            id: "1",
            file_name: "rapport-financier-2023.pdf",
            file_type: "pdf",
            created_at: "2023-06-15T10:30:00Z",
            user_id: "user1",
            storage_path: "/storage/rapport-financier-2023.pdf",
            user_email: "john.doe@example.com"
          },
          {
            id: "2",
            file_name: "presentation-produit.pdf",
            file_type: "pdf",
            created_at: "2023-06-14T09:20:00Z",
            user_id: "user2",
            storage_path: "/storage/presentation-produit.pdf",
            user_email: "alice.smith@example.com"
          },
          {
            id: "3",
            file_name: "contrat-client.pdf",
            file_type: "pdf",
            created_at: "2023-06-13T14:45:00Z",
            user_id: "user3",
            storage_path: "/storage/contrat-client.pdf",
            user_email: "robert.johnson@example.com"
          },
          {
            id: "4",
            file_name: "facture-mai-2023.pdf",
            file_type: "pdf",
            created_at: "2023-06-10T11:15:00Z",
            user_id: "user1",
            storage_path: "/storage/facture-mai-2023.pdf",
            user_email: "john.doe@example.com"
          },
          {
            id: "5",
            file_name: "specifications-techniques.pdf",
            file_type: "pdf",
            created_at: "2023-06-08T16:30:00Z",
            user_id: "user4",
            storage_path: "/storage/specifications-techniques.pdf",
            user_email: "emma.wilson@example.com"
          }
        ];
        setFiles(mockFiles);
        setIsLoading(false);
      }, 1000);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer la liste des fichiers: " + error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    toast({
      title: "Fichier supprimé",
      description: "Le fichier a été supprimé avec succès",
    });
    setFiles(files.filter(file => file.id !== id));
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
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un fichier ou un utilisateur..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select 
                  value={fileTypeFilter}
                  onValueChange={setFileTypeFilter}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Type de fichier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="docx">DOCX</SelectItem>
                    <SelectItem value="xlsx">XLSX</SelectItem>
                    <SelectItem value="pptx">PPTX</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={fetchFiles}>
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredFiles.length > 0 ? (
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
                    {filteredFiles.map((file) => (
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
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <FileText className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun fichier trouvé</h3>
                <p className="mt-2 text-gray-500">
                  Aucun fichier ne correspond à votre recherche
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Affichage de {filteredFiles.length} fichiers sur {files.length} au total
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Précédent</Button>
              <Button variant="outline">Suivant</Button>
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
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Espace total utilisé</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">12.7 GB</div>
                  <div className="mt-2 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-[40%] bg-blue-500"></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    40% de l'espace alloué (30 GB)
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Fichiers par type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>PDF</span>
                      <span className="font-medium">876 fichiers</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>DOCX</span>
                      <span className="font-medium">245 fichiers</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>XLSX</span>
                      <span className="font-medium">187 fichiers</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Autres</span>
                      <span className="font-medium">145 fichiers</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Croissance mensuelle</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">+2.4 GB</div>
                  <p className="text-xs text-green-500">
                    +18% par rapport au mois dernier
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default FilesPage;
