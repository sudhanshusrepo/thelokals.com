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

    // Install or ensure opennextjs-cloudflare is available (it's in root devDependencies, so npx should find it if we are in monorepo context)
    // We strictly use npx opennextjs-cloudflare to build
    // Note: OpenNext usually runs 'next build' internally or requires it pre-run. 
    // To be safe and ensure type checking, we run standard build first, creating .next, then OpenNext adapts it.

    console.log('Running Next.js build first...');
    execSync('npm run build', {
        stdio: 'inherit',
        env: { ...process.env }
    });

    console.log('Running OpenNext adapter...');
    // We assume opennextjs-cloudflare is available in the path via npx from root
    // Since we are in appPath, we might need to reference the binary from root node_modules if npx resolution fails, 
    // but standard npx should work if hoisted or looked up.
    // However, safest is to use the direct path or simply npx.
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

    // Step 3: Move .open-next to root 'dist' for Cloudflare Pages (matching hardcoded default)
    console.log('\n📦 Moving OpenNext artifacts to root dist directory...');
    const rootDistPath = path.join(rootPath, 'dist');

    // Clean existing root dist
    if (fs.existsSync(rootDistPath)) {
        fs.rmSync(rootDistPath, { recursive: true, force: true });
    }

    // Move app .open-next to root dist
    // fs.cpSync requires Node 16.7+. We usually have 18+.
    fs.cpSync(openNextPath, rootDistPath, { recursive: true });

    console.log(`\n✅ Artifacts moved to ${rootDistPath}`);
    console.log(`Cloudflare Pages should now detect 'dist' containing the Worker and Assets.`);

} catch (error) {
    console.error(`\n❌ Build failed for ${appName}`);
    console.error(error.message);
    process.exit(1);
}
