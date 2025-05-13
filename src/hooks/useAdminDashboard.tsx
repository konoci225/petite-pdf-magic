
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { useSearchParams } from "react-router-dom";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { useAdminModeService } from "@/services/AdminModeService";
import { useDiagnosticTools } from "@/hooks/admin/useDiagnosticTools";
import { useModuleInitializer } from "@/hooks/admin/useModuleInitializer";
import { useAdminAutoRepair } from "@/hooks/admin/useAdminAutoRepair";

export const useAdminDashboard = () => {
  const { user } = useAuth();
  const { role, isLoading: roleLoading, refreshRole, isSpecialAdmin, diagnosticRole } = useUserRole();
  const {
    isLoading: accessLoading,
    tablesAccessible,
    retryCount,
    forceRefreshPermissions,
    isSpecialAdminAccess
  } = useAdminAccess();
  
  // Use the admin mode service
  const { 
    forcedAdminMode, 
    enableForcedAdminMode,
    disableForcedAdminMode 
  } = useAdminModeService(user?.email);
  
  // Search params for default tab
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'modules';
  
  // Use diagnostic tools
  const {
    diagnosticData,
    isDiagnosticOpen,
    setIsDiagnosticOpen,
    diagnosticRunning,
    runAdminDiagnostic,
    isKonointer
  } = useDiagnosticTools(user, role, isSpecialAdmin, forcedAdminMode);
  
  // Use module initializer
  const {
    isInitializing,
    initializeAdminAccess
  } = useModuleInitializer(user, forceRefreshPermissions, enableForcedAdminMode, forcedAdminMode);
  
  // Use auto repair
  useAdminAutoRepair(user, role, refreshRole, forcedAdminMode, enableForcedAdminMode);
  
  // Initialize tables on load but with more caution
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shouldInitialize = params.get('initialize') === 'true';
    
    if (shouldInitialize && user && (isSpecialAdmin || role === "super_admin" || forcedAdminMode)) {
      initializeAdminAccess();
    }
  }, [user, role, isSpecialAdmin, forcedAdminMode, initializeAdminAccess]);

  // Access control: Forced mode, special admin, or super_admin role
  const hasAdminAccess = forcedAdminMode || isSpecialAdmin || isSpecialAdminAccess || role === "super_admin";
  const isLoading = roleLoading || (accessLoading && !forcedAdminMode);

  return {
    user,
    role,
    isKonointer,
    isLoading,
    roleLoading,
    isInitializing,
    forcedAdminMode,
    hasAdminAccess,
    tablesAccessible,
    retryCount,
    defaultTab,
    isSpecialAdmin,
    isDiagnosticOpen,
    setIsDiagnosticOpen,
    diagnosticData,
    diagnosticRunning,
    handleEnableForcedAdminMode: enableForcedAdminMode,
    handleDisableForcedAdminMode: disableForcedAdminMode,
    runAdminDiagnostic,
    initializeAdminAccess,
    forceRefreshPermissions
  };
};
