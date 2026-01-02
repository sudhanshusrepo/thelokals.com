const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure we are in the correct directory
const cwd = process.cwd();
console.log('Current working directory:', cwd);

// Define paths
const targetDir = path.join(cwd, 'apps', 'web-admin');
const nextSource = path.join(cwd, '.next');
const nextDest = path.join(targetDir, '.next');

// 1. mkdir -p apps/web-admin
if (!fs.existsSync(targetDir)) {
    console.log(`Creating directory: ${targetDir}`);
    fs.mkdirSync(targetDir, { recursive: true });
}

// 2. cp -r .next apps/web-admin/
if (fs.existsSync(nextSource)) {
    console.log(`Copying .next from ${nextSource} to ${nextDest}`);
    // recursive copy
    fs.cpSync(nextSource, nextDest, { recursive: true, force: true });
} else {
    console.error('Error: .next directory not found!');
    process.exit(1);
}

// 3. npx @cloudflare/next-on-pages
console.log('Running @cloudflare/next-on-pages...');
try {
    execSync('npx @cloudflare/next-on-pages', { stdio: 'inherit' });
} catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
}
