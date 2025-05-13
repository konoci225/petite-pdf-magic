
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Shield } from "lucide-react";
import RoleRepairStatus from './role/RoleRepairStatus';
import { useRoleRepair } from './role/useRoleRepair';

interface FixRoleButtonProps {
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

const FixRoleButton = ({ 
  size = 'default',
  variant = 'outline'
}: FixRoleButtonProps) => {
  const {
    isLoading,
    isSuccess,
    attempts,
    errorMessage,
    showFallbackOption,
    handleRepairRole,
    handleEnableForcedMode,
    isForcedAdminMode
  } = useRoleRepair();

  return (
    <div className="space-y-3">
      <Button 
        onClick={handleRepairRole}
        disabled={isLoading || isSuccess || isForcedAdminMode}
        variant={isSuccess ? "default" : variant}
        size={size}
        className={isSuccess ? "bg-green-600 hover:bg-green-700" : ""}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : isSuccess ? (
          <Shield className="mr-2 h-4 w-4 text-white" />
        ) : (
          <Shield className="mr-2 h-4 w-4" />
        )}
        {isLoading ? "Réparation en cours..." : isSuccess ? "Réparé avec succès" : "Réparer les autorisations"}
      </Button>
      
      <RoleRepairStatus
        errorMessage={errorMessage}
        attempts={attempts}
        isSuccess={isSuccess}
        isForcedAdminMode={isForcedAdminMode}
        showFallbackOption={showFallbackOption}
        onEnableForcedMode={handleEnableForcedMode}
      />
    </div>
  );
};

export default FixRoleButton;
