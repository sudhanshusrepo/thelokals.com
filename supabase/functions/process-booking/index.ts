import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

interface Booking {
    id: string
    service_category: string
    service_mode: 'local' | 'online'
    location: string | null // PostGIS point
    address: any
    status: string
}

Deno.serve(async (req) => {
    try {
        const payload = await req.json()

        // Webhook payload structure: { type: 'INSERT', table: 'bookings', record: { ... }, schema: 'public' }
        const { record } = payload as { record: Booking }

        if (!record || record.status !== 'REQUESTED') {
            return new Response(JSON.stringify({ message: 'Ignored: Not a new requested booking' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        console.log(`Processing booking: ${record.id} (${record.service_category})`)

        // 1. Find matching providers
        let query = supabase
            .from('providers')
            .select('id')
            .eq('is_active', true)
            .contains('services', [record.service_category])

        // Filter by location for local services (MVP: City match)
        if (record.service_mode === 'local' && record.address && record.address.city) {
            query = query.eq('city', record.address.city)
        }

        const { data: providers, error: providerError } = await query

        if (providerError) {
            throw new Error(`Provider lookup failed: ${providerError.message}`)
        }

        if (!providers || providers.length === 0) {
            console.log('No matching providers found')
            return new Response(JSON.stringify({ message: 'No matching providers found' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        const providerIds = providers.map(p => p.id)
        console.log(`Found ${providerIds.length} matching providers`)

        // 2. Create booking requests
        const requests = providerIds.map(providerId => ({
            booking_id: record.id,
            provider_id: providerId,
            status: 'PENDING'
        }))

        const { error: requestError } = await supabase
            .from('booking_requests')
            .insert(requests)

        if (requestError) {
            throw new Error(`Failed to create requests: ${requestError.message}`)
        }

        // 3. Update booking status to PENDING (Matching in progress)
        await supabase
            .from('bookings')
            .update({ status: 'PENDING' })
            .eq('id', record.id)

        // 4. Log lifecycle event
        await supabase
            .from('booking_lifecycle_events')
            .insert({
                booking_id: record.id,
                phase: 'MATCH',
                event_type: 'providers_notified',
                event_data: { count: providerIds.length }
            })

        return new Response(JSON.stringify({
            success: true,
            message: `Notified ${providerIds.length} providers`
        }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error('Error processing booking:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
