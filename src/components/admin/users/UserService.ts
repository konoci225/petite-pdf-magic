
import { useState } from "react";
import { User, AppRole } from "./types";
import { useUserRoleService } from "./services/UserRoleService";
import { useUserFetchService } from "./services/UserFetchService";
import { useUserDemoService } from "./services/UserDemoService";

export const useUserService = () => {
  const roleService = useUserRoleService();
  const fetchService = useUserFetchService();
  const demoService = useUserDemoService();

  // Re-export des méthodes des services individuels
  const { fetchUsers } = fetchService;
  const { changeUserRole, makeSelfSuperAdmin, checkIsSuperAdmin } = roleService;
  const { createDemoUsers } = demoService;

  return {
    fetchUsers,
    changeUserRole,
    createDemoUsers,
    makeSelfSuperAdmin,
    checkIsSuperAdmin
  };
};
