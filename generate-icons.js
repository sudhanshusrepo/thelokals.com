const Jimp = require('jimp');
const path = require('path');
const fs = require('fs');

const SOURCE_IMAGE = 'C:/Users/sudhanshu/.gemini/antigravity/brain/fb38729f-5219-467c-9912-2a01aff324e5/app_icon_optimized_1769329260894.png';

const TARGETS = [
    // Mobile Provider
    { path: 'apps/mobile-provider/assets/icon.png', size: 1024 },
    { path: 'apps/mobile-provider/assets/adaptive-icon.png', size: 1024 }, // Simple resize for now
    { path: 'apps/mobile-provider/assets/splash-icon.png', size: 1024 },  // Splash usually wants a smaller icon on large canvas, but standard resize works for Expo default
    { path: 'apps/mobile-provider/assets/favicon.png', size: 196 },

    // Web Provider
    { path: 'apps/web-provider/public/icon.png', size: 512 },
    { path: 'apps/web-provider/public/favicon.png', size: 196 },
    { path: 'apps/web-provider/public/apple-icon.png', size: 180 },
];

async function generate() {
    try {
        console.log('Reading source image...');
        const image = await Jimp.read(SOURCE_IMAGE);

        for (const target of TARGETS) {
            const absPath = path.resolve(__dirname, target.path);
            const dir = path.dirname(absPath);

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            console.log(`Generating ${target.path} (${target.size}x${target.size})...`);

            // Clone to avoid modifying the original reference for next iteration (though resize modifies in place)
            const resized = image.clone().resize(target.size, target.size);

            await resized.writeAsync(absPath);
        }
        console.log('All icons generated successfully!');
    } catch (error) {
        console.error('Error generating icons:', error);
    }
}

generate();
