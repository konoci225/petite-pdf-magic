
import React from "react";
import Layout from "@/components/layout/Layout";
import { useUserRole } from "@/hooks/useUserRole";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { freeTools, premiumTools } from "@/data/toolsData";
import ToolsTabContent from "@/components/tools/ToolsTabContent";

const ToolsPage = () => {
  const { role, isLoading } = useUserRole();
  const navigate = useNavigate();

  const isSubscriber = role === "subscriber" || role === "super_admin";

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Outils PDF</h1>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">Tous les outils</TabsTrigger>
            <TabsTrigger value="free">Outils gratuits</TabsTrigger>
            {isSubscriber && (
              <TabsTrigger value="premium">Outils premium</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="all">
            <ToolsTabContent 
              tools={[...freeTools, ...premiumTools]} 
              navigate={navigate} 
              isSubscriber={isSubscriber} 
            />
          </TabsContent>

          <TabsContent value="free">
            <ToolsTabContent 
              tools={freeTools} 
              navigate={navigate} 
              isSubscriber={isSubscriber} 
            />
          </TabsContent>

          {isSubscriber && (
            <TabsContent value="premium">
              <ToolsTabContent 
                tools={premiumTools} 
                navigate={navigate} 
                isSubscriber={isSubscriber} 
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

export default ToolsPage;
