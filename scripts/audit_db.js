
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

// Config
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
    console.error('Error: SUPABASE_SERVICE_ROLE_KEY is missing from .env');
    process.exit(1);
}

async function auditDb() {
    console.log('--- DB AUDIT ---');
    const client = createClient(SUPABASE_URL, SERVICE_KEY);

    // 1. Check Policies on 'providers'
    const { data: policies, error: polError } = await client.rpc('get_policies_for_table', {
        p_table_name: 'providers'
    });

    if (polError) console.error('Policy Audit Error:', polError);
    else {
        console.log(`Active Policies on providers (${policies.length}):`);
        policies.forEach(p => console.log(`- [${p.cmd}] ${p.policyname} (Permissive: ${p.permissive})`));
    }

    // 2. Check Triggers on 'providers'
    const { data: triggers, error: trError } = await client.rpc('get_triggers_for_table', {
        p_table_name: 'providers'
    });

    if (trError) console.error('Trigger Audit Error:', trError);
    else {
        console.log(`Active Triggers on providers (${triggers.length}):`);
        triggers.forEach(t => console.log(`- [${t.event_manipulation}] ${t.trigger_name} -> ${t.action_statement}`));
    }

    // 3. Check Grants? (Hard via API)

}

auditDb();
