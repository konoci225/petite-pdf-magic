
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import UsersTable from "./UsersTable";
import UserModulesDialog from "./UserModulesDialog";
import { useUserService, User, Module } from "./UserService";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [userModules, setUserModules] = useState<{[key: string]: string[]}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const { toast } = useToast();
  const userService = useUserService();

  const fetchData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchUsers(),
      fetchModules(),
      fetchUserModules(),
    ]);
    setIsLoading(false);
  };

  const fetchUsers = async () => {
    const fetchedUsers = await userService.fetchUsers();
    setUsers(fetchedUsers);
  };

  const fetchModules = async () => {
    const fetchedModules = await userService.fetchModules();
    setModules(fetchedModules);
  };

  const fetchUserModules = async () => {
    const fetchedUserModules = await userService.fetchUserModules();
    setUserModules(fetchedUserModules);
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

    const success = await userService.saveUserModules(selectedUser.id, selectedModules);
    
    if (success) {
      // Update the local state
      setUserModules((prev) => ({
        ...prev,
        [selectedUser.id]: selectedModules,
      }));
      
      setIsDialogOpen(false);
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
