
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
    const { email } = await req.json()
    
    if (!email) {
      throw new Error('Email is required')
    }

    console.log(`Attempting to set super_admin role for user with email: ${email}`)
    
    // Get the user by email
    const { data: users, error: userError } = await supabaseAdmin
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .limit(1)
    
    if (userError) {
      console.error('Error fetching user:', userError)
      throw new Error(`Error fetching user: ${userError.message}`)
    }
    
    if (!users || users.length === 0) {
      throw new Error(`No user found with email: ${email}`)
    }
    
    const userId = users[0].id
    
    // Set super_admin role directly using the service role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .upsert(
        { user_id: userId, role: 'super_admin' },
        { onConflict: 'user_id' }
      )
    
    if (roleError) {
      console.error('Error setting role:', roleError)
      throw new Error(`Error setting role: ${roleError.message}`)
    }
    
    return new Response(
      JSON.stringify({ success: true, message: 'Successfully set super_admin role' }),
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
