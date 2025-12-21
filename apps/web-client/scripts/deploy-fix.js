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

    // 3. GENERATE _routes.json
    // This is CRITICAL for Cloudflare Pages to know which requests to bypass the worker
    // and serve directly from static assets (reducing 404s and costs)
    const routesConfig = {
        version: 1,
        include: ["/*"],
        exclude: [
            "/_next/static/*",
            "/favicon.ico",
            "/manifest.json",
            "/logo.svg",
            "/globe.svg",
            "/file.svg",
            "/next.svg",
            "/vercel.svg",
            "/window.svg",
            "/offline.html",
            "/sw.js",
            "/images/*"
        ]
    };

    const routesPath = path.join(destDir, '_routes.json');
    console.log(`Generating ${routesPath}`);
    fs.writeFileSync(routesPath, JSON.stringify(routesConfig, null, 2));

    // 4. Ensure _next directory exists
    const nextDirSrc = path.join(process.cwd(), '.next');
    const nextDirDest = path.join(destDir, '_next');

    if (!fs.existsSync(nextDirDest) && fs.existsSync(nextDirSrc)) {
        console.log(`Copying .next to ${nextDirDest} as fallback`);
        const staticSrc = path.join(nextDirSrc, 'static');
        const staticDest = path.join(nextDirDest, 'static');
        if (fs.existsSync(staticSrc)) {
            copyDir(staticSrc, staticDest);
        }
    }

    // 5. Copy PUBLIC folder contents to assets root
    // This ensures logos, manifests, and ignored static files are served correctly by Cloudflare
    const publicDir = path.join(process.cwd(), 'public');
    if (fs.existsSync(publicDir)) {
        console.log(`Copying public directory from ${publicDir} to ${destDir}`);
        const publicFiles = fs.readdirSync(publicDir);
        for (const file of publicFiles) {
            const srcPath = path.join(publicDir, file);
            const destPath = path.join(destDir, file);
            // Copy if it's a file or directory
            if (fs.statSync(srcPath).isDirectory()) {
                copyDir(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }

    console.log('Deploy fix completed successfully.');

} catch (error) {
    console.error('Error during deploy fix:', error);
    process.exit(1);
}
