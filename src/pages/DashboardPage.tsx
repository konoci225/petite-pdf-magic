import Layout from "@/components/layout/Layout";
import { useUserModules } from "@/hooks/useUserModules";
import { useUserSubscription } from "@/hooks/useUserSubscription";
import { useUserRole } from "@/hooks/useUserRole";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DashboardPage = () => {
  const { modules, isLoading: modulesLoading } = useUserModules();
  const { subscription, isLoading: subscriptionLoading } = useUserSubscription();
  const { role, isLoading: roleLoading } = useUserRole();

  const isLoading = modulesLoading || subscriptionLoading || roleLoading;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">
          Tableau de bord {role === 'subscriber' ? 'Abonné' : 'Visiteur'}
        </h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Votre rôle</CardTitle>
                </CardHeader>
                <CardContent>
                  {role === 'super_admin' && (
                    <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                      Super Administrateur
                    </Badge>
                  )}
                  {role === 'subscriber' && (
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                      Abonné
                    </Badge>
                  )}
                  {role === 'visitor' && (
                    <Badge variant="secondary" className="bg-gray-50 text-gray-700">
                      Visiteur
                    </Badge>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Statut de l'abonnement</CardTitle>
                </CardHeader>
                <CardContent>
                  {subscription ? (
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Badge variant="outline" className="capitalize">{subscription.plan}</Badge>
                        {subscription.status === "active" && (
                          <Badge className="ml-2 bg-green-500">Actif</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        <div>Début : {formatDate(subscription.start_date)}</div>
                        {subscription.end_date && (
                          <div>Fin : {formatDate(subscription.end_date)}</div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center text-yellow-600">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <span>Aucun abonnement actif</span>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Modules actifs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{modules.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Modules premium</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {modules.filter(m => m.is_premium).length}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                {role === 'super_admin' 
                  ? 'Tous les modules (Super Admin)' 
                  : 'Vos modules disponibles'}
              </h2>
              
              {role === 'super_admin' ? (
                <p className="text-gray-600">En tant que Super Administrateur, vous avez accès à tous les modules.</p>
              ) : modules.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {modules.map((module) => (
                    <div
                      key={module.id}
                      className="border p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{module.module_name}</h3>
                        {module.is_premium && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                            Premium
                          </Badge>
                        )}
                      </div>
                      {module.description && (
                        <p className="text-gray-600 mt-2 text-sm">{module.description}</p>
                      )}
                      <div className="mt-3 flex items-center text-xs text-green-600">
                        <Check className="h-3 w-3 mr-1" />
                        <span>Module actif</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {role === 'subscriber' 
                    ? 'Vous n\'avez pas encore de modules disponibles.' 
                    : 'Les modules sont limités aux abonnés.'}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default DashboardPage;
