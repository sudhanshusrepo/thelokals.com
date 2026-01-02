#!/bin/bash
# Cloudflare Pages build script using OpenNext adapter
cd frontend/apps/web-client

echo "Building Next.js with OpenNext Cloudflare adapter..."
npx @opennextjs/cloudflare build --openNextConfigPath ./open-next.config.ts

echo "Build complete! Output in .open-next/"
