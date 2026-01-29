#!/usr/bin/env node

/**
 * Build script for standalone Next.js apps for Cloudflare Workers
 * This builds the app with all dependencies bundled and uses OpenNext adapter
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const appName = process.argv[2];

if (!appName) {
    console.error('Error: App name is required');
    console.error('Usage: node scripts/build-standalone.js <app-name>');
    console.error('Example: node scripts/build-standalone.js web-client');
    process.exit(1);
}

const appPath = path.join(__dirname, '..', 'apps', appName);
const rootPath = path.join(__dirname, '..');

if (!fs.existsSync(appPath)) {
    console.error(`Error: App "${appName}" not found at ${appPath}`);
    process.exit(1);
}

console.log(`Building ${appName} for Cloudflare Pages (OpenNext)...`);
console.log(`App path: ${appPath}`);

try {
    // Step 1: Build workspace dependencies first (from root)
    console.log('\n📦 Building workspace dependencies...');
    process.chdir(rootPath);
    execSync('npm run build --workspace=@thelocals/platform-core --if-present', {
        stdio: 'inherit',
        env: { ...process.env }
    });

    // Step 2: Change to app directory and run OpenNext build
    console.log(`\n🏗️  Running OpenNext build for: ${appName}...`);
    process.chdir(appPath);

    console.log('Running Next.js build first...');
    execSync('npm run build', {
        stdio: 'inherit',
        env: { ...process.env }
    });

    console.log('Running OpenNext adapter...');
    execSync('npx opennextjs-cloudflare build', {
        stdio: 'inherit',
        env: { ...process.env }
    });

    console.log(`\n✅ Successfully built ${appName} with OpenNext`);

    // Check for .open-next output
    const openNextPath = path.join(appPath, '.open-next');
    if (!fs.existsSync(openNextPath)) {
        throw new Error(`.open-next folder not found at ${openNextPath}. OpenNext build may have failed.`);
    }

    // Step 3: Organize artifacts in 'dist' for Cloudflare Pages
    // STRATEGY: Copy EVERYTHING from .open-next to dist, then restructure.
    // This ensures all satellite folders (cloudflare, middleware, .build, server-functions) are present for the worker.

    console.log('\n📦 Organizing artifacts in root dist directory...');
    const rootDistPath = path.join(rootPath, 'dist');

    // Clean existing root dist
    if (fs.existsSync(rootDistPath)) {
        fs.rmSync(rootDistPath, { recursive: true, force: true });
    }

    // Copy the entire .open-next directory to dist
    console.log(`Copying .open-next to ${rootDistPath}...`);
    fs.cpSync(openNextPath, rootDistPath, { recursive: true });

    // RESTRUCTURE:
    // 1. Flatten content of 'assets' to root of 'dist'.
    const distAssetsPath = path.join(rootDistPath, 'assets');
    if (fs.existsSync(distAssetsPath)) {
        console.log('Flattening assets to root...');
        const assets = fs.readdirSync(distAssetsPath);
        for (const asset of assets) {
            const src = path.join(distAssetsPath, asset);
            const dest = path.join(rootDistPath, asset);
            console.log(`  Moving ${asset} to root`);
            fs.renameSync(src, dest);
        }
        // Remove empty assets folder
        fs.rmdirSync(distAssetsPath);
    }

    // 2. Rename 'worker.js' to '_worker.js'
    const distWorkerPath = path.join(rootDistPath, 'worker.js');
    const finalWorkerPath = path.join(rootDistPath, '_worker.js');

    if (fs.existsSync(distWorkerPath)) {
        console.log('Renaming worker.js to _worker.js...');
        fs.renameSync(distWorkerPath, finalWorkerPath);
    } else {
        throw new Error(`worker.js not found in ${rootDistPath}`);
    }

    console.log(`\n✅ Artifacts prepared in ${rootDistPath}`);
    console.log(`- All dependencies (cloudflare/, middleware/, etc.) preserved`);
    console.log(`- Static assets flattened to root`);
    console.log(`- _worker.js at root`);
    console.log(`Cloudflare Pages should now have a complete environment.`);

} catch (error) {
    console.error(`\n❌ Build failed for ${appName}`);
    console.error(error.message);
    process.exit(1);
}
