
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env from root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Force local for verification
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

console.log('Connecting to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRpc() {
    // 1. Create a throwaway user to simulate real auth
    const email = `testrpc_${Date.now()}@example.com`;
    const password = 'Password123!';

    console.log('Creating user:', email);
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
    });

    if (authError) {
        console.error('Auth Error:', authError);
        return;
    }

    const user = authData.user;
    if (!user) {
        console.error('No user created');
        return;
    }
    console.log('User created:', user.id);

    // 2. Call RPC as this user (using the same admin client is actually VALID because SECURITY DEFINER should handle it,
    // OR we can rely on the fact that we are passing the VALID user_id now, so FK constraint check should pass).

    // Note: To test RLS strictly, we would need to sign in and use the resulting session. To do that we need the Anon Key.
    // But since I don't have the Anon Key handy (opaque issue), I will test FUNCTIONALITY (FK constraint + Execution).
    // If this works, then at least the DB side is perfect.

    const { data, error } = await supabase.rpc('create_ai_booking', {
        p_user_id: user.id,
        p_service_category: 'Plumber',
        p_requirements: { description: 'Test RLS' },
        p_ai_checklist: ['Item 1'],
        p_estimated_cost: 100,
        p_location: 'POINT(0 0)',
        p_address: {},
        p_notes: null,
        p_service_category_id: null,
        p_delivery_mode: 'LOCAL'
    });

    if (error) {
        console.error('RPC Error:', error);
    } else {
        console.log('RPC Success:', data);
    }
}

testRpc();
