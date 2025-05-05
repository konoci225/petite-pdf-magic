
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, ShieldAlert } from "lucide-react";
import FixRoleButton from "@/components/admin/users/FixRoleButton";

interface ErrorMessageProps {
  title: string;
  description: string;
  onRefresh?: () => void;
  retryCount?: number;
  showFixRole?: boolean;
  onRefreshRole?: () => void;
}

export const ErrorMessage = ({
  title,
  description,
  onRefresh,
  retryCount = 0,
  showFixRole = false,
  onRefreshRole
}: ErrorMessageProps) => {
  return (
    <div className="container mx-auto py-16">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-3xl mx-auto">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-red-100 p-3 rounded-full">
            <ShieldAlert className="h-12 w-12 text-red-500" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-4">{title}</h1>
        <p className="text-gray-600 text-center mb-8">{description}</p>
        
        <div className="flex flex-col items-center gap-4">
          {showFixRole ? (
            <div className="w-full max-w-md">
              <FixRoleButton />
            </div>
          ) : onRefresh ? (
            <Button 
              onClick={onRefresh} 
              className="flex items-center gap-2"
              size="lg"
            >
              <RefreshCw className="h-5 w-5" />
              {retryCount > 0 ? `Réessayer (${retryCount})` : "Actualiser et réessayer"}
            </Button>
          ) : null}
          
          {onRefreshRole && (
            <Button 
              variant="outline"
              onClick={onRefreshRole}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser mon rôle
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
