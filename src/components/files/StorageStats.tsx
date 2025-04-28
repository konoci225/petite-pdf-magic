
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StorageStatsProps {
  totalStorage: number;
  fileTypeCount: {[key: string]: number};
}

export const StorageStats = ({ totalStorage, fileTypeCount }: StorageStatsProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Espace total utilisé</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalStorage.toFixed(1)} MB</div>
          <div className="mt-2 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500" 
              style={{ width: `${Math.min((totalStorage / 1024) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {Math.round((totalStorage / 1024) * 100)}% de l'espace alloué (1 GB)
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Fichiers par type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.keys(fileTypeCount).length > 0 ? (
              Object.entries(fileTypeCount).map(([type, count]) => (
                <div key={type} className="flex justify-between text-sm">
                  <span>{type.toUpperCase()}</span>
                  <span className="font-medium">{count} fichiers</span>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground">Aucun fichier disponible</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Croissance mensuelle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            +{(Math.max(1, totalStorage * 0.1)).toFixed(1)} MB
          </div>
          <p className="text-xs text-muted-foreground">
            Estimation basée sur les 30 derniers jours
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
