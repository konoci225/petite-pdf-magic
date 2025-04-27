
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
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

interface UserModule {
  module_id: string;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [userModules, setUserModules] = useState<{[key: string]: string[]}>({}); // userId -> moduleIds
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      // Get all users with their roles
      const { data: authUsers, error: authError } = await supabase
        .from("user_roles")
        .select(`
          user_id,
          role
        `);

      if (authError) throw authError;

      // Get user emails
      const userIds = authUsers?.map((u) => u.user_id) || [];
      if (userIds.length === 0) {
        setUsers([]);
        return;
      }

      // Fix: Type the userData response correctly
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
      
      if (userError) throw userError;

      // Fix: Type check and safely access users property
      const usersList = userData?.users || [];
      
      // Combine the data with proper type handling
      const combinedUsers = authUsers.map((authUser) => {
        const userInfo = usersList.find(u => u.id === authUser.user_id);
        return {
          id: authUser.user_id,
          email: userInfo?.email || "Unknown",
          role: authUser.role
        };
      });

      setUsers(combinedUsers);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setModules(data || []);
    } catch (error: any) {
      console.error("Error fetching modules:", error);
    }
  };

  const fetchUserModules = async () => {
    try {
      const { data, error } = await supabase
        .from("user_modules")
        .select("user_id, module_id");

      if (error) throw error;

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
    }
  };

  useEffect(() => {
    Promise.all([
      fetchUsers(),
      fetchModules(),
      fetchUserModules(),
    ]);
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

  const getUserModuleCount = (userId: string) => {
    return userModules[userId]?.length || 0;
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
        return role;
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Gestion des utilisateurs</h2>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : users.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Modules assignés</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{getRoleLabel(user.role)}</TableCell>
                <TableCell>{getUserModuleCount(user.id)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleManageModules(user)}
                  >
                    <UserCog className="h-4 w-4 mr-2" />
                    Gérer les modules
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Aucun utilisateur trouvé.
        </div>
      )}

      {/* Assign Modules Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Gérer les modules pour {selectedUser?.email}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <h3 className="mb-3 font-medium">Modules disponibles :</h3>
            {modules.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {modules.map((module) => (
                  <div
                    key={module.id}
                    className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50"
                  >
                    <Checkbox
                      id={`module-${module.id}`}
                      checked={selectedModules.includes(module.id)}
                      onCheckedChange={() => handleModuleToggle(module.id)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor={`module-${module.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                      >
                        {module.module_name}
                        {!module.is_active && (
                          <span className="ml-2 text-xs text-gray-400">(inactive)</span>
                        )}
                        {module.is_premium && (
                          <span className="ml-2 text-xs text-yellow-600">(premium)</span>
                        )}
                      </label>
                      {module.description && (
                        <p className="text-xs text-gray-500">{module.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Aucun module disponible</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveUserModules}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
