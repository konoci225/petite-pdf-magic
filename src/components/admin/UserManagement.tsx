
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import UsersTable from "./users/UsersTable";
import UserModulesDialog from "./users/UserModulesDialog";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface User {
  id: string;
  email: string;
  role: AppRole;
}

interface Module {
  id: string;
  module_name: string;
  description: string | null;
  is_active: boolean;
  is_premium: boolean;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [userModules, setUserModules] = useState<{[key: string]: string[]}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchUsers(),
        fetchModules(),
        fetchUserModules(),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      console.log("Récupération des utilisateurs...");
      
      // Get user_roles first since we can access this directly
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");
      
      if (rolesError) {
        console.error("Erreur lors de la récupération des rôles:", rolesError);
        setError("Impossible de récupérer les rôles des utilisateurs: " + rolesError.message);
        return;
      }
      
      if (!userRoles || userRoles.length === 0) {
        console.log("Aucun utilisateur trouvé.");
        setUsers([]);
        return;
      }
      
      console.log(`Trouvé ${userRoles.length} roles d'utilisateurs`);
      
      // For each user_id in user_roles, check if they have a profile
      const formattedUsers: User[] = [];
      
      for (const userRole of userRoles) {
        // Try to get user email from auth if possible
        try {
          const { data, error: authError } = await supabase.auth.admin.getUserById(userRole.user_id);
          
          if (authError) {
            console.warn(`Impossible de récupérer l'utilisateur auth pour ${userRole.user_id}: ${authError.message}`);
            // Fall back to a generated email
            formattedUsers.push({
              id: userRole.user_id,
              email: `utilisateur-${userRole.user_id.substring(0, 6)}@exemple.com`,
              role: userRole.role as AppRole
            });
          } else if (data && data.user) {
            // If we found the auth user, use their email
            formattedUsers.push({
              id: userRole.user_id,
              email: data.user.email || `utilisateur-${userRole.user_id.substring(0, 6)}@exemple.com`,
              role: userRole.role as AppRole
            });
          }
        } catch (error) {
          console.warn(`Erreur pour l'utilisateur ${userRole.user_id}:`, error);
          // Fall back to a generated email
          formattedUsers.push({
            id: userRole.user_id,
            email: `utilisateur-${userRole.user_id.substring(0, 6)}@exemple.com`,
            role: userRole.role as AppRole
          });
        }
      }
      
      console.log("Utilisateurs formatés:", formattedUsers);
      setUsers(formattedUsers);
      
    } catch (error: any) {
      console.error("Error fetching users:", error);
      setError("Impossible de charger les utilisateurs: " + error.message);
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs: " + error.message,
        variant: "destructive",
      });
    }
  };

  const fetchModules = async () => {
    try {
      const { data, error } = await supabase
        .from("modules")
        .select("*");

      if (error) {
        throw error;
      }
      setModules(data || []);
    } catch (error: any) {
      console.error("Error fetching modules:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les modules",
        variant: "destructive",
      });
    }
  };

  const fetchUserModules = async () => {
    try {
      const { data, error } = await supabase
        .from("user_modules")
        .select("user_id, module_id");

      if (error) {
        throw error;
      }

      // Group user modules by user_id
      const modulesByUser: {[key: string]: string[]} = {};
      data?.forEach((um) => {
        if (!modulesByUser[um.user_id]) {
          modulesByUser[um.user_id] = [];
        }
        modulesByUser[um.user_id].push(um.module_id);
      });

      setUserModules(modulesByUser);
    } catch (error: any) {
      console.error("Error fetching user modules:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les modules utilisateur",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleManageModules = (user: User) => {
    setSelectedUser(user);
    setSelectedModules(userModules[user.id] || []);
    setIsDialogOpen(true);
  };

  const handleModuleToggle = (moduleId: string) => {
    setSelectedModules((prev) => {
      if (prev.includes(moduleId)) {
        return prev.filter((id) => id !== moduleId);
      } else {
        return [...prev, moduleId];
      }
    });
  };

  const handleSaveUserModules = async () => {
    if (!selectedUser) return;

    try {
      // First, delete all existing user modules
      const { error: deleteError } = await supabase
        .from("user_modules")
        .delete()
        .eq("user_id", selectedUser.id);

      if (deleteError) throw deleteError;

      // Then insert new ones
      if (selectedModules.length > 0) {
        const userModulesToInsert = selectedModules.map((moduleId) => ({
          user_id: selectedUser.id,
          module_id: moduleId,
        }));

        const { error: insertError } = await supabase
          .from("user_modules")
          .insert(userModulesToInsert);

        if (insertError) throw insertError;
      }

      toast({
        title: "Succès",
        description: "Modules de l'utilisateur mis à jour",
      });
      
      // Update the local state
      setUserModules((prev) => ({
        ...prev,
        [selectedUser.id]: selectedModules,
      }));
      
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error updating user modules:", error);
    }
  };

  const getRoleLabel = (role: AppRole) => {
    switch (role) {
      case "super_admin":
        return (
          <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
            Super Admin
          </span>
        );
      case "subscriber":
        return (
          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
            Abonné
          </span>
        );
      case "visitor":
        return (
          <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
            Visiteur
          </span>
        );
      default:
        return <span>{role}</span>;
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Gestion des utilisateurs</h2>
        <Button variant="outline" onClick={fetchData}>Actualiser</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          {error}
        </div>
      ) : users.length > 0 ? (
        <UsersTable 
          users={users} 
          userModules={userModules}
          onManageModules={handleManageModules}
          getRoleLabel={getRoleLabel}
        />
      ) : (
        <div className="text-center py-8 text-gray-500">
          Aucun utilisateur trouvé.
        </div>
      )}

      {/* Assign Modules Dialog */}
      <UserModulesDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        selectedUser={selectedUser}
        modules={modules}
        selectedModules={selectedModules}
        onModuleToggle={handleModuleToggle}
        onSave={handleSaveUserModules}
      />
    </div>
  );
};
