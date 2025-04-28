
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
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
import { Label } from "@/components/ui/label";
import { Loader2, Save, Mail, User, Shield, AlertTriangle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { role } = useUserRole();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const fetchProfileData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // In a real app, you would fetch the user profile from your database
      // Here we're just simulating it
      setTimeout(() => {
        setProfile({
          ...profile,
          firstName: 'John', // Simulated data
          lastName: 'Doe',   // Simulated data
          email: user.email || '',
        });
        setIsLoading(false);
      }, 500);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger votre profil: " + error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value,
    });
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour votre profil: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (profile.newPassword !== profile.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: profile.newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été changé avec succès.",
      });
      
      // Reset password fields
      setProfile({
        ...profile,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour votre mot de passe: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    // In a real application, this would delete the user's account
    toast({
      title: "Compte supprimé",
      description: "Votre compte a été supprimé avec succès.",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Mon profil</h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="profile">
                <User className="h-4 w-4 mr-2" />
                Informations personnelles
              </TabsTrigger>
              <TabsTrigger value="security">
                <Shield className="h-4 w-4 mr-2" />
                Sécurité
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Informations personnelles</CardTitle>
                  <CardDescription>
                    Mettez à jour vos informations personnelles ici.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleProfileUpdate}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="flex items-center border rounded-md bg-gray-50 px-3 py-2">
                        <Mail className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{profile.email}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        L'email ne peut pas être modifié.
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={profile.firstName}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={profile.lastName}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <Label>Votre rôle</Label>
                      {role === 'super_admin' && (
                        <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                          Super Administrateur
                        </Badge>
                      )}
                      {role === 'subscriber' && (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                          Abonné
                        </Badge>
                      )}
                      {role === 'visitor' && (
                        <Badge variant="secondary" className="bg-gray-50 text-gray-700">
                          Visiteur
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Enregistrer les modifications
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            <TabsContent value="security">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Modifier le mot de passe</CardTitle>
                    <CardDescription>
                      Mettez à jour votre mot de passe pour sécuriser votre compte.
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handlePasswordChange}>
                    <CardContent className="space-y-4">
                      <div className="space-y-1">
                        <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          value={profile.currentPassword}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          value={profile.newPassword}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={profile.confirmPassword}
                          onChange={handleInputChange}
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Modification...
                          </>
                        ) : (
                          "Modifier le mot de passe"
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
                
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-500 flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Supprimer mon compte
                    </CardTitle>
                    <CardDescription>
                      Cette action est irréversible. Toutes vos données seront supprimées définitivement.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      La suppression de votre compte entraînera la perte de toutes vos données, y compris vos fichiers et votre historique.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          Supprimer mon compte
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. Elle supprimera définitivement votre compte
                            et toutes les données associées de nos serveurs.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={handleDeleteAccount}
                          >
                            Supprimer définitivement
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
};

export default ProfilePage;
