import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Helper to read .env manually (since dotenv might not be installed)
function getEnvVars() {
    try {
        const envPath = path.resolve(process.cwd(), '.env'); // Assume running from root
        if (!fs.existsSync(envPath)) {
            console.warn('⚠️ .env file not found at:', envPath);
            return {};
        }
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const envVars: Record<string, string> = {};
        envContent.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["'](.*)["']$/, '$1'); // Remove quotes
                envVars[key] = value;
            }
        });
        return envVars;
    } catch (error) {
        console.error('Error reading .env:', error);
        return {};
    }
}

const env = getEnvVars();
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false // Node.js environment
    }
});

async function verifyFeatureToggle() {
    console.log('Starting Feature Toggle Verification (Node.js)...');

    // 1. Resolve Location (Expected: Bangalore)
    const bangaloreCoords = { lat: 12.9716, lng: 77.5946 };
    console.log(`\n1. Resolving Location for Bangalore (${bangaloreCoords.lat}, ${bangaloreCoords.lng})...`);

    const { data: locationIdBng, error: errBng } = await supabase.rpc('get_location_from_coords', {
        p_lat: bangaloreCoords.lat,
        p_lng: bangaloreCoords.lng
    });

    if (errBng) {
        console.error('Error resolving Bangalore location:', errBng);
        return;
    }
    console.log('Resolved Location ID:', locationIdBng);

    if (locationIdBng) {
        const { data: locData } = await supabase
            .from('locations')
            .select('name, enabled_services, is_emergency_disabled')
            .eq('id', locationIdBng)
            .single();

        console.log('Location Details:', locData);

        if (locData && locData.enabled_services) {
            // Check if plumbing is enabled (should be)
            const enabledServices = locData.enabled_services as string[];
            const isPlumbingEnabled = Array.isArray(enabledServices) && enabledServices.includes('plumbing');
            console.log('Is Plumbing Enabled?', isPlumbingEnabled ? '✅ YES' : '❌ NO');

            // Check if non-existent service is enabled (should not be)
            const isRocketScienceEnabled = Array.isArray(enabledServices) && enabledServices.includes('rocket_science');
            console.log('Is Rocket Science Enabled?', isRocketScienceEnabled ? '❌ YES' : '✅ NO');
        } else {
            console.warn('Location found but no enabled_services data:', locData);
        }
    }

    // 2. Resolve Random Location (Expected: Null or fallback if covered)
    const randomCoords = { lat: 28.6139, lng: 77.2090 }; // Delhi (Schema only has Bangalore seeded?)
    console.log(`\n2. Resolving Location for Delhi (${randomCoords.lat}, ${randomCoords.lng})...`);

    const { data: locationIdDel, error: errDel } = await supabase.rpc('get_location_from_coords', {
        p_lat: randomCoords.lat,
        p_lng: randomCoords.lng
    });

    if (locationIdDel) {
        console.log('Resolved Location ID (Delhi):', locationIdDel);
    } else {
        console.log('Resolved Location ID (Delhi): NULL (Correct, not seeded/covered)');
    }

    console.log('\nVerification Complete.');
}

verifyFeatureToggle().catch(console.error);
