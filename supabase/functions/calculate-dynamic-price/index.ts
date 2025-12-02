import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.1.3';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY')!);

interface PricingRequest {
    serviceCategory: string;
    serviceType: string;
    location: { lat: number; lng: number };
    requestedTime: string; // ISO timestamp
    providerId?: string;
}

serve(async (req) => {
    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { serviceCategory, serviceType, location, requestedTime, providerId }: PricingRequest = await req.json();

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        // 1. Fetch base price
        const { data: basePriceData, error: basePriceError } = await supabase
            .from('base_prices')
            .select('base_price')
            .eq('service_category', serviceCategory)
            .eq('service_type', serviceType)
            .single();

        if (basePriceError || !basePriceData) {
            console.error('Base price not found:', basePriceError);
            // Fallback if base price not found
            return new Response(JSON.stringify({
                success: true,
                price: 500, // Default fallback
                breakdown: { base: 500, timingMultiplier: 1, locationMultiplier: 1, demandMultiplier: 1, aiAdjustment: 1 },
                reasoning: "Base price not found, using default.",
                currency: 'INR',
                isFallback: true
            }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const basePrice = basePriceData.base_price;

        // 2. Get timing multiplier
        const requestTime = new Date(requestedTime);
        const hour = requestTime.getHours();
        const isWeekend = [0, 6].includes(requestTime.getDay());

        const { data: timingData } = await supabase
            .from('timing_multipliers')
            .select('multiplier')
            .lte('start_hour', hour)
            .gte('end_hour', hour)
            .eq('day_type', isWeekend ? 'weekend' : 'weekday')
            .single();

        const timingMultiplier = timingData?.multiplier || 1.0;

        // 3. Get location multiplier
        // Note: This RPC call assumes the function exists from Phase 1 migration
        const { data: locationData } = await supabase.rpc('get_location_zone', {
            lat: location.lat,
            lng: location.lng,
        });

        const locationMultiplier = locationData?.[0]?.price_multiplier || 1.0;
        const locationZoneName = locationData?.[0]?.zone_name || 'Standard';

        // 4. Get competitor average price
        const { data: competitorPrices } = await supabase
            .from('competitor_prices')
            .select('price')
            .eq('service_category', serviceCategory)
            .eq('service_type', serviceType)
            .gte('scraped_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .order('scraped_at', { ascending: false })
            .limit(10);

        const avgCompetitorPrice = competitorPrices?.length
            ? competitorPrices.reduce((sum, p) => sum + p.price, 0) / competitorPrices.length
            : null;

        // 5. Get booking analytics (demand)
        const { data: analytics } = await supabase
            .from('booking_analytics')
            .select('booking_count, avg_price')
            .eq('service_category', serviceCategory)
            .eq('service_type', serviceType)
            .gte('time_bucket', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
            .order('time_bucket', { ascending: false })
            .limit(168); // Last week hourly

        const recentBookingVolume = analytics?.reduce((sum, a) => sum + a.booking_count, 0) || 0;
        const historicalAvgPrice = analytics?.[0]?.avg_price || basePrice;

        // 6. Get provider availability
        const { count: providerCount } = await supabase
            .from('providers')
            .select('id', { count: 'exact', head: true })
            .eq('service_category', serviceCategory)
            .eq('is_available', true)
            .eq('is_online', true);

        // 7. Call Gemini AI for dynamic pricing
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `You are a dynamic pricing expert for a local services marketplace.

Calculate the optimal price for the following service:

**Base Information:**
- Service: ${serviceCategory} - ${serviceType}
- Base Price: ₹${basePrice}
- Requested Time: ${requestedTime}

**Market Data:**
- Competitor Average Price: ${avgCompetitorPrice ? `₹${avgCompetitorPrice.toFixed(2)}` : 'N/A'}
- Our Historical Average: ₹${historicalAvgPrice}

**Demand Factors:**
- Timing Multiplier: ${timingMultiplier}x (${isWeekend ? 'Weekend' : 'Weekday'}, ${hour}:00)
- Location Multiplier: ${locationMultiplier}x (Zone: ${locationZoneName})
- Available Providers: ${providerCount || 0}
- Recent Booking Volume: ${recentBookingVolume} (last 7 days)

**Pricing Strategy:**
1. Stay competitive with market (within 5-10% of competitor average if available)
2. Apply timing and location multipliers
3. Adjust for provider availability (fewer providers = higher price, max 1.3x)
4. Consider demand trends (high demand = slight premium, max 1.2x)
5. Ensure profitability (minimum 20% margin)

Return ONLY a JSON object with this exact structure:
{
  "finalPrice": <number>,
  "breakdown": {
    "base": <number>,
    "timingMultiplier": <number>,
    "locationMultiplier": <number>,
    "demandMultiplier": <number>,
    "aiAdjustment": <number>
  },
  "reasoning": "<brief explanation>"
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid AI response format');
        }

        const pricing = JSON.parse(jsonMatch[0]);

        // 8. Store pricing history (async, don't await)
        supabase.from('pricing_history').insert({
            service_category: serviceCategory,
            service_type: serviceType,
            base_price: basePrice,
            final_price: pricing.finalPrice,
            multipliers: pricing.breakdown,
            competitor_avg_price: avgCompetitorPrice,
        }).then(({ error }) => {
            if (error) console.error('Error storing pricing history:', error);
        });

        return new Response(JSON.stringify({
            success: true,
            price: pricing.finalPrice,
            breakdown: pricing.breakdown,
            reasoning: pricing.reasoning,
            currency: 'INR',
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Pricing error:', error);

        // Fallback pricing logic
        return new Response(JSON.stringify({
            success: false,
            error: error.message,
            fallbackPrice: 500, // Should ideally calculate basic multipliers here
            isFallback: true
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
