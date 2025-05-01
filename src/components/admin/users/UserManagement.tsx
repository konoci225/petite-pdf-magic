
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import UsersTable from "./UsersTable";
import UserModulesDialog from "./UserModulesDialog";
import UserRoleDialog from "./UserRoleDialog";
import { useUserService } from "./UserService";
import { useModuleService } from "./ModuleService";
import { User, AppRole, Module } from "./types";

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [userModules, setUserModules] = useState<{[key: string]: string[]}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModulesDialogOpen, setIsModulesDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  
  const { toast } = useToast();
  const userService = useUserService();
  const moduleService = useModuleService();

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
      const fetchedUsers = await userService.fetchUsers();
      setUsers(fetchedUsers);
    } catch (error: any) {
      console.error("Error in fetchUsers:", error);
      setError("Impossible de charger les utilisateurs: " + error.message);
    }
  };

  const fetchModules = async () => {
    try {
      const fetchedModules = await moduleService.fetchModules();
      setModules(fetchedModules);
    } catch (error: any) {
      console.error("Error fetching modules:", error);
    }
  };

  const fetchUserModules = async () => {
    try {
      const fetchedUserModules = await moduleService.fetchUserModules();
      setUserModules(fetchedUserModules);
    } catch (error: any) {
      console.error("Error fetching user modules:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleManageModules = (user: User) => {
    setSelectedUser(user);
    setSelectedModules(userModules[user.id] || []);
    setIsModulesDialogOpen(true);
  };
  
  const handleManageRole = (user: User) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setIsRoleDialogOpen(true);
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

    const success = await moduleService.saveUserModules(selectedUser.id, selectedModules);
    
    if (success) {
      // Update the local state
      setUserModules((prev) => ({
        ...prev,
        [selectedUser.id]: selectedModules,
      }));
      
      setIsModulesDialogOpen(false);
    }
  };
  
  const handleSaveUserRole = async () => {
    if (!selectedUser || !selectedRole) return;
    
    const success = await userService.changeUserRole(selectedUser.id, selectedRole);
    
    if (success) {
      // Update the user in the local state
      setUsers((prev) => 
        prev.map(user => 
          user.id === selectedUser.id 
            ? { ...user, role: selectedRole } 
            : user
        )
      );
      
      setIsRoleDialogOpen(false);
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
          onManageRole={handleManageRole}
        />
      ) : (
        <div className="text-center py-8 text-gray-500">
          Aucun utilisateur trouvé.
        </div>
      )}

      {/* Assign Modules Dialog */}
      <UserModulesDialog 
        isOpen={isModulesDialogOpen}
        onClose={() => setIsModulesDialogOpen(false)}
        selectedUser={selectedUser}
        modules={modules}
        selectedModules={selectedModules}
        onModuleToggle={handleModuleToggle}
        onSave={handleSaveUserModules}
      />
      
      {/* Change Role Dialog */}
      <UserRoleDialog
        isOpen={isRoleDialogOpen}
        onClose={() => setIsRoleDialogOpen(false)}
        selectedUser={selectedUser}
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
        onSave={handleSaveUserRole}
      />
    </div>
  );
};
