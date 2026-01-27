
const https = require('https');
const fs = require('fs');
const path = require('path');

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

        console.log(`🚀 Executing: ${description}...`);

        const req = https.request(options, (res) => {
            let responseBody = '';

            res.on('data', (chunk) => {
                responseBody += chunk;
            });

            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log(`✅ Success: ${description}`);
                    resolve(responseBody);
                } else {
                    console.error(`❌ Error executing ${description}:`, responseBody);
                    reject(new Error(`API Error: ${res.statusCode} ${responseBody}`));
                }
            });
        });

        req.on('error', (error) => {
            console.error(`❌ Network Error executing ${description}:`, error);
            reject(error);
        });

        req.write(data);
        req.end();
    });
};

const main = async () => {
    try {
        const args = process.argv.slice(2);
        if (args.length !== 1) {
            console.error('Usage: node scripts/deploy_migration.js <path_to_sql_file>');
            process.exit(1);
        }

        const sqlFilePath = args[0];
        const fullPath = path.resolve(sqlFilePath);

        console.log(`📖 Reading SQL file: ${fullPath}`);

        if (!fs.existsSync(fullPath)) {
            throw new Error(`File not found: ${fullPath}`);
        }

        const seedSql = fs.readFileSync(fullPath, 'utf8');
        await executeSql(seedSql, `Deploying ${path.basename(fullPath)}`);

        console.log('🎉 Migration completed successfully!');

    } catch (error) {
        console.error('💥 Script failed:', error.message);
        process.exit(1);
    }
};

main();
