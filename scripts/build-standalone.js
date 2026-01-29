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
    // Cloudflare Pages expects index.html at root of dist, and _worker.js at root of dist.
    // OpenNext produces .open-next/assets/* and .open-next/worker.js

    console.log('\n📦 Structuring artifacts in root dist directory...');
    const rootDistPath = path.join(rootPath, 'dist');

    // Clean existing root dist
    if (fs.existsSync(rootDistPath)) {
        fs.rmSync(rootDistPath, { recursive: true, force: true });
    }
    fs.mkdirSync(rootDistPath, { recursive: true });

    // 1. Copy assets to flat dist
    const assetsPath = path.join(openNextPath, 'assets');
    if (fs.existsSync(assetsPath)) {
        console.log(`Copying assets from ${assetsPath} to ${rootDistPath}...`);
        fs.cpSync(assetsPath, rootDistPath, { recursive: true });
    } else {
        console.warn(`Warning: No assets folder found at ${assetsPath}`);
    }

    // 2. Copy worker.js to _worker.js in dist
    const workerPath = path.join(openNextPath, 'worker.js');
    const destWorkerPath = path.join(rootDistPath, '_worker.js');

    if (fs.existsSync(workerPath)) {
        console.log(`Copying worker from ${workerPath} to ${destWorkerPath}...`);
        fs.copyFileSync(workerPath, destWorkerPath);
    } else {
        throw new Error(`worker.js not found at ${workerPath}`);
    }

    console.log(`\n✅ Artifacts prepared in ${rootDistPath}`);
    console.log(`- Static assets are at root`);
    console.log(`- _worker.js is at root`);
    console.log(`Cloudflare Pages should now detect and serve the site correctly.`);

} catch (error) {
    console.error(`\n❌ Build failed for ${appName}`);
    console.error(error.message);
    process.exit(1);
}
