
const https = require('https');

const PROJECT_REF = 'gdnltvvxiychrsdzenia';
const PAT = 'sbp_1fe07add23a7109522e91489fdeb8a14c7400a6a';

const executeSql = (sqlQuery, description) => {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            query: sqlQuery
        });

        const options = {
            hostname: 'api.supabase.com',
            port: 443,
            path: `/v1/projects/${PROJECT_REF}/database/query`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${PAT}`,
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = https.request(options, (res) => {
            let responseBody = '';
            res.on('data', chunk => responseBody += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log(`✅ ${description} Success`);
                    // console.log(responseBody);
                    resolve(JSON.parse(responseBody));
                } else {
                    console.error(`❌ ${description} Error:`, responseBody);
                    resolve(null);
                }
            });
        });
        req.on('error', (error) => console.error(error));
        req.write(data);
        req.end();
    });
};

const main = async () => {
    console.log("👷 Testing Admin RPC...");

    // 1. Get a Pincode ID and Service ID for testing
    const setupData = await executeSql(`
        SELECT p.id as pin_id, s.id as svc_id 
        FROM pincodes p, services s 
        WHERE s.code = 'PLUMBING' 
        LIMIT 1
    `, "Get IDs");

    if (!setupData || setupData.length === 0) return;
    const { pin_id, svc_id } = setupData[0];
    console.log(`IDs: Pincode=${pin_id}, Service=${svc_id}`);

    // 2. Disable Plumbing for this Pincode (RPC Call)
    await executeSql(`
        SELECT toggle_service_availability('${svc_id}', 'PINCODE', '${pin_id}', false);
    `, "Disable Plumbing (RPC)");

    // 3. Verify in Table
    const verify1 = await executeSql(`
        SELECT is_enabled, priority FROM service_availability 
        WHERE service_id='${svc_id}' AND scope_id='${pin_id}'
    `, "Verify Insert");

    if (verify1 && verify1[0].is_enabled === false) {
        console.log("✅ Verified: Service Disabled locally.");
    } else {
        console.error("❌ Verification Failed");
    }

    // 4. Re-enable (RPC Call)
    await executeSql(`
        SELECT toggle_service_availability('${svc_id}', 'PINCODE', '${pin_id}', true);
    `, "Enable Plumbing (RPC)");

    // 5. Verify Update
    const verify2 = await executeSql(`
        SELECT is_enabled, priority FROM service_availability 
        WHERE service_id='${svc_id}' AND scope_id='${pin_id}'
    `, "Verify Update");

    if (verify2 && verify2[0].is_enabled === true) {
        console.log("✅ Verified: Service Re-enabled locally.");
    } else {
        console.error("❌ Verification Failed");
    }
};

main();
