
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
    console.log("Fonction Edge set-admin-role démarrée")
    
    // Create a Supabase client with the Auth context using SERVICE ROLE KEY (bypass RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY manquante')
    }
    
    console.log("Création du client Supabase avec clé de service")
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get the request data
    const { email, userId, forceRepair } = await req.json()
    
    if (!email && !userId) {
      throw new Error('Either email or userId is required')
    }

    console.log(`Tentative de définir le rôle super_admin avec ${email ? 'email: ' + email : 'userId: ' + userId}`)
    
    let targetUserId = userId
    let success = false
    
    // If email is provided, find the user by email
    if (email && !targetUserId) {
      console.log(`Recherche de l'utilisateur par email: ${email}`)
      
      // Utiliser directement l'API admin pour obtenir les utilisateurs
      const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
      
      if (authError) {
        console.error(`Erreur lors de la récupération des utilisateurs: ${authError.message}`)
        throw new Error(`Error fetching auth users: ${authError.message}`)
      }
      
      const matchedUser = authUsers?.users?.find(u => u.email === email)
      
      if (!matchedUser) {
        console.error(`Aucun utilisateur trouvé avec l'email: ${email}`)
        throw new Error(`No user found with email: ${email}`)
      }
      
      console.log(`Utilisateur trouvé avec ID: ${matchedUser.id}`)
      targetUserId = matchedUser.id
    }
    
    if (!targetUserId) {
      throw new Error('Could not determine user ID')
    }
    
    // MÉTHODE 1: Fonction RPC avec contournement RLS
    console.log("MÉTHODE 1: Tentative d'utiliser la fonction RPC force_set_super_admin_role")
    try {
      const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc(
        'force_set_super_admin_role',
        { target_user_id: targetUserId }
      )
      
      if (rpcError) {
        console.error('Erreur avec la méthode RPC:', rpcError)
      } else {
        console.log('Succès avec la fonction RPC', rpcResult)
        success = true
      }
    } catch (e) {
      console.error("Exception lors de l'appel RPC:", e)
    }
    
    // MÉTHODE 2: Si RPC échoue, essayer avec l'email
    if (!success && email) {
      console.log("MÉTHODE 2: Tentative avec la fonction email")
      try {
        const { data: emailResult, error: emailError } = await supabaseAdmin.rpc(
          'force_set_super_admin_role_by_email',
          { user_email: email }
        )
        
        if (emailError) {
          console.error('Erreur avec la fonction email:', emailError)
        } else {
          console.log('Succès avec fonction par email', emailResult)
          success = true
        }
      } catch (e) {
        console.error("Exception lors de l'appel de la fonction par email:", e)
      }
    }
      
    // MÉTHODE 3: Insertion directe dans la table
    if (!success) {
      console.log("MÉTHODE 3: Tentative d'insertion directe")
      try {
        const { error: insertError } = await supabaseAdmin
          .from('user_roles')
          .upsert({ 
            user_id: targetUserId, 
            role: 'super_admin',
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' })
        
        if (insertError) {
          console.error("Erreur d'insertion directe:", insertError)
        } else {
          console.log("Succès avec l'insertion directe")
          success = true
        }
      } catch (e) {
        console.error("Exception lors de l'insertion directe:", e)
      }
    }
    
    // Vérifier que le rôle a bien été défini
    if (success) {
      console.log("Vérification du rôle défini")
      const { data: checkRole, error: checkError } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', targetUserId)
        .single()
        
      if (checkError) {
        console.error("Erreur de vérification du rôle:", checkError)
      } else {
        console.log("Rôle actuel:", checkRole?.role)
        success = checkRole?.role === 'super_admin'
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success, 
        message: success ? 'Successfully set super_admin role' : 'Failed to set super_admin role',
        userId: targetUserId
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
