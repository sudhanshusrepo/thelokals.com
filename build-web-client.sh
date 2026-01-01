#!/bin/bash
# Cloudflare Pages build script for web-client
cd frontend/apps/web-client

# Build Next.js with static export
# Output goes directly to 'out/' directory
npm run build

echo "Static export complete - files in out/ directory"
