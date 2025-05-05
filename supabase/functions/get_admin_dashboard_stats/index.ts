
// This is a Supabase Edge Function that provides admin dashboard statistics
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: req.headers.get("Authorization")! } },
      }
    );

    // Get the session to verify the user is authenticated
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();

    if (!session) {
      return new Response(
        JSON.stringify({ error: "Non autorisé" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Vérifier si l'utilisateur est un super_admin
    const { data: userRole } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (!userRole || userRole.role !== "super_admin") {
      return new Response(
        JSON.stringify({ error: "Accès refusé" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Récupérer les statistiques du tableau de bord
    const [
      usersCount,
      moduleCount,
      premiumModuleCount,
      subscriptionsCount
    ] = await Promise.all([
      supabaseClient.from("user_roles").select("*", { count: 'exact' }),
      supabaseClient.from("modules").select("*").eq("is_active", true).count(),
      supabaseClient.from("modules").select("*").eq("is_premium", true).count(),
      supabaseClient.from("subscriptions").select("*").eq("status", "active").count()
    ]);

    const stats = {
      total_users: usersCount.count || 0,
      active_modules: moduleCount.count || 0,
      premium_modules: premiumModuleCount.count || 0,
      active_subscriptions: subscriptionsCount.count || 0,
    };

    console.log("Admin dashboard stats retrieved:", stats);

    return new Response(
      JSON.stringify(stats),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in get_admin_dashboard_stats function:", error);

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
