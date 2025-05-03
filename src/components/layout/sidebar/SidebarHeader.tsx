
import React from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { Badge } from "@/components/ui/badge";

const SidebarHeader = () => {
  const { role } = useUserRole();

  return (
    <div className="border-b border-border p-4">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pdf-primary to-pdf-secondary flex items-center justify-center">
          <span className="text-white font-bold text-lg">P</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold text-pdf-dark">PDF Magic</span>
          {role === "super_admin" && (
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
              Super Admin
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default SidebarHeader;
