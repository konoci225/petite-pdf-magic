
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
    console.log("Fonction admin-bypass appelée")
    
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
    if (!user || user.email !== 'konointer@gmail.com') {
      throw new Error('Unauthorized: Only the special admin can use this function')
    }

    // Parse the request body
    const { action, targetUserId } = await req.json()

    // Handle different actions
    if (action === 'force_super_admin_role') {
      console.log("Action force_super_admin_role demandée pour", targetUserId || user.id)
      
      // Use the admin-powered client to set the user's role directly, bypassing RLS
      const { error } = await supabaseClient
        .from('user_roles')
        .upsert(
          { user_id: targetUserId || user.id, role: 'super_admin', updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        )
      
      if (error) {
        console.error("Erreur lors de l'upsert du rôle:", error)
        throw error
      }
      
      console.log("Rôle défini avec succès pour", targetUserId || user.id)
      
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
