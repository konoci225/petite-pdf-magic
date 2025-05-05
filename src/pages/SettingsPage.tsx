
import React, { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/providers/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { useSettings } from "@/hooks/useSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

// Importing refactored components
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { AdminSettings } from "@/components/settings/AdminSettings";

const SettingsPage = () => {
  const { user } = useAuth();
  const { role } = useUserRole();
  const { isLoading } = useSettings();
  
  const isSuperAdmin = role === "super_admin";
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Paramètres</h1>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
            {isSuperAdmin && <TabsTrigger value="admin">Administration</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="general">
            <GeneralSettings />
          </TabsContent>
          
          <TabsContent value="notifications">
            <NotificationSettings />
          </TabsContent>
          
          <TabsContent value="security">
            <SecuritySettings />
          </TabsContent>
          
          {isSuperAdmin && (
            <TabsContent value="admin">
              <AdminSettings />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

export default SettingsPage;
