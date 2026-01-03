#!/bin/bash
# Cloudflare Pages build script using official adapter
# Vendor the shared/core package locally to bypass workspace resolution issues in isolated build
# Vendor the shared/core package locally to bypass workspace resolution issues in isolated build
rm -rf frontend/apps/web-client/.local-core
cp -r shared/core frontend/apps/web-client/.local-core

# Patch package.json to point to the local file path instead of workspace wildcard
# This ensures npm install finds the package without hitting the registry/workspace 404
sed -i 's|"\@thelocals/core": "\*"|"\@thelocals/core": "file:.local-core"|' frontend/apps/web-client/package.json

echo "Building Next.js for Cloudflare Pages (next-on-pages)..."
export NPM_CONFIG_LEGACY_PEER_DEPS=true
# Run next-on-pages from the root, targeting the web-client directory
# This prevents path duplication errors (ENOENT .../apps/web-client/apps/web-client/.next)
npx @cloudflare/next-on-pages frontend/apps/web-client

echo "Build complete! Output in .vercel/output/static"
