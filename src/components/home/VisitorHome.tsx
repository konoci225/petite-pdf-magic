
import React from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// Corrigons l'importation problématique
import FixRoleButton from "@/components/admin/users/FixRoleButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileText, Wrench } from "lucide-react";

const VisitorHome = () => {
  const { user } = useAuth();
  const { role } = useUserRole();
  const isSpecialUser = user?.email === "konointer@gmail.com";
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Bonjour, bienvenue !</h1>
        <p className="text-muted-foreground">
          Votre compte dispose actuellement d'un accès visiteur. Découvrez nos outils de base ci-dessous.
        </p>
      </div>
      
      {isSpecialUser && role !== "super_admin" && (
        <Alert variant="warning">
          <AlertTitle>Compte administrateur détecté</AlertTitle>
          <AlertDescription className="flex flex-col gap-4">
            <p>
              Votre compte devrait avoir des privilèges administrateur, mais il semble que votre rôle ne soit pas correctement configuré.
            </p>
            <div className="flex gap-2">
              <FixRoleButton />
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Fusion PDF</CardTitle>
            <CardDescription>
              Combinez plusieurs fichiers PDF en un seul document.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Téléchargez plusieurs fichiers PDF et fusionnez-les instantanément.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="default" className="w-full" onClick={() => window.location.href = '/merge'}>
              Fusionner des PDF
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Division PDF</CardTitle>
            <CardDescription>
              Séparez un PDF en plusieurs documents distincts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Divisez votre PDF par pages ou par sections selon vos besoins.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="default" className="w-full" onClick={() => window.location.href = '/split'}>
              Diviser un PDF
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Compression PDF</CardTitle>
            <CardDescription>
              Réduisez la taille de vos fichiers PDF.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Optimisez vos PDFs pour les partager plus facilement.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="default" className="w-full" onClick={() => window.location.href = '/compress'}>
              Compresser un PDF
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default VisitorHome;
