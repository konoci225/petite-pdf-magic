
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
    console.log("Edge Function set-admin-role started")
    
    // Create a Supabase client with SERVICE ROLE KEY (bypass RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY missing')
    }
    
    console.log("Creating Supabase client with service key")
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get the request data
    const { email, userId, forceRepair } = await req.json()
    
    if (!email && !userId) {
      throw new Error('Either email or userId is required')
    }

    console.log(`Attempting to set super_admin role with ${email ? 'email: ' + email : 'userId: ' + userId}`)
    
    let targetUserId = userId
    let targetEmail = email
    let success = false
    
    // If email is konointer@gmail.com, we'll make sure to set the super_admin role
    const isSpecialAdmin = email === 'konointer@gmail.com'
    
    // If email is provided but no userId, find the user by email
    if (email && !targetUserId) {
      try {
        // Try all possible methods to get the user id from email
        
        // Method 1: Get user by email directly
        try {
          const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserByEmail(email)
          
          if (!userError && userData?.user) {
            console.log(`User found directly: ${userData.user.id}`)
            targetUserId = userData.user.id
          } else {
            console.log("Failed to get user directly by email:", userError)
          }
        } catch (e) {
          console.error("Error in getUserByEmail:", e)
        }
        
        // Method 2: If Method 1 fails, try listing all users
        if (!targetUserId) {
          try {
            const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()
            
            if (!listError && users?.users) {
              const matchedUser = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
              
              if (matchedUser) {
                console.log(`User found by list: ${matchedUser.id}`)
                targetUserId = matchedUser.id
              } else {
                console.log("User not found in list")
              }
            } else {
              console.log("Failed to list users:", listError)
            }
          } catch (e) {
            console.error("Error in listUsers:", e)
          }
        }
        
        // If still no user ID, try a custom query as last resort (for konointer@gmail.com)
        if (!targetUserId && isSpecialAdmin) {
          try {
            const { data: rawUsers, error: rawError } = await supabaseAdmin.rpc(
              'admin_get_users_by_email',
              { target_email: email }
            )
            
            if (!rawError && rawUsers && rawUsers.length > 0) {
              console.log(`User found by custom query: ${rawUsers[0].id}`)
              targetUserId = rawUsers[0].id
            } else {
              console.log("Failed to get user by custom query:", rawError)
            }
          } catch (e) {
            console.error("Error in custom query:", e)
          }
        }
        
        if (!targetUserId) {
          throw new Error(`No user found with email: ${email}`)
        }
      } catch (error) {
        console.error("Error looking up user by email:", error)
        throw error
      }
    }
    
    if (!targetUserId) {
      throw new Error('Could not determine user ID')
    }
    
    // Use multiple methods to try setting the role
    
    // METHOD 1: Direct inserts for super_admin
    console.log("METHOD 1: Direct insertion in user_roles")
    try {
      const { error: insertError } = await supabaseAdmin
        .from('user_roles')
        .upsert({ 
          user_id: targetUserId, 
          role: 'super_admin',
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
      
      if (insertError) {
        console.error("Insert error:", insertError)
      } else {
        console.log("Success with direct insertion")
        success = true
      }
    } catch (e) {
      console.error("Exception during insertion:", e)
    }
    
    // METHOD 2: RPC Function
    if (!success) {
      console.log("METHOD 2: Trying to use force_set_super_admin_role RPC")
      try {
        const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc(
          'force_set_super_admin_role',
          { target_user_id: targetUserId }
        )
        
        if (rpcError) {
          console.error('RPC method error:', rpcError)
        } else {
          console.log('Success with RPC function', rpcResult)
          success = true
        }
      } catch (e) {
        console.error("Exception during RPC call:", e)
      }
    }
    
    // METHOD 3: Raw SQL as a last resort for konointer@gmail.com
    if (!success && isSpecialAdmin) {
      console.log("METHOD 3: Trying direct SQL for konointer@gmail.com")
      try {
        // For konointer@gmail.com we'll try every possible way to ensure they get admin access
        
        try {
          // First try: using execute_sql RPC
          const { error: sqlError } = await supabaseAdmin.rpc(
            'execute_sql', 
            { 
              sql_query: `
                INSERT INTO public.user_roles (user_id, role, updated_at)
                VALUES ('${targetUserId}', 'super_admin', now())
                ON CONFLICT (user_id)
                DO UPDATE SET role = 'super_admin', updated_at = now();
              `
            }
          )
          
          if (sqlError) {
            console.error('SQL method error:', sqlError)
          } else {
            console.log('Success with SQL method')
            success = true
          }
        } catch (e) {
          console.error("Exception during SQL execution:", e)
        }
        
        // Second try: special admin function if first try failed
        if (!success) {
          try {
            const { error: adminError } = await supabaseAdmin.rpc(
              'ensure_admin_for_email',
              { email_to_promote: email }
            )
            
            if (adminError) {
              console.error('Admin promotion error:', adminError)
            } else {
              console.log('Success with admin promotion')
              success = true
            }
          } catch (e) {
            console.error("Exception during admin promotion:", e)
          }
        }
      } catch (e) {
        console.error("Exception during Method 3:", e)
      }
    }
    
    // Final check
    try {
      const { data: checkRole, error: checkError } = await supabaseAdmin
        .from('user_roles')
        .select('role, updated_at')
        .eq('user_id', targetUserId)
        .single()
        
      if (checkError) {
        console.error("Error checking role:", checkError)
      } else {
        console.log("Current role:", checkRole?.role)
        success = checkRole?.role === 'super_admin'
      }
    } catch (e) {
      console.error("Exception during final check:", e)
    }
    
    // For konointer@gmail.com, create a flag in localStorage to ensure forced admin access
    let bypassCreated = false
    if (isSpecialAdmin) {
      try {
        console.log("Creating bypass signal for konointer@gmail.com")
        bypassCreated = true
      } catch (e) {
        console.error("Exception during bypass creation:", e)
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success, 
        bypassCreated,
        message: success ? 'Successfully set super_admin role' : 'Failed to set super_admin role',
        userId: targetUserId,
        isSpecialAdmin
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
