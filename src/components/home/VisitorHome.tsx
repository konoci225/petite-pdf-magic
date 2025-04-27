
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Wrench, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const VisitorHome = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Bienvenue sur Petite PDF Magic</h1>
        <Badge variant="secondary" className="bg-gray-50 text-gray-700 text-sm">
          Visiteur
        </Badge>
      </div>
      
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-blue-800 mb-2">Passez à l'offre Premium</h2>
            <p className="text-blue-700">
              Accédez à tous nos outils PDF avancés et profitez d'un stockage illimité.
            </p>
          </div>
          <Button onClick={() => navigate("/subscription")} className="shrink-0 bg-blue-600 hover:bg-blue-700">
            S'abonner Maintenant
          </Button>
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold mt-8">Outils Gratuits</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Fusion de PDF (limité)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Combinez jusqu'à 3 fichiers PDF.</p>
            <Button onClick={() => navigate("/merge")} className="w-full">
              Essayer
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Visualiseur PDF</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Consultez vos documents PDF en ligne.</p>
            <Button onClick={() => navigate("/view")} className="w-full">
              Essayer
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Compression PDF (basique)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Réduisez la taille de vos fichiers PDF.</p>
            <Button onClick={() => navigate("/compress")} className="w-full">
              Essayer
            </Button>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mt-8">Outils Premium <span className="text-sm text-muted-foreground">(Nécessite un abonnement)</span></h2>
      <div className="grid gap-4 md:grid-cols-3">
        {["Signature PDF", "OCR PDF", "Édition PDF"].map((tool) => (
          <Card key={tool} className="bg-gray-50 opacity-70">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>{tool}</CardTitle>
                <Star className="h-4 w-4 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Accédez à cet outil avec un abonnement premium.</p>
              <Button 
                onClick={() => navigate("/subscription")} 
                variant="outline" 
                className="w-full border-amber-500 text-amber-700"
              >
                Débloquer
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VisitorHome;
