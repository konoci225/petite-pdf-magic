
import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

interface UserModulesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: User | null;
  modules: Module[];
  selectedModules: string[];
  onModuleToggle: (moduleId: string) => void;
  onSave: () => void;
}

const UserModulesDialog = ({
  isOpen,
  onClose,
  selectedUser,
  modules,
  selectedModules,
  onModuleToggle,
  onSave,
}: UserModulesDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                    onCheckedChange={() => onModuleToggle(module.id)}
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
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={onSave}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserModulesDialog;
