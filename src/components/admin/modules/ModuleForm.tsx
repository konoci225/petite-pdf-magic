
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ModuleFormData {
  module_name: string;
  description: string;
  is_active: boolean;
  is_premium: boolean;
}

interface ModuleFormProps {
  formData: ModuleFormData;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSwitchChange: (name: string, value: boolean) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
}

const ModuleForm = ({
  formData,
  handleFormChange,
  handleSwitchChange,
  handleSubmit,
  isEditing,
}: ModuleFormProps) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Modifier le module" : "Créer un nouveau module"}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="module_name" className="text-right">
              Nom du module
            </Label>
            <Input
              id="module_name"
              name="module_name"
              value={formData.module_name}
              onChange={handleFormChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              className="col-span-3"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="is_premium" className="text-right">
              Module Premium
            </Label>
            <div className="col-span-3">
              <Switch
                id="is_premium"
                checked={formData.is_premium}
                onCheckedChange={(checked) =>
                  handleSwitchChange("is_premium", checked)
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="is_active" className="text-right">
              Module Actif
            </Label>
            <div className="col-span-3">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  handleSwitchChange("is_active", checked)
                }
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Enregistrer</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default ModuleForm;
