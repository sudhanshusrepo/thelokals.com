#!/bin/bash
# Cloudflare Pages build script for web-client
cd frontend/apps/web-client

# Build Next.js with static export
npm run build

# Next.js static export creates files in 'out' directory
# Copy to Cloudflare Pages expected location
mkdir -p .vercel/output/static
cp -r out/* .vercel/output/static/

echo "Static export complete - ready for Cloudflare Pages"
