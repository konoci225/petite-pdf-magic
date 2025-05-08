
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
    
    // Also create client with auth from request for authenticated actions
    const supabaseClient = createClient(
      supabaseUrl, 
      supabaseServiceKey,
      { 
        global: { 
          headers: { Authorization: req.headers.get('Authorization') ?? '' } 
        } 
      }
    )

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError) {
      throw new Error(`Authentication error: ${userError.message}`)
    }

    if (!user) {
      throw new Error('No authenticated user')
    }

    // Check if this is the special admin user
    const isSpecialAdmin = user.email === SPECIAL_ADMIN_EMAIL
    
    // Parse the request body
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
    
    // Provide special bypass mode for konointer@gmail.com
    if (isSpecialAdmin) {
      if (action === 'force_super_admin_role') {
        console.log("Action force_super_admin_role requested for", targetUserId || user.id)
        
        try {
          // Try three different methods to ensure the role is set
          let success = false
          
          // Method 1: Use RPC function
          try {
            const { error: rpcError } = await supabaseAdmin.rpc(
              'force_set_super_admin_role',
              { target_user_id: targetUserId || user.id }
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
                    user_id: targetUserId || user.id, 
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
          
          // Method 3: Execute raw SQL as last resort
          if (!success) {
            try {
              const { error: sqlError } = await supabaseAdmin.rpc(
                'execute_admin_sql',
                { 
                  sql_command: `
                    INSERT INTO public.user_roles (user_id, role, updated_at)
                    VALUES ('${targetUserId || user.id}', 'super_admin', now())
                    ON CONFLICT (user_id) 
                    DO UPDATE SET role = 'super_admin', updated_at = now();
                  `
                }
              )
              
              if (!sqlError) {
                success = true
                console.log("Method 3 successful")
              } else {
                console.error("Method 3 error:", sqlError)
              }
            } catch (error) {
              console.error("Method 3 exception:", error)
            }
          }
          
          // Check if the role was set correctly
          const { data: roleCheck, error: checkError } = await supabaseAdmin
            .from("user_roles")
            .select("role")
            .eq("user_id", targetUserId || user.id)
            .single();
            
          if (checkError) {
            console.error("Role check error:", checkError)
          } else {
            console.log("Role check result:", roleCheck)
            success = roleCheck?.role === 'super_admin'
          }
          
          if (success) {
            console.log("Role set successfully for", targetUserId || user.id)
          } else {
            console.error("Failed to set role after all attempts")
          }
          
          return new Response(
            JSON.stringify({ 
              success, 
              message: success ? 'Super admin role applied successfully' : 'Failed to apply role',
              current_role: roleCheck?.role
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } catch (innerError) {
          console.error("Inner error:", innerError)
          throw innerError
        }
      } 
      else if (action === 'diagnostic') {
        console.log("Diagnostic action requested")
        
        // Comprehensive diagnostic information
        const diagnosticData: Record<string, any> = {
          user: {
            id: user.id,
            email: user.email,
          },
          timestamp: new Date().toISOString(),
        }
        
        // Get user role
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
        
        // Check modules table access
        try {
          const { data: modulesData, error: modulesError } = await supabaseClient
            .from('modules')
            .select('count(*)')
            .single()
          
          diagnosticData.modules_access = !modulesError
          diagnosticData.modules_count = modulesData?.count
          
          if (modulesError) {
            diagnosticData.modules_error = modulesError.message
          }
        } catch (e) {
          diagnosticData.modules_error = `Exception: ${e.message}`
        }
        
        // Try to run create_default_modules
        try {
          const { error: defaultModulesError } = await supabaseClient.rpc('create_default_modules')
          
          diagnosticData.default_modules_result = !defaultModulesError
          
          if (defaultModulesError) {
            diagnosticData.default_modules_error = defaultModulesError.message
          }
        } catch (e) {
          diagnosticData.default_modules_error = `Exception: ${e.message}`
        }
        
        // Check if the special bypass is active
        diagnosticData.is_special_admin = isSpecialAdmin
        
        return new Response(
          JSON.stringify({
            success: true,
            ...diagnosticData
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }
    
    // If we reach here, either the user is not konointer@gmail.com or the action is not supported
    if (!isSpecialAdmin) {
      throw new Error('Unauthorized: Only the special admin can use this function')
    } else {
      throw new Error('Invalid action specified')
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
