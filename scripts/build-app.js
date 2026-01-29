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

if (!fs.existsSync(appPath)) {
    console.error(`Error: App "${appName}" not found at ${appPath}`);
    process.exit(1);
}

console.log(`Building ${appName}...`);
console.log(`App path: ${appPath}`);

try {
    // Change to app directory and run build
    process.chdir(appPath);

    console.log('Running: npm run build');
    execSync('npm run build', {
        stdio: 'inherit',
        env: { ...process.env }
    });

    // Run @cloudflare/next-on-pages to convert Next.js build for Cloudflare
    console.log('Running: npx @cloudflare/next-on-pages');
    execSync('npx @cloudflare/next-on-pages', {
        stdio: 'inherit',
        env: { ...process.env }
    });

    console.log(`✅ Successfully built ${appName} for Cloudflare Pages`);
} catch (error) {
    console.error(`❌ Build failed for ${appName}`);
    console.error(error.message);
    process.exit(1);
}
