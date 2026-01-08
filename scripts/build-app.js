const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const appName = process.argv[2];
if (!appName) {
    console.error('Usage: node build-app.js <app-name>');
    process.exit(1);
}

const rootDir = path.resolve(__dirname, '..');
const appDir = path.join(rootDir, 'apps', appName);

if (!fs.existsSync(appDir)) {
    console.error(`App directory not found: ${appDir}`);
    process.exit(1);
}

console.log(`🚀 Building ${appName} from ${appDir}...`);

// Paths

const packageJsonPath = path.join(appDir, 'package.json');
const packageJsonBackupPath = path.join(appDir, 'package.json.bak');
const rootWranglerPath = path.join(rootDir, 'wrangler.toml');
const rootWranglerBackupPath = path.join(rootDir, 'wrangler.toml.bak');

function runCommand(command, cwd) {
    console.log(`> ${command}`);
    try {
        execSync(command, { cwd, stdio: 'inherit', env: { ...process.env, FORCE_COLOR: '1' } });
    } catch (error) {
        console.error(`Command failed: ${command}`);
        throw error;
    }
}

function cleanup() {
    console.log('🧹 Cleaning up...');
    // Restore package.json if backup exists
    if (fs.existsSync(packageJsonBackupPath)) {
        fs.copyFileSync(packageJsonBackupPath, packageJsonPath);
        fs.unlinkSync(packageJsonBackupPath);
    }

}

// Trap signals for cleanup
process.on('SIGINT', () => { cleanup(); process.exit(); });
process.on('SIGTERM', () => { cleanup(); process.exit(); });
process.on('uncaughtException', (err) => { console.error(err); cleanup(); process.exit(1); });

try {
    // 1. Vendor shared/core to bypass workspace issues in isolated builds (Cloudflare Pages)


    // 2. Patch package.json to use file dependency
    if (fs.existsSync(packageJsonPath)) {
        console.log('📝 Patching package.json for local core resolution...');
        fs.copyFileSync(packageJsonPath, packageJsonBackupPath);

        let packageJson = fs.readFileSync(packageJsonPath, 'utf8');

        fs.writeFileSync(packageJsonPath, packageJson);
    }

    // 3. Run Build
    console.log('🏗️  Running Next.js build...');
    // Set legacy peer deps to true for npm/npx
    process.env.NPM_CONFIG_LEGACY_PEER_DEPS = 'true';

    // Using npx next build --webpack
    runCommand('npx next build', appDir);

    // 4. Run Cloudflare Adapter
    // 4. Run Cloudflare Adapter (OpenNext)
    console.log('🌩️  Running OpenNext Cloudflare adapter...');

    // GENERATE PRE-BUILD wrangler.toml in appDir so OpenNext detects nodejs_compat
    const preBuildWranglerContent = `
name = "${appName}"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]
`;
    fs.writeFileSync(path.join(appDir, 'wrangler.toml'), preBuildWranglerContent.trim());

    try {
        runCommand('npx opennextjs-cloudflare build', appDir);

        // Post-processing for Cloudflare Pages
        console.log('✨ Structuring output for Cloudflare Pages...');
        const openNextDir = path.join(appDir, '.open-next');
        const assetsDir = path.join(openNextDir, 'assets');
        const workerSrc = path.join(openNextDir, 'worker.js');
        const workerDest = path.join(openNextDir, '_worker.js');

        // 1. Move assets to root of .open-next, specifically handling _next
        if (fs.existsSync(assetsDir)) {
            const items = fs.readdirSync(assetsDir);
            items.forEach(item => {
                const src = path.join(assetsDir, item);
                // Rename _next to next_assets to avoid Cloudflare ignoring it
                const destName = item === '_next' ? 'next_assets' : item;
                const dest = path.join(openNextDir, destName);
                fs.renameSync(src, dest);
            });
            fs.rmdirSync(assetsDir);
        }

        // 2. Generate _redirects to map /_next/* to /next_assets/*
        // Cloudflare Pages ignores folders starting with underscore.
        // We use a 200 rewrite to serve the renamed assets when the browser requests /_next/...
        const redirectsContent = `/_next/*  /next_assets/:splat  200\n`;
        fs.writeFileSync(path.join(openNextDir, '_redirects'), redirectsContent);

        // Generate _routes.json to explicitly route requests to the worker
        // This fixes the 404 on root path if Cloudflare doesn't auto-detect the worker routing
        const routesContent = JSON.stringify({
            version: 1,
            include: ["/*"],
            exclude: ["/_next/*", "/next_assets/*", "/favicon.ico", "/robots.txt"]
        }, null, 2);
        fs.writeFileSync(path.join(openNextDir, '_routes.json'), routesContent);

        // 3. Generate wrangler.toml for compatibility flags (App specific only)
        const relativeOutputDir = `apps/${appName}/.open-next`;
        const wranglerContent = `
name = "${appName}"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]
`;
        fs.writeFileSync(path.join(openNextDir, 'wrangler.toml'), wranglerContent.trim());

        // 4. Rename worker.js to _worker.js for Pages Advanced Mode
        if (fs.existsSync(workerSrc)) {
            fs.renameSync(workerSrc, workerDest);
        }

        // COPY TO ROOT DIST
        // This ensures the root wrangler.toml (committed in repo) works for ALL apps
        // by pointing to a consistent 'dist' location.
        console.log('📦 Copying artifacts to root dist folder...');
        const rootDistDir = path.join(rootDir, 'dist');
        if (fs.existsSync(rootDistDir)) {
            fs.rmSync(rootDistDir, { recursive: true, force: true });
        }
        fs.cpSync(openNextDir, rootDistDir, { recursive: true });

        // DEBUG: Write a test file to verify deployment root
        fs.writeFileSync(path.join(rootDistDir, 'test-deploy.txt'), `Deployment verified at ${new Date().toISOString()} for ${appName}`);

    } catch (error) {
        if (process.platform === 'win32') {
            console.warn('\n⚠️  Cloudflare Pages adapter failed. This is expected on Windows due to Vercel CLI compatibility issues.');
            console.warn('✅ Next.js build was successful. The app is ready for deployment via CI (Linux).\n');
        } else {
            throw error;
        }
    }

    console.log('✅ Build complete!');
} catch (error) {
    if (process.platform === 'win32' && error.message && error.message.includes('cloudflare')) {
        // Already handled above, ensuring we don't double log or fail
    } else {
        console.error('❌ Build failed!');
        process.exitCode = 1;
    }
} finally {
    cleanup();
}
