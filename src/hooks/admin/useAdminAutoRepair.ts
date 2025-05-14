
import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SPECIAL_ADMIN_EMAIL } from "@/services/AdminModeService";

export const useAdminAutoRepair = (
  user: any, 
  role: string | null,
  refreshRole: (forceRepair?: boolean) => Promise<void>,
  forcedAdminMode: boolean,
  enableForcedAdminMode: () => void
) => {
  const { toast } = useToast();
  const isKonointer = user?.email === SPECIAL_ADMIN_EMAIL;
  
  // Auto-repair function
  const attemptAutoRepair = useCallback(async () => {
    if (isKonointer && role !== "super_admin" && !forcedAdminMode) {
      console.log("Automatic role repair via Edge Function...");
      
      try {
        const { data, error } = await supabase.functions.invoke("set-admin-role", {
          body: { 
            email: user?.email,
            userId: user?.id,
            forceRepair: true
          }
        });
        
        console.log("Edge function response for repair:", data);
        
        if (data?.success) {
          await refreshRole(true);
          toast({
            title: "Role repaired",
            description: "Admin role has been successfully assigned.",
          });
        } else if (error) {
          console.error("Auto-repair error:", error);
          // Fallback to forced admin mode
          if (!forcedAdminMode) {
            enableForcedAdminMode();
            
            toast({
              title: "Forced mode activated",
              description: "Forced admin mode has been automatically activated.",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error("Error during automatic repair:", error);
        // Fallback to forced admin mode
        if (!forcedAdminMode) {
          enableForcedAdminMode();
          
          toast({
            title: "Forced mode activated",
            description: "Forced admin mode has been activated due to an error.",
            variant: "destructive",
          });
        }
      }
    }
  }, [isKonointer, role, user, refreshRole, forcedAdminMode, enableForcedAdminMode, toast]);

  // Auto-repair on component mount
  useEffect(() => {
    attemptAutoRepair();
  }, [attemptAutoRepair]);

  return {
    attemptAutoRepair
  };
};
