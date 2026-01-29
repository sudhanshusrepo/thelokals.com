#!/usr/bin/env node

/**
 * Build script for individual Next.js apps in the monorepo
 * Usage: node scripts/build-app.js <app-name>
 * Example: node scripts/build-app.js web-client
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const appName = process.argv[2];

if (!appName) {
    console.error('Error: App name is required');
    console.error('Usage: node scripts/build-app.js <app-name>');
    console.error('Example: node scripts/build-app.js web-client');
    process.exit(1);
}

const appPath = path.join(__dirname, '..', 'apps', appName);
const rootPath = path.join(__dirname, '..');

if (!fs.existsSync(appPath)) {
    console.error(`Error: App "${appName}" not found at ${appPath}`);
    process.exit(1);
}

console.log(`Building ${appName}...`);
console.log(`App path: ${appPath}`);

try {
    // Step 1: Build workspace dependencies first (from root)
    console.log('\n📦 Building workspace dependencies...');
    process.chdir(rootPath);
    execSync('npm run build --workspace=@thelocals/platform-core --if-present', {
        stdio: 'inherit',
        env: { ...process.env }
    });

    // Step 2: Change to app directory and run Next.js build
    console.log(`\n🏗️  Building Next.js app: ${appName}...`);
    process.chdir(appPath);
    execSync('npm run build', {
        stdio: 'inherit',
        env: { ...process.env }
    });

    // Step 3: Run @cloudflare/next-on-pages to convert for Cloudflare Workers
    console.log('\n⚡ Converting to Cloudflare Pages format...');
    execSync('npx --yes @cloudflare/next-on-pages@1', {
        stdio: 'inherit',
        env: { ...process.env }
    });

    console.log(`\n✅ Successfully built ${appName} for Cloudflare Pages`);
} catch (error) {
    console.error(`\n❌ Build failed for ${appName}`);
    console.error(error.message);
    process.exit(1);
}
