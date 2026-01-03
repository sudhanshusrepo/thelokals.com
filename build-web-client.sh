#!/bin/bash
# Cloudflare Pages build script using official adapter
# Vendor the shared/core package locally to bypass workspace resolution issues in isolated build
# Vendor the shared/core package locally to bypass workspace resolution issues in isolated build
# Vendor the shared/core package locally to bypass workspace resolution issues in isolated build
rm -rf frontend/apps/web-client/.local-core
cp -r shared/core frontend/apps/web-client/.local-core

cd frontend/apps/web-client

# Temporary workaround: Hide root wrangler.toml during build
# This prevents next-on-pages from reading the root config and duplicating paths (ENOENT .../apps/web-client/apps/web-client)
# We rely on the local wrangler.toml in the web-client directory
if [ -f ../../../wrangler.toml ]; then
  mv ../../../wrangler.toml ../../../wrangler.toml.bak
  trap "mv ../../../wrangler.toml.bak ../../../wrangler.toml" EXIT
fi

# Patch package.json to point to the local file path instead of workspace wildcard
# This ensures npm install finds the package without hitting the registry/workspace 404
sed -i 's|"\@thelocals/core": "\*"|"\@thelocals/core": "file:.local-core"|' package.json

echo "Building Next.js for Cloudflare Pages (next-on-pages)..."
export NPM_CONFIG_LEGACY_PEER_DEPS=true
npx @cloudflare/next-on-pages

echo "Build complete! Output in .vercel/output/static"
