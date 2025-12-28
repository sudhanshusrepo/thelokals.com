const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const INPUT_FILE = path.join(__dirname, '../public/logo.svg');
const OUTPUT_DIR = path.join(__dirname, '../public/icons');

// specific icons named in prompt
const SPECIAL_ICONS = [
    { name: 'search-96x96.png', size: 96 },
    { name: 'bookings-96x96.png', size: 96 }
];

async function generateIcons() {
    if (!fs.existsSync(INPUT_FILE)) {
        console.error('Error: public/logo.svg not found');
        process.exit(1);
    }

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    console.log('Generating icons from logo.svg...');

    try {
        // Generate standard sizes
        for (const size of SIZES) {
            const fileName = `icon-${size}x${size}.png`;
            await sharp(INPUT_FILE)
                .resize(size, size)
                .png()
                .toFile(path.join(OUTPUT_DIR, fileName));
            console.log(`Generated ${fileName}`);
        }

        // Generate special icons (using logo as placeholder)
        for (const icon of SPECIAL_ICONS) {
            await sharp(INPUT_FILE)
                .resize(icon.size, icon.size)
                .png()
                .toFile(path.join(OUTPUT_DIR, icon.name));
            console.log(`Generated ${icon.name}`);
        }

        console.log('Icon generation complete!');

    } catch (error) {
        console.error('Error generating icons:', error);
        process.exit(1);
    }
}

generateIcons();
