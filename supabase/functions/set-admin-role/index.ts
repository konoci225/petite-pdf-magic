
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
    // Create a Supabase client with the Auth context
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get the request data
    const { email, userId, forceRepair } = await req.json()
    
    if (!email && !userId) {
      throw new Error('Either email or userId is required')
    }

    console.log(`Attempting to set super_admin role using ${email ? 'email: ' + email : 'userId: ' + userId}`)
    
    let targetUserId = userId
    
    // If email is provided, find the user by email
    if (email && !targetUserId) {
      // Get the user by email through auth admin API
      const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
      
      if (authError) {
        throw new Error(`Error fetching auth users: ${authError.message}`)
      }
      
      const matchedUser = authUsers?.users?.find(u => u.email === email)
      
      if (!matchedUser) {
        throw new Error(`No user found with email: ${email}`)
      }
      
      targetUserId = matchedUser.id
    }
    
    if (!targetUserId) {
      throw new Error('Could not determine user ID')
    }
    
    // Utiliser la fonction RPC mise à jour qui retourne un booléen
    const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc(
      'force_set_super_admin_role',
      { target_user_id: targetUserId }
    )
    
    let success = false
    
    if (rpcError) {
      console.error('Error with RPC method:', rpcError)
      
      // Try the function that uses email if the direct approach fails
      if (email) {
        const { data: emailResult, error: emailError } = await supabaseAdmin.rpc(
          'force_set_super_admin_role_by_email',
          { user_email: email }
        )
        
        if (!emailError && emailResult === true) {
          console.log('Successfully set super_admin role via email function')
          success = true
        } else if (emailError) {
          console.error('Error with email function:', emailError)
        }
      }
      
      // Fallback to direct insert/update if RPC fails
      if (!success) {
        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .upsert(
            { 
              user_id: targetUserId, 
              role: 'super_admin',
              updated_at: new Date().toISOString() 
            },
            { onConflict: 'user_id' }
          )
        
        if (roleError) {
          console.error('Error with direct upsert:', roleError)
        } else {
          console.log('Successfully set role via direct upsert')
          success = true
        }
      }
    } else {
      console.log('Successfully set super_admin role via main RPC function')
      success = true
    }
    
    return new Response(
      JSON.stringify({ 
        success: success, 
        message: success ? 'Successfully set super_admin role' : 'Failed to set super_admin role' 
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
