
import { useState } from "react";

/**
 * Hook that manages the state related to admin access
 */
export const useAccessState = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [tablesAccessible, setTablesAccessible] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastCheckTime, setLastCheckTime] = useState(0);
  
  return {
    isLoading,
    setIsLoading,
    tablesAccessible,
    setTablesAccessible,
    retryCount,
    setRetryCount,
    lastCheckTime,
    setLastCheckTime
  };
};
