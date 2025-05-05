
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import FixRoleButton from "@/components/admin/users/FixRoleButton"; // Fixed import syntax
import { useAuth } from "@/providers/AuthProvider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const VisitorHome = () => {
  const { user } = useAuth();
  const isFirstUser = user?.created_at && Date.now() - new Date(user.created_at).getTime() < 3600000; // 1 heure

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bienvenue sur PDF Magic</h1>
        <p className="text-gray-600">
          Découvrez nos outils pour manipuler vos fichiers PDF en toute simplicité.
        </p>
      </div>

      {isFirstUser && (
        <Alert variant="default" className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-amber-800">Problème d'accès administrateur ?</AlertTitle>
          <AlertDescription className="text-amber-700">
            Si vous êtes le premier utilisateur et que vous n'avez pas accès aux fonctionnalités d'administration, 
            cliquez sur le bouton ci-dessous pour réparer vos droits d'accès.
            <div className="mt-2">
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
