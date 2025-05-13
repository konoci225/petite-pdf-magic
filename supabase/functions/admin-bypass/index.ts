
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.26.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SPECIAL_ADMIN_EMAIL = 'konointer@gmail.com'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log("Function admin-bypass called")
    
    // Create a Supabase client with SERVICE ROLE KEY
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY missing')
    }
    
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey
    )
    
    // Parse the request body first
    let requestBody = {}
    try {
      requestBody = await req.json()
    } catch (e) {
      console.warn("Failed to parse request body, continuing with empty object")
    }
    
    const { action, targetUserId } = requestBody as { 
      action?: string, 
      targetUserId?: string 
    }

    // Create client with auth from request for authenticated actions
    let user = null
    const authHeader = req.headers.get('Authorization')
    
    if (authHeader) {
      try {
        // Create client with auth from request
        const supabaseClient = createClient(
          supabaseUrl, 
          supabaseServiceKey,
          { 
            global: { 
              headers: { Authorization: authHeader } 
            } 
          }
        )

        // Get the authenticated user
        const { data: userData, error: userError } = await supabaseClient.auth.getUser()
        
        if (userError) {
          console.error(`Authentication error: ${userError.message}`)
        } else {
          user = userData?.user
          console.log("Authenticated user:", user?.email)
        }
      } catch (authError) {
        console.error("Error during authentication:", authError)
      }
    } else {
      console.log("No auth header provided, continuing in anonymous mode")
    }
    
    // Check for public actions that don't need auth
    if (action === 'ping') {
      return new Response(
        JSON.stringify({ success: true, message: 'Pong!' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // If no user found from auth header, try to proceed with limited functionality
    // Special bypass mode for anonymous or authenticated konointer@gmail.com
    const isSpecialAdmin = user?.email === SPECIAL_ADMIN_EMAIL
    const isSpecialAdminRequest = action?.includes('special_admin') || action === 'diagnostic'
    
    // Use admin client for specific admin tasks and diagnostics
    if (isSpecialAdminRequest) {
      if (action === 'diagnostic') {
        console.log("Diagnostic action requested")
        
        // Comprehensive diagnostic information
        const diagnosticData: Record<string, any> = {
          timestamp: new Date().toISOString(),
          authStatus: user ? 'authenticated' : 'anonymous',
          userInfo: user ? {
            id: user.id,
            email: user.email,
          } : null
        }
        
        // Try to get user role if authenticated
        if (user) {
          try {
            const { data: roleData, error: roleError } = await supabaseAdmin
              .from('user_roles')
              .select('role, updated_at')
              .eq('user_id', user.id)
              .single()
            
            if (!roleError) {
              diagnosticData.role = roleData?.role
              diagnosticData.role_updated_at = roleData?.updated_at
            } else {
              diagnosticData.role_error = roleError.message
            }
          } catch (e) {
            diagnosticData.role_error = `Exception: ${e.message}`
          }
        }
        
        // Check modules table access with admin client
        try {
          const { data: modulesAdminData, error: modulesAdminError } = await supabaseAdmin
            .from('modules')
            .select('count(*)')
            .single()
          
          diagnosticData.modules_admin_access = !modulesAdminError
          diagnosticData.modules_admin_count = modulesAdminData?.count
          
          if (modulesAdminError) {
            diagnosticData.modules_admin_error = modulesAdminError.message
          }
        } catch (e) {
          diagnosticData.modules_admin_error = `Exception: ${e.message}`
        }
        
        // Check modules table access directly from authenticated user
        if (user) {
          try {
            const supabaseUser = createClient(
              supabaseUrl, 
              supabaseServiceKey,
              { 
                global: { 
                  headers: { Authorization: req.headers.get('Authorization') ?? '' } 
                } 
              }
            )
            
            const { data: modulesData, error: modulesError } = await supabaseUser
              .from('modules')
              .select('count(*)')
              .single()
            
            diagnosticData.modules_user_access = !modulesError
            diagnosticData.modules_user_count = modulesData?.count
            
            if (modulesError) {
              diagnosticData.modules_user_error = modulesError.message
            }
          } catch (e) {
            diagnosticData.modules_user_error = `Exception: ${e.message}`
          }
        }
        
        // Try to create default modules if requested
        try {
          const { error: defaultModulesError } = await supabaseAdmin.rpc('create_default_modules')
          
          diagnosticData.default_modules_result = !defaultModulesError
          
          if (defaultModulesError) {
            diagnosticData.default_modules_error = defaultModulesError.message
          }
        } catch (e) {
          diagnosticData.default_modules_error = `Exception: ${e.message}`
        }
        
        return new Response(
          JSON.stringify({
            success: true,
            ...diagnosticData
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }
    
    // For other admin actions, require either authentication or specific email match
    if (isSpecialAdmin) {
      if (action === 'force_super_admin_role') {
        console.log("Action force_super_admin_role requested for", targetUserId || user?.id)
        
        try {
          // Try three different methods to ensure the role is set
          let success = false
          
          // Method 1: Use RPC function
          try {
            const { error: rpcError } = await supabaseAdmin.rpc(
              'force_set_super_admin_role',
              { target_user_id: targetUserId || user?.id }
            )
            
            if (!rpcError) {
              success = true
              console.log("Method 1 successful")
            } else {
              console.error("Method 1 error:", rpcError)
            }
          } catch (error) {
            console.error("Method 1 exception:", error)
          }
          
          // Method 2: Direct upsert if Method 1 fails
          if (!success) {
            try {
              const { error } = await supabaseAdmin
                .from('user_roles')
                .upsert(
                  { 
                    user_id: targetUserId || user?.id, 
                    role: 'super_admin', 
                    updated_at: new Date().toISOString() 
                  },
                  { onConflict: 'user_id' }
                )
              
              if (!error) {
                success = true
                console.log("Method 2 successful")
              } else {
                console.error("Method 2 error:", error)
              }
            } catch (error) {
              console.error("Method 2 exception:", error)
            }
          }
          
          // Method 3: Execute raw SQL as last resort (using admin client)
          if (!success && (targetUserId || user?.id)) {
            try {
              const userId = targetUserId || user?.id
              // Direct SQL through Supabase - safer than raw SQL
              const { error: sqlError } = await supabaseAdmin
                .from('user_roles')
                .delete()
                .eq('user_id', userId)
              
              if (sqlError) {
                console.error("Delete error:", sqlError)
              }
              
              // Insert new role
              const { error: insertError } = await supabaseAdmin
                .from('user_roles')
                .insert({
                  user_id: userId,
                  role: 'super_admin',
                  updated_at: new Date().toISOString()
                })
              
              if (!insertError) {
                success = true
                console.log("Method 3 successful")
              } else {
                console.error("Method 3 error:", insertError)
              }
            } catch (error) {
              console.error("Method 3 exception:", error)
            }
          }
          
          // Check if the role was set correctly
          if (targetUserId || user?.id) {
            const { data: roleCheck, error: checkError } = await supabaseAdmin
              .from("user_roles")
              .select("role")
              .eq("user_id", targetUserId || user?.id)
              .single();
              
            if (checkError) {
              console.error("Role check error:", checkError)
            } else {
              console.log("Role check result:", roleCheck)
              success = roleCheck?.role === 'super_admin'
            }
          }
          
          return new Response(
            JSON.stringify({ 
              success, 
              message: success ? 'Super admin role applied successfully' : 'Failed to apply role',
              user_id: targetUserId || user?.id
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } catch (innerError) {
          console.error("Inner error:", innerError)
          throw innerError
        }
      }
    }
    
    // If we reach here, either the user is not authorized or the action is not supported
    if (!isSpecialAdmin) {
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized: Special admin access required',
          name: 'Authorization Error'
        }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid action specified',
          name: 'Invalid Action'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
  } catch (error) {
    console.error('Admin bypass function error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        name: error.name
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
