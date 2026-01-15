
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gdnltvvxiychrsdzenia.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const BUCKET_NAME = 'service-assets';

if (!SUPABASE_KEY) {
    console.error("Error: NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function uploadDirectory(dirPath, targetPrefix) {
    if (!fs.existsSync(dirPath)) {
        console.log(`Directory not found: ${dirPath}`);
        return;
    }

    const files = fs.readdirSync(dirPath);
    console.log(`Found ${files.length} files in ${dirPath}`);

    for (const file of files) {
        if (!file.match(/\.(png|jpg|jpeg|webp|svg)$/)) continue;

        const filePath = path.join(dirPath, file);
        const fileBuffer = fs.readFileSync(filePath);
        const targetPath = `${targetPrefix}/${file}`;

        console.log(`Uploading ${file} to ${targetPath}...`);

        const { data, error } = await supabase
            .storage
            .from(BUCKET_NAME)
            .upload(targetPath, fileBuffer, {
                contentType: 'image/png', // Assuming png from search results
                upsert: true
            });

        if (error) {
            console.error(`Failed to upload ${file}:`, error.message);
        } else {
            console.log(`Success: ${targetPath}`);
        }
    }
}

async function main() {
    console.log("Starting upload to bucket:", BUCKET_NAME);

    // Upload Services (Thumbnails)
    await uploadDirectory('apps/web-client/public/images/services', 'thumbnails');

    // Upload Headers
    await uploadDirectory('apps/web-client/public/images/service-headers', 'headers');

    console.log("Upload complete.");
}

main();
