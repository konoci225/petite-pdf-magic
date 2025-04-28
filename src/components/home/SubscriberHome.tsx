
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Wrench, Clock, Upload, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import FileUploader from "@/components/tools/FileUploader";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";

const SubscriberHome = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalFiles: 0,
    toolsUsed: 0,
    subscriptionEnd: ""
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    setIsLoading(true);
    try {
      // Fetch user files
      const { data: files, error: filesError } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', user?.id);
      
      if (filesError) throw filesError;

      // Fetch subscription details
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .maybeSingle();
      
      if (subError) throw subError;

      // Calculate unique tools used (this would normally come from an actions table)
      const toolsUsed = 4; // Placeholder - would normally calculate from usage data

      setStats({
        totalFiles: files?.length || 0,
        toolsUsed: toolsUsed,
        subscriptionEnd: subscription?.end_date ? new Date(subscription.end_date).toLocaleDateString('fr-FR') : "15/05/2025" // Default for demonstration
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (selectedFiles: File[]) => {
    if (!user || selectedFiles.length === 0) return;
    
    try {
      for (const file of selectedFiles) {
        // Generate unique file path
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        
        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('files')
          .upload(filePath, file);
        
        if (uploadError) throw uploadError;
        
        // Create database record
        const { error: dbError } = await supabase
          .from('files')
          .insert([
            {
              file_name: file.name,
              file_type: fileExt,
              user_id: user.id,
              storage_path: filePath
            }
          ]);
        
        if (dbError) throw dbError;
      }
      
      toast({
        title: "Fichier téléchargé",
        description: "Votre fichier a été téléchargé avec succès",
      });
      
      navigate("/my-files");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le fichier: " + error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
            onFilesSelected={handleUpload}
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
            <div className="text-3xl font-bold">{stats.totalFiles}</div>
            <p className="text-xs text-muted-foreground">Au total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Outils Utilisés</CardTitle>
            <Wrench className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.toolsUsed}</div>
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
            <p className="text-xs text-muted-foreground">Expire le {stats.subscriptionEnd}</p>
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
