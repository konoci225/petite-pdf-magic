
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.14.0"
import { corsHeaders } from "../_shared/cors.ts"

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log("Edge function invoked: get_admin_dashboard_stats");
    
    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseServiceRole)
    
    // Verify user authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Extract token
    const token = authHeader.replace('Bearer ', '')
    
    // Verify the token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error("Authentication error:", authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: authError }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log("User authenticated:", user.email);
    
    // Special case for konointer@gmail.com (bypass role check)
    const isSpecialAdmin = user.email === 'konointer@gmail.com';
    let isAuthorized = isSpecialAdmin;
    
    if (!isSpecialAdmin) {
      // Check if the user is a super_admin
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()
      
      if (roleError) {
        console.error("Role check error:", roleError);
      } else {
        isAuthorized = roleData?.role === 'super_admin';
      }
    }
    
    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Super Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log("Authorization successful, fetching stats");
    
    // Get user count
    const { count: userCount, error: userError } = await supabase
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      
    if (userError) {
      console.error("User count error:", userError);
      throw userError
    }
    
    console.log("User count retrieved:", userCount);
    
    // Get modules data
    const { data: modules, error: moduleError } = await supabase
      .from('modules')
      .select('*')
      
    if (moduleError) {
      console.error("Modules error:", moduleError);
      throw moduleError
    }
    
    console.log("Modules retrieved:", modules?.length);
    
    // Get active subscriptions count
    const { count: subscriptionCount, error: subError } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      
    if (subError) {
      console.error("Subscription count error:", subError);
      throw subError
    }
    
    console.log("Subscription count retrieved:", subscriptionCount);
    
    // Calculate stats
    const stats = {
      totalUsers: userCount || 0,
      activeModules: modules ? modules.filter(m => m.is_active).length : 0,
      premiumModules: modules ? modules.filter(m => m.is_premium).length : 0,
      activeSubscriptions: subscriptionCount || 0
    }
    
    console.log("Stats calculated:", stats);
    
    // Return stats in the response
    return new Response(
      JSON.stringify(stats),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error in get_admin_dashboard_stats:', error)
    
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
