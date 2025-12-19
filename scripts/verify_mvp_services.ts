
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables manually
const envPath = path.resolve(__dirname, '../.env');
let env: Record<string, string> = {};

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const [key, ...parts] = line.split('=');
        if (key && parts.length > 0) {
            env[key.trim()] = parts.join('=').trim().replace(/"/g, ''); // Basic parsing
        }
    });
}

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'] || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const MVP_SERVICES = [
    'plumbing',
    'electrical',
    'ac_repair',
    'cab_rental',
    'bike_rental',
    'tutoring'
];

async function verifyServices() {
    console.log('Verifying MVP Services in DB...');
    const { data: services, error } = await supabase
        .from('services')
        .select('code, name, category, base_price_cents');

    if (error) {
        console.error('Error fetching services:', error);
        process.exit(1);
    }

    console.log(`Found ${services.length} services in DB.`);

    const missing = MVP_SERVICES.filter(code => !services.find(s => s.code === code));

    if (missing.length > 0) {
        console.error('❌ Missing MVP specific services:', missing);
        // List what we DO have
        console.log('Available services:', services.map(s => s.code));
        process.exit(1);
    }

    console.log('✅ All MVP Services present:', services.map(s => s.code).join(', '));
}

verifyServices();
