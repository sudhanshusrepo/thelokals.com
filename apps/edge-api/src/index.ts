import { Hono } from 'hono'
import { createClient } from '@supabase/supabase-js'

type Bindings = {
    SUPABASE_URL: string
    SUPABASE_ANON_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', (c) => c.text('TheLokals Edge API is running!'))

app.get('/providers/nearby', async (c) => {
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY)

    const lat = c.req.query('lat')
    const lng = c.req.query('lng')
    const radius = c.req.query('radius') || '10000'

    if (!lat || !lng) {
        return c.json({ error: 'Missing lat/lng parameters' }, 400)
    }

    // Call the robust RPC we created in migration 003
    const { data, error } = await supabase.rpc('find_nearby_providers', {
        p_lat: parseFloat(lat),
        p_lng: parseFloat(lng),
        p_max_distance: parseInt(radius)
    })

    if (error) {
        return c.json({ error: error.message }, 500)
    }

    // Edge Caching: Cache this response for 60 seconds at the edge
    // This reduces DB load for users searching in the same area
    c.header('Cache-Control', 'public, max-age=60')

    return c.json(data)
})

export default app
