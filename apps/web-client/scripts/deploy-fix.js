const fs = require('fs');
const path = require('path');

const srcDir = path.join(process.cwd(), '.open-next');
const destDir = path.join(srcDir, 'assets');

// Directories to copy to assets
const dirsToCopy = [
    '.build',
    'cloudflare',
    'cloudflare-templates',
    'dynamodb-provider',
    'middleware',
    'server-functions'
];

// Helper to copy directory recursively
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

try {
    console.log('Starting deploy fix...');

    // 1. Rename/Move worker.js to _worker.js in assets
    const workerSrc = path.join(srcDir, 'worker.js');
    const workerDest = path.join(destDir, '_worker.js');

    if (fs.existsSync(workerSrc)) {
        console.log(`Moving ${workerSrc} to ${workerDest}`);
        fs.renameSync(workerSrc, workerDest);
    } else {
        console.warn(`Warning: ${workerSrc} not found. It might have already been moved.`);
    }

    // 2. Copy dependencies
    for (const dir of dirsToCopy) {
        const sourcePath = path.join(srcDir, dir);
        const targetPath = path.join(destDir, dir);

        if (fs.existsSync(sourcePath)) {
            console.log(`Copying ${sourcePath} to ${targetPath}`);
            copyDir(sourcePath, targetPath);
        } else {
            console.warn(`Warning: Directory ${sourcePath} does not exist.`);
        }
    }

    console.log('Deploy fix completed successfully.');

} catch (error) {
    console.error('Error during deploy fix:', error);
    process.exit(1);
}
