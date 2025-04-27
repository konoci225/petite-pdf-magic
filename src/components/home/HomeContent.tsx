
import React from "react";
import { useUserRole } from "@/hooks/useUserRole";
import SuperAdminHome from "./SuperAdminHome";
import SubscriberHome from "./SubscriberHome";
import VisitorHome from "./VisitorHome";
import { Skeleton } from "@/components/ui/skeleton";

const HomeContent = () => {
  const { role, isLoading } = useUserRole();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  switch (role) {
    case "super_admin":
      return <SuperAdminHome />;
    case "subscriber":
      return <SubscriberHome />;
    case "visitor":
    default:
      return <VisitorHome />;
  }
};

export default HomeContent;
