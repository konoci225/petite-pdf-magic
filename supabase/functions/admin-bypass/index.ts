
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.26.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log("Function admin-bypass called")
    
    // Create a Supabase client with SERVICE ROLE KEY
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the user data
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError) {
      throw userError
    }

    // Check if this is the special admin user
    const isSpecialAdmin = user?.email === 'konointer@gmail.com'
    if (!user || (!isSpecialAdmin && user.email !== 'konointer@gmail.com')) {
      throw new Error('Unauthorized: Only the special admin can use this function')
    }

    // Parse the request body
    const { action, targetUserId } = await req.json()

    // Handle different actions
    if (action === 'force_super_admin_role') {
      console.log("Action force_super_admin_role requested for", targetUserId || user.id)
      
      try {
        // First try to use the RPC function for better error handling
        const { data: rpcData, error: rpcError } = await supabaseClient.rpc(
          'force_set_super_admin_role',
          { target_user_id: targetUserId || user.id }
        )
        
        if (rpcError) {
          console.error("RPC function error:", rpcError)
          // Fallback to direct upsert if RPC fails
          const { error } = await supabaseClient
            .from('user_roles')
            .upsert(
              { 
                user_id: targetUserId || user.id, 
                role: 'super_admin', 
                updated_at: new Date().toISOString() 
              },
              { onConflict: 'user_id' }
            )
          
          if (error) {
            console.error("Upsert error:", error)
            throw error
          }
        }
        
        // Check if the role was set correctly
        const { data: roleCheck, error: checkError } = await supabaseClient
          .from("user_roles")
          .select("role")
          .eq("user_id", targetUserId || user.id)
          .single();
          
        if (checkError) {
          console.error("Role check error:", checkError)
          throw checkError
        }
        
        console.log("Role set successfully for", targetUserId || user.id, "Current role:", roleCheck?.role)
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Super admin role applied successfully',
            current_role: roleCheck?.role
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (innerError) {
        console.error("Inner error:", innerError)
        throw innerError
      }
    } 
    else if (action === 'get_user_role') {
      const userId = targetUserId || user.id
      console.log("Action get_user_role requested for", userId)
      
      const { data: roleData, error: roleError } = await supabaseClient
        .from('user_roles')
        .select('role, updated_at')
        .eq('user_id', userId)
        .single()
      
      if (roleError) {
        console.error("Error fetching role:", roleError)
        throw roleError
      }
      
      return new Response(
        JSON.stringify({ 
          success: true,
          role: roleData?.role,
          updated_at: roleData?.updated_at,
          user_email: user.email
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    else if (action === 'diagnostic') {
      console.log("Diagnostic action requested")
      
      // Get RLS policies for the user_roles table
      const { data: policies, error: policiesError } = await supabaseClient
        .rpc('get_policies_for_table', { table_name: 'user_roles' })
      
      // Get policies for modules table
      const { data: modulesPolicies, error: modulesPoliciesError } = await supabaseClient
        .rpc('get_policies_for_table', { table_name: 'modules' })
      
      // Get all tables with RLS enabled
      const { data: rlsTables, error: rlsError } = await supabaseClient
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .filter('has_row_level_security', 'eq', true)
      
      // Check current role
      const { data: roleData, error: roleError } = await supabaseClient
        .from('user_roles')
        .select('role, updated_at')
        .eq('user_id', user.id)
        .single()
        
      // Try to access modules table directly to check permissions
      const { data: modulesData, error: modulesError } = await supabaseClient
        .from('modules')
        .select('*')
        .limit(1)
        
      // Attempt to get default modules
      let defaultModulesResult = null
      let defaultModulesError = null
      try {
        const result = await supabaseClient.rpc('create_default_modules')
        defaultModulesResult = { success: true, data: result.data }
      } catch (error) {
        defaultModulesError = { message: error.message, details: error }
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            role: roleData?.role || null,
            role_updated_at: roleData?.updated_at || null
          },
          permissions: {
            can_access_modules: modulesError ? false : true,
            modules_access_error: modulesError ? modulesError.message : null,
            default_modules_result: defaultModulesResult,
            default_modules_error: defaultModulesError
          },
          system: {
            rls_tables: rlsTables || [],
            user_roles_policies: policies || [],
            modules_policies: modulesPolicies || [],
            errors: {
              policies: policiesError ? policiesError.message : null,
              modules_policies: modulesPoliciesError ? modulesPoliciesError.message : null,
              rls: rlsError ? rlsError.message : null,
              role: roleError ? roleError.message : null
            }
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    throw new Error('Invalid action specified')
  } catch (error) {
    console.error('Admin bypass function error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack,
        name: error.name
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
