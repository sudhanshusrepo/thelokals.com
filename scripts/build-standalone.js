#!/usr/bin/env node

/**
 * Build script for standalone Next.js apps for Cloudflare Workers
 * This builds the app with all dependencies bundled and uses OpenNext adapter
 * AND bundles the final worker into a single file to prevent runtime import errors.
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

    // Step 2.5: Patch node-environment.js to remove file-system dependent console patching
    // This fixes the "Error 1101" / "Writer" error on Cloudflare Pages
    console.log('Patching Next.js node-environment.js...');
    const nodeEnvPath = path.join(openNextPath, 'server-functions', 'default', 'node_modules', 'next', 'dist', 'server', 'node-environment.js');
    if (fs.existsSync(nodeEnvPath)) {
        let content = fs.readFileSync(nodeEnvPath, 'utf8');
        // Comment out require("./node-environment-extensions/console-file");
        content = content.replace('require("./node-environment-extensions/console-file");', '// require("./node-environment-extensions/console-file");');
        fs.writeFileSync(nodeEnvPath, content);
        console.log('✅ Patched node-environment.js');
    } else {
        console.warn('⚠️ Could not find node-environment.js to patch. This might cause runtime errors.');
    }

    // Step 3: Organize artifacts in 'dist' for Cloudflare Pages
    console.log('\n📦 Organizing artifacts in root dist directory...');
    const rootDistPath = path.join(rootPath, 'dist');

    // Clean existing root dist
    if (fs.existsSync(rootDistPath)) {
        fs.rmSync(rootDistPath, { recursive: true, force: true });
    }
    // Create dist folder
    fs.mkdirSync(rootDistPath, { recursive: true });

    // Check for required environment variables causing runtime crashes
    const requiredEnvVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
    const missingEnvVars = requiredEnvVars.filter(key => !process.env[key]);
    if (missingEnvVars.length > 0) {
        console.warn('⚠️  WARNING: Missing environment variables preventing proper build:');
        console.warn(missingEnvVars.join(', '));
        console.warn('The application may crash at runtime (Error 1101) if these are not available.');
    }

    // A. Bundling Worker
    // We use esbuild to bundle the split worker into a single _worker.js
    console.log('Bundling worker using esbuild...');
    const workerEntryPath = path.join(openNextPath, 'worker.js');
    const workerOutputPath = path.join(rootDistPath, '_worker.js');

    // Construct esbuild command
    // Use 'neutral' platform for Cloudflare Workers to avoid Node.js built-ins being assumed available without polyfills
    // Add 'worker', 'workerd', 'browser' conditions to pick up the correct exports
    // Externalize all Node.js built-ins because we are using nodejs_compat which provides these at runtime
    const esbuildCommand = `npx esbuild "${workerEntryPath}" --bundle --outfile="${workerOutputPath}" --format=esm --platform=neutral --main-fields=module,main --conditions=workerd,worker,browser --target=esnext --external:cloudflare:* --external:workerd:* --external:node:* --external:assert --external:async_hooks --external:buffer --external:child_process --external:cluster --external:console --external:constants --external:crypto --external:dgram --external:diagnostics_channel --external:dns --external:domain --external:events --external:fs --external:http --external:http2 --external:https --external:inspector --external:module --external:net --external:os --external:path --external:perf_hooks --external:process --external:punycode --external:querystring --external:readline --external:repl --external:stream --external:string_decoder --external:sys --external:timers --external:tls --external:trace_events --external:tty --external:url --external:util --external:v8 --external:vm --external:wasi --external:worker_threads --external:zlib --loader:.wasm=file --loader:.bin=file`;

    console.log(`Running: ${esbuildCommand}`);
    try {
        execSync(esbuildCommand, { stdio: 'inherit', env: { ...process.env } });
    } catch (e) {
        console.error("Failed to bundle worker with esbuild.");
        throw e;
    }

    // B. Copy Assets
    // We copy assets directly to root of dist (flattening)
    const assetsPath = path.join(openNextPath, 'assets');
    if (fs.existsSync(assetsPath)) {
        console.log(`Copying and flattening assets from ${assetsPath} to ${rootDistPath}...`);
        fs.cpSync(assetsPath, rootDistPath, { recursive: true });
    } else {
        console.warn(`Warning: No assets folder found at ${assetsPath}`);
    }

    console.log(`\n✅ Artifacts prepared in ${rootDistPath}`);
    console.log(`- _worker.js (bundled, single file)`);
    console.log(`- Static assets (flattened at root)`);
    console.log(`Cloudflare Pages should now have a robust, monolithic environment.`);

} catch (error) {
    console.error(`\n❌ Build failed for ${appName}`);
    console.error(error.message);
    process.exit(1);
}
