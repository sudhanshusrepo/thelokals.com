const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Default Local Supabase Credentials
const DB_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@127.0.0.1:6543/postgres';

async function deploy() {
    console.log(`🔌 Connecting to Database...`);

    // Note: We might need to install 'pg' if not present.
    // user workspace has 'backend' which likely has 'pg'.
    // Or we rely on it being in root node_modules.

    const client = new Client({
        connectionString: DB_URL,
    });

    try {
        await client.connect();
        console.log("✅ Connected.");

        const sqlPath = path.join(__dirname, '../supabase/migrations/20260115002000_atomic_booking.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log("📜 Executing SQL...");
        await client.query(sql);
        console.log("✅ Migration Applied Successfully!");

    } catch (err) {
        console.error("❌ Migration Failed:", err.message);
    } finally {
        await client.end();
    }
}

deploy();
