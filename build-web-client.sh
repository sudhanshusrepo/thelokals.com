#!/bin/bash
# Cloudflare Pages build script for web-client with Workers support
cd frontend/apps/web-client

# Build Next.js application
echo "Building Next.js application..."
npm run build

# Convert Next.js build for Cloudflare Workers using next-on-pages
echo "Converting for Cloudflare Workers..."
npx @cloudflare/next-on-pages

echo "Cloudflare Workers build complete!"
echo "Output: .vercel/output/static"
