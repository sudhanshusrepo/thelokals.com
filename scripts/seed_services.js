
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
                    console.log(`✅ ${description}: Success`);
                    resolve(true);
                } else {
                    console.error(`❌ ${description}:`, responseBody);
                    resolve(false);
                }
            });
        });
        req.on('error', (error) => console.error(error));
        req.write(data);
        req.end();
    });
};

const main = async () => {
    console.log("🌱 Seeding Services...");

    const services = [
        { name: 'Plumbing', code: 'PLUMBING' },
        { name: 'Electrician', code: 'ELECTRICIAN' },
        { name: 'Carpentry', code: 'CARPENTRY' },
        { name: 'Deep Cleaning', code: 'DEEP_CLEAN' },
        { name: 'Appliance Repair', code: 'APPLIANCE' },
        { name: 'Painting', code: 'PAINTING' },
        { name: 'Pest Control', code: 'PEST_CONTROL' },
        { name: 'Beauty Services', code: 'BEAUTY' },
        { name: 'Gardening', code: 'GARDENING' },
        { name: 'AC Repair', code: 'AC_REPAIR' }
    ];

    let sql = `
        INSERT INTO services (name, code) VALUES 
    `;

    const values = services.map(s => `('${s.name}', '${s.code}')`).join(",\n");
    sql += values;
    sql += ` ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;`;

    await executeSql(sql, 'Insert Core Services');
};

main();
