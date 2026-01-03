#!/bin/bash
# Cloudflare Pages build script using official adapter
cd frontend/apps/web-client

echo "Building Next.js for Cloudflare Pages (next-on-pages)..."
export NPM_CONFIG_LEGACY_PEER_DEPS=true
npx @cloudflare/next-on-pages

echo "Build complete! Output in .vercel/output/static"
