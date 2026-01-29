#!/usr/bin/env node

/**
 * Build script for standalone Next.js apps for Cloudflare Workers
 * This builds the app with all dependencies bundled
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

console.log(`Building ${appName} in standalone mode...`);
console.log(`App path: ${appPath}`);

try {
    // Step 1: Build workspace dependencies first (from root)
    console.log('\n📦 Building workspace dependencies...');
    process.chdir(rootPath);
    execSync('npm run build --workspace=@thelocals/platform-core --if-present', {
        stdio: 'inherit',
        env: { ...process.env }
    });

    // Step 2: Change to app directory and run Next.js build in standalone mode
    console.log(`\n🏗️  Building Next.js app in standalone mode: ${appName}...`);
    process.chdir(appPath);
    execSync('npm run build', {
        stdio: 'inherit',
        env: { ...process.env }
    });

    console.log(`\n✅ Successfully built ${appName} in standalone mode`);
    console.log(`\n📁 Standalone output: ${appPath}/.next/standalone`);
    console.log(`📁 Static files: ${appPath}/.next/static`);
    console.log(`📁 Public files: ${appPath}/public`);

    // Step 3: Move .next to root 'dist' for Cloudflare Pages (matching hardcoded default)
    console.log('\n📦 Moving build artifacts to root dist directory...');
    const rootDistPath = path.join(rootPath, 'dist');
    const appNextPath = path.join(appPath, '.next');

    // Clean existing root dist
    if (fs.existsSync(rootDistPath)) {
        fs.rmSync(rootDistPath, { recursive: true, force: true });
    }

    // Move app .next to root dist
    // Using cpSync and rmSync for cross-platform compatibility (renameSync can fail across devices/partitions)
    fs.cpSync(appNextPath, rootDistPath, { recursive: true });

    console.log(`\n✅ Artifacts moved to ${rootDistPath}`);
    console.log(`Cloudflare Pages should now detect the build output at the root 'dist' folder.`);
} catch (error) {
    console.error(`\n❌ Build failed for ${appName}`);
    console.error(error.message);
    process.exit(1);
}
