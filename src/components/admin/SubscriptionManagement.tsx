
import React from "react";
import { useToast } from "@/hooks/use-toast";

export const SubscriptionManagement = () => {
  const { toast } = useToast();
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Gestion des abonnements</h2>
      <p className="text-gray-500">Ajoutez, modifiez ou supprimez des abonnements utilisateur ici.</p>
      <p className="text-gray-500 mt-4">Fonctionnalité à implémenter.</p>
    </div>
  );
};
