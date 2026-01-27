

// scripts/test_geo_integration.js

// Mock Logic Definitions (Copies of what's in platform-core)
const CONFIG = { EDGE_API_URL: 'https://worker-api.com' };

async function isServiceEnabled(serviceCode, pincode) {
    if (CONFIG.EDGE_API_URL) {
        try {
            const url = new URL(`${CONFIG.EDGE_API_URL}/availability/check`);
            url.searchParams.append('service', serviceCode);
            url.searchParams.append('pincode', pincode);

            console.log(`[Client] Calling Worker: ${url.toString()}`);
            const res = await fetch(url.toString());
            if (res.ok) {
                const data = await res.json();
                return data.is_enabled;
            }
        } catch (e) {
            console.warn('Fallback triggered');
        }
    }
    return true;
}

// Mock Fetch
global.fetch = async (url) => {
    return {
        ok: true,
        json: async () => ({ is_enabled: false, from_worker: true })
    };
};

async function run() {
    console.log("🚀 Simulating Client-Side Availability Check...");
    const result = await isServiceEnabled("PLUMBING", "400001");
    console.log(`Service Enabled: ${result}`);

    if (result === false) console.log("✅ Worker Integration Logic Verified (Simulated)");
    else console.error("❌ Failed");
}

run();

