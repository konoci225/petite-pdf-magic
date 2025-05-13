
import { useState } from "react";
import { Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModuleManagement } from "@/components/admin/ModuleManagement";
import { UserManagement } from "@/components/admin/users/UserManagement";
import { SubscriptionManagement } from "@/components/admin/SubscriptionManagement";
import { AdminDashboardHeader } from "@/components/admin/AdminDashboardHeader";
import { AdminDashboardLoader } from "@/components/admin/AdminDashboardLoader";
import { ErrorMessage } from "@/components/admin/ErrorMessage";

// Import refactored components
import AdminForcedModeNotice from "@/components/admin/dashboard/AdminForcedModeNotice";
import SpecialAdminNotice from "@/components/admin/dashboard/SpecialAdminNotice";
import AdminQuickActions from "@/components/admin/dashboard/AdminQuickActions";
import DiagnosticResult from "@/components/admin/dashboard/DiagnosticResult";
import AdminAccessError from "@/components/admin/dashboard/AdminAccessError";

// Import the new custom hook for dashboard logic
import { useAdminDashboard } from "@/hooks/useAdminDashboard";

const AdminDashboard = () => {
  const {
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
    handleEnableForcedAdminMode,
    handleDisableForcedAdminMode,
    runAdminDiagnostic,
    initializeAdminAccess,
    forceRefreshPermissions
  } = useAdminDashboard();

  // Show loading screen when role is loading
  if (roleLoading) {
    return <AdminDashboardLoader />;
  }

  // Error page for special admin when they don't have super_admin role yet
  if (isKonointer && role !== "super_admin" && !forcedAdminMode) {
    return (
      <Layout>
        <AdminAccessError 
          user={user} 
          role={role} 
          isSpecialAdmin={isKonointer}
          onEnableForcedAdminMode={handleEnableForcedAdminMode}
          onRunDiagnostic={runAdminDiagnostic}
          diagnosticData={diagnosticData}
          isDiagnosticOpen={isDiagnosticOpen}
        />
      </Layout>
    );
  }

  // Access control: If no admin access, redirect to dashboard
  if (!hasAdminAccess) {
    return <Navigate to="/dashboard" />;
  }

  // Loading screen while checking tables
  if (!forcedAdminMode && isLoading) {
    return <AdminDashboardLoader />;
  }

  // Display error if tables aren't accessible (unless forced mode or special admin)
  if (!forcedAdminMode && !tablesAccessible && !isSpecialAdmin) {
    return (
      <Layout>
        <ErrorMessage 
          title="Problème d'accès aux données"
          description="Impossible d'accéder aux tables nécessaires dans la base de données."
          onRefresh={forceRefreshPermissions}
          retryCount={retryCount}
          showFixRole={isKonointer}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <AdminDashboardHeader isAdminForcedMode={forcedAdminMode} />
        
        {/* Notice for forced admin mode */}
        <AdminForcedModeNotice 
          isActive={forcedAdminMode}
          onDisable={handleDisableForcedAdminMode}
        />
        
        {/* Special notice for konointer@gmail.com */}
        <SpecialAdminNotice
          isVisible={isKonointer && !forcedAdminMode}
          onRunDiagnostic={runAdminDiagnostic}
          onEnableForcedMode={handleEnableForcedAdminMode}
        />
        
        {/* Quick action buttons for special admin */}
        <AdminQuickActions
          isKonointer={isKonointer}
          isInitializing={isInitializing}
          onRunDiagnostic={runAdminDiagnostic}
          onInitializeModules={initializeAdminAccess}
          forcedAdminMode={forcedAdminMode}
        />
        
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="modules">Gestion des modules</TabsTrigger>
            <TabsTrigger value="users">Gestion des utilisateurs</TabsTrigger>
            <TabsTrigger value="subscriptions">Gestion des abonnements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="modules">
            <ModuleManagement />
          </TabsContent>
          
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="subscriptions">
            <SubscriptionManagement />
          </TabsContent>
        </Tabs>
        
        {/* Diagnostic result display */}
        <DiagnosticResult 
          isOpen={isDiagnosticOpen}
          data={diagnosticData}
          onClose={() => setIsDiagnosticOpen(false)}
          onEnableForcedMode={!forcedAdminMode ? handleEnableForcedAdminMode : undefined}
        />
      </div>
    </Layout>
  );
};

export default AdminDashboard;
