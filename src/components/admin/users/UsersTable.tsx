
import React from "react";
import { Button } from "@/components/ui/button";
import { UserCog } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface User {
  id: string;
  email: string;
  role: AppRole;
}

interface UsersTableProps {
  users: User[];
  userModules: {[key: string]: string[]};
  onManageModules: (user: User) => void;
  getRoleLabel: (role: AppRole) => JSX.Element;
}

const UsersTable = ({ users, userModules, onManageModules, getRoleLabel }: UsersTableProps) => {
  const getUserModuleCount = (userId: string) => {
    return userModules[userId]?.length || 0;
  };

  return (
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
                onClick={() => onManageModules(user)}
              >
                <UserCog className="h-4 w-4 mr-2" />
                Gérer les modules
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UsersTable;
