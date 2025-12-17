
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBooking() {
    const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Latest 5 Bookings:');
        data.forEach(b => {
            console.log(`ID: ${b.id}, User: ${b.user_id}, Category: ${b.service_category}, Status: ${b.status}, Created: ${b.created_at}`);
        });
    }
}

checkBooking();
