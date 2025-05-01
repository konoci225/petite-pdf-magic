
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserRoleBadgeProps {
  role: AppRole;
}

export const UserRoleBadge = ({ role }: UserRoleBadgeProps) => {
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
