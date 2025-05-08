
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
    else if (action === 'get_user_role') {
      const userId = targetUserId || user.id
      console.log("Action get_user_role demandée pour", userId)
      
      const { data: roleData, error: roleError } = await supabaseClient
        .from('user_roles')
        .select('role, updated_at')
        .eq('user_id', userId)
        .single()
      
      if (roleError) {
        console.error("Erreur lors de la récupération du rôle:", roleError)
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
      console.log("Action de diagnostic demandée")
      
      // Récupérer les politiques RLS pour la table user_roles
      const { data: policies, error: policiesError } = await supabaseClient
        .rpc('get_policies_for_table', { table_name: 'user_roles' })
      
      // Récupérer toutes les tables avec RLS activée
      const { data: rlsTables, error: rlsError } = await supabaseClient
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .filter('has_row_level_security', 'eq', true)
      
      // Vérifier le rôle actuel
      const { data: roleData, error: roleError } = await supabaseClient
        .from('user_roles')
        .select('role, updated_at')
        .eq('user_id', user.id)
        .single()
      
      return new Response(
        JSON.stringify({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            role: roleData?.role || null,
            role_updated_at: roleData?.updated_at || null
          },
          system: {
            rls_tables: rlsTables || [],
            policies: policies || [],
            errors: {
              policies: policiesError ? policiesError.message : null,
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
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
