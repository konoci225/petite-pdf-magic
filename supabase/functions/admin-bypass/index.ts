
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
    // Create a Supabase client with the Auth context of the user that called the function
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
    if (!user || user.email !== 'konointer@gmail.com') {
      throw new Error('Unauthorized: Only the special admin can use this function')
    }

    // Parse the request body
    const { action, targetUserId } = await req.json()

    // Handle different actions
    if (action === 'force_super_admin_role') {
      // Use the admin-powered client to set the user's role directly, bypassing RLS
      const { error } = await supabaseClient
        .from('user_roles')
        .upsert(
          { user_id: targetUserId || user.id, role: 'super_admin' },
          { onConflict: 'user_id' }
        )
      
      if (error) throw error
      
      return new Response(
        JSON.stringify({ success: true, message: 'Super admin role applied successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    throw new Error('Invalid action specified')
  } catch (error) {
    console.error('Admin bypass function error:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
