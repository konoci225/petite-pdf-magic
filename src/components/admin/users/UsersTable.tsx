
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Settings, Wrench } from "lucide-react";
import { User } from "./types";
import { UserRoleBadge } from "./UserRoleBadge";

interface UsersTableProps {
  users: User[];
  userModules: { [key: string]: string[] };
  onManageModules: (user: User) => void;
  onManageRole: (user: User) => void;
}

const UsersTable = ({ users, userModules, onManageModules, onManageRole }: UsersTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Rôle</TableHead>
          <TableHead>Modules</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.email}</TableCell>
            <TableCell>
              <UserRoleBadge role={user.role} />
            </TableCell>
            <TableCell>
              {userModules[user.id] ? (
                <span className="text-sm text-muted-foreground">
                  {userModules[user.id].length} modules
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">Aucun module</span>
              )}
            </TableCell>
            <TableCell className="text-right space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onManageRole(user)}
                className="h-8 px-2 lg:px-3"
              >
                <Settings className="h-4 w-4 mr-0 lg:mr-2" />
                <span className="hidden lg:inline">Rôle</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onManageModules(user)}
                className="h-8 px-2 lg:px-3"
              >
                <Wrench className="h-4 w-4 mr-0 lg:mr-2" />
                <span className="hidden lg:inline">Modules</span>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UsersTable;
