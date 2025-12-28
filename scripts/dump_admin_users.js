
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'http://127.0.0.1:54321';
const SERVICE_KEY = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

async function dumpAdmins() {
    const client = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: admins, error } = await client.from('admin_users').select('*');
    if (error) console.error(error);
    else console.log('Admin Users:', admins);
}

dumpAdmins();
