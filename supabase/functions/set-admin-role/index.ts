
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
        // Get user by email
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserByEmail(email)
        
        if (userError || !userData?.user) {
          console.error(`Error or user not found for email ${email}:`, userError)
          // Try to get all users to find a match (fallback)
          const { data: users } = await supabaseAdmin.auth.admin.listUsers()
          const matchedUser = users?.users?.find(u => u.email === email)
          
          if (matchedUser) {
            console.log(`User found by list: ${matchedUser.id}`)
            targetUserId = matchedUser.id
          } else {
            throw new Error(`No user found with email: ${email}`)
          }
        } else {
          console.log(`User found: ${userData.user.id}`)
          targetUserId = userData.user.id
        }
      } catch (error) {
        console.error("Error looking up user by email:", error)
        throw error
      }
    }
    
    if (!targetUserId) {
      throw new Error('Could not determine user ID')
    }
    
    // METHOD 1: Direct inserts for super_admin for konointer@gmail.com
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
    }
    
    // Final check
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
    
    return new Response(
      JSON.stringify({ 
        success, 
        message: success ? 'Successfully set super_admin role' : 'Failed to set super_admin role',
        userId: targetUserId,
        roleData: checkRole || null
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
