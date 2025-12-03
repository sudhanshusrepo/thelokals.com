import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { firebaseToken, phone } = await req.json()

        if (!firebaseToken || !phone) {
            throw new Error('Missing firebaseToken or phone')
        }

        // Verify Firebase ID token
        const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?id_token=${firebaseToken}`)
        const payload = await response.json()

        if (payload.error) {
            throw new Error('Invalid Firebase token')
        }

        // Verify phone number matches (Firebase returns phone_number in payload)
        if (payload.phone_number && payload.phone_number !== phone) {
            throw new Error('Phone number mismatch')
        }

        // Create Supabase admin client
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            { auth: { autoRefreshToken: false, persistSession: false } }
        )

        // Check if user exists with this phone
        let { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('phone', phone)
            .single()

        let userId: string

        if (profileError || !profile) {
            // Create new user
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                phone,
                phone_confirm: true,
                user_metadata: { firebase_uid: payload.user_id }
            })

            if (authError) throw authError
            userId = authData.user.id

            // Create profile
            const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                    user_id: userId,
                    phone,
                    firebase_uid: payload.user_id
                })

            if (insertError) throw insertError
        } else {
            userId = profile.user_id

            // Update firebase_uid if not set
            await supabase
                .from('profiles')
                .update({ firebase_uid: payload.user_id })
                .eq('user_id', userId)
        }

        // Generate Supabase session
        const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
            type: 'magiclink',
            email: `${phone.replace('+', '')}@phone.auth`, // Dummy email for phone auth
            options: {
                redirectTo: Deno.env.get('SITE_URL') ?? 'http://localhost:3000'
            }
        })

        if (sessionError) throw sessionError

        // Create session for the user
        const { data, error: signInError } = await supabase.auth.admin.createSession({
            user_id: userId
        })

        if (signInError) throw signInError

        return new Response(
            JSON.stringify({
                session: data.session,
                user: data.user
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        console.error('Auth error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        )
    }
})
