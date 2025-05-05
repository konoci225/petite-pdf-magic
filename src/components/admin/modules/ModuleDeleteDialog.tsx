
import React from "react";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Module } from "./ModuleService";

interface ModuleDeleteDialogProps {
  selectedModule: Module | null;
  onClose: () => void;
  onDelete: () => void;
}

const ModuleDeleteDialog = ({
  selectedModule,
  onClose,
  onDelete,
}: ModuleDeleteDialogProps) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Confirmer la suppression</DialogTitle>
      </DialogHeader>
      <p className="py-4">
        Êtes-vous sûr de vouloir supprimer le module "
        {selectedModule?.module_name}" ? Cette action est irréversible.
      </p>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={onClose}
        >
          Annuler
        </Button>
        <Button
          variant="destructive"
          onClick={onDelete}
        >
          Supprimer
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default ModuleDeleteDialog;
