
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FileText, Settings } from "lucide-react";

export const AdminQuickActions = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-wrap gap-4">
      <Button variant="outline" className="gap-2" onClick={() => navigate("/settings")}>
        <Settings className="h-4 w-4" />
        Paramètres
      </Button>
      <Button variant="outline" className="gap-2" onClick={() => navigate("/reports")}>
        <FileText className="h-4 w-4" />
        Rapports
      </Button>
      <Button variant="outline" className="gap-2" onClick={() => navigate("/files")}>
        <FileText className="h-4 w-4" />
        Fichiers
      </Button>
    </div>
  );
};
