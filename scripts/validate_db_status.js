
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
                    console.log(`✅ ${description} Result:`, responseBody);
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
    console.log("--- Checking Row Counts ---");
    await executeSql('SELECT count(*) FROM public.states', 'States Count');
    await executeSql('SELECT count(*) FROM public.cities', 'Cities Count');
    await executeSql('SELECT count(*) FROM public.pincodes', 'Pincodes Count');

    console.log("\n--- Checking Pincodes Schema ---");
    const schemaSql = `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'pincodes';
    `;
    await executeSql(schemaSql, 'Pincodes Columns');
};

main();
