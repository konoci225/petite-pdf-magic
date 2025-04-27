
import Layout from "@/components/layout/Layout";

const AdminDashboard = () => {
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Tableau de bord administrateur</h1>
        <div className="grid gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Gestion des utilisateurs</h2>
            {/* TODO: Implement users management */}
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Gestion des modules</h2>
            {/* TODO: Implement modules management */}
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Gestion des abonnements</h2>
            {/* TODO: Implement subscriptions management */}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
