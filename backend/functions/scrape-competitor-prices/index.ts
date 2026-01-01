import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const COMPETITORS = [
    { name: 'UrbanCompany', baseUrl: 'https://www.urbancompany.com' },
    { name: 'Housejoy', baseUrl: 'https://www.housejoy.in' },
    { name: 'Justdial', baseUrl: 'https://www.justdial.com' },
];

// Mock function to simulate scraping - in production this would parse HTML
function parseCompetitorPrices(html: string, competitor: string) {
    // Logic to parse HTML and extract prices would go here
    // For now, returning mock data
    return [
        {
            category: 'Cleaning',
            type: 'Home Cleaning',
            amount: Math.floor(Math.random() * (800 - 500 + 1) + 500), // Random price 500-800
            location: 'Mumbai',
            metadata: { rating: 4.5 }
        },
        {
            category: 'Plumbing',
            type: 'Tap Repair',
            amount: Math.floor(Math.random() * (300 - 150 + 1) + 150), // Random price 150-300
            location: 'Mumbai',
            metadata: { rating: 4.2 }
        }
    ];
}

serve(async (req) => {
    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const scraperApiKey = Deno.env.get('SCRAPER_API_KEY');

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing Supabase environment variables');
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const results = [];

        for (const competitor of COMPETITORS) {
            try {
                console.log(`Scraping ${competitor.name}...`);

                // In a real scenario, we would make a request to the scraper API
                // const targetUrl = `${competitor.baseUrl}/services`;
                // const response = await fetch(`http://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(targetUrl)}`);
                // const html = await response.text();

                // Simulating delay
                await new Promise(resolve => setTimeout(resolve, 500));
                const html = "<html>Mock HTML</html>";

                const prices = parseCompetitorPrices(html, competitor.name);

                // Store in database
                for (const price of prices) {
                    const { error } = await supabase.from('competitor_prices').insert({
                        competitor_name: competitor.name,
                        service_category: price.category,
                        service_type: price.type,
                        price: price.amount,
                        location: price.location,
                        source_url: competitor.baseUrl,
                        metadata: price.metadata,
                    });

                    if (error) {
                        console.error(`Error inserting price for ${competitor.name}:`, error);
                    }
                }

                results.push({ competitor: competitor.name, count: prices.length, status: 'success' });
            } catch (error) {
                console.error(`Error scraping ${competitor.name}:`, error);
                results.push({ competitor: competitor.name, error: error.message, status: 'failed' });
            }
        }

        return new Response(JSON.stringify({ success: true, results }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});
