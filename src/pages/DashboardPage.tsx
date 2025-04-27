
import Layout from "@/components/layout/Layout";
import { useUserModules } from "@/hooks/useUserModules";

const DashboardPage = () => {
  const { modules, isLoading } = useUserModules();

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Tableau de bord Premium</h1>
        <div className="grid gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Vos modules actifs</h2>
            {isLoading ? (
              <p>Chargement des modules...</p>
            ) : (
              <div className="grid gap-4">
                {modules.map((module) => (
                  <div
                    key={module.id}
                    className="border p-4 rounded-lg bg-gray-50"
                  >
                    <h3 className="font-medium">{module.module_name}</h3>
                    {module.description && (
                      <p className="text-gray-600 mt-1">{module.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
