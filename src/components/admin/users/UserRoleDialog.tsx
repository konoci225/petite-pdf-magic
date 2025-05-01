
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { User, AppRole } from "./types";
import { Label } from "@/components/ui/label";
import { UserRoleBadge } from "./UserRoleBadge";

interface UserRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: User | null;
  selectedRole: AppRole | null;
  onRoleChange: (role: AppRole) => void;
  onSave: () => void;
}

const UserRoleDialog = ({
  isOpen,
  onClose,
  selectedUser,
  selectedRole,
  onRoleChange,
  onSave,
}: UserRoleDialogProps) => {
  const availableRoles: AppRole[] = ["super_admin", "subscriber", "visitor"];
  
  const handleRoleChange = (value: string) => {
    onRoleChange(value as AppRole);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Changer le rôle de l'utilisateur</DialogTitle>
        </DialogHeader>
        
        {selectedUser && (
          <div className="space-y-4 py-4">
            <div className="space-y-1">
              <Label>Utilisateur</Label>
              <p className="text-sm font-medium">{selectedUser.email}</p>
            </div>
            
            <div className="space-y-1">
              <Label>Rôle actuel</Label>
              <div className="py-1">
                <UserRoleBadge role={selectedUser.role} />
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="role-select">Nouveau rôle</Label>
              <Select
                value={selectedRole || undefined}
                onValueChange={handleRoleChange}
              >
                <SelectTrigger id="role-select" className="w-full">
                  <SelectValue placeholder="Sélectionnez un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role === "super_admin" 
                        ? "Super Admin" 
                        : role === "subscriber" 
                          ? "Abonné" 
                          : "Visiteur"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={onSave} disabled={!selectedRole}>Sauvegarder</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserRoleDialog;
