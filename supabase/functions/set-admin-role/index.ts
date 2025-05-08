
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
    
    // Create a Supabase client with SERVICE ROLE KEY (bypass RLS)
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
          console.error(`Erreur ou utilisateur non trouvé pour l'email ${email}:`, userError)
          // Try to get all users to find a match (fallback)
          const { data: users } = await supabaseAdmin.auth.admin.listUsers()
          const matchedUser = users?.users?.find(u => u.email === email)
          
          if (matchedUser) {
            console.log(`Utilisateur trouvé par liste: ${matchedUser.id}`)
            targetUserId = matchedUser.id
          } else {
            throw new Error(`No user found with email: ${email}`)
          }
        } else {
          console.log(`Utilisateur trouvé: ${userData.user.id}`)
          targetUserId = userData.user.id
        }
      } catch (error) {
        console.error("Erreur lors de la recherche d'utilisateur par email:", error)
        throw error
      }
    }
    
    if (!targetUserId) {
      throw new Error('Could not determine user ID')
    }
    
    // MÉTHODE 1: Insert directs pour super_admin pour konointer@gmail.com
    console.log("MÉTHODE 1: Insertion directe dans user_roles")
    try {
      const { error: insertError } = await supabaseAdmin
        .from('user_roles')
        .upsert({ 
          user_id: targetUserId, 
          role: 'super_admin',
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
      
      if (insertError) {
        console.error("Erreur d'insertion:", insertError)
      } else {
        console.log("Succès avec l'insertion directe")
        success = true
      }
    } catch (e) {
      console.error("Exception lors de l'insertion:", e)
    }
    
    // MÉTHODE 2: Fonction RPC
    if (!success) {
      console.log("MÉTHODE 2: Tentative d'utiliser la fonction RPC force_set_super_admin_role")
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
    }
    
    // Vérification finale
    const { data: checkRole, error: checkError } = await supabaseAdmin
      .from('user_roles')
      .select('role, updated_at')
      .eq('user_id', targetUserId)
      .single()
      
    if (checkError) {
      console.error("Erreur de vérification du rôle:", checkError)
    } else {
      console.log("Rôle actuel:", checkRole?.role)
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
