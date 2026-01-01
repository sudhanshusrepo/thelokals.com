#!/bin/bash
# Cloudflare Pages build script for web-client with OpenNext adapter
cd apps/web-client

# Build Next.js with OpenNext adapter
npm run build

# OpenNext creates the output in .open-next directory
# Copy it to the expected Cloudflare Pages location
if [ -d ".open-next" ]; then
  mkdir -p .vercel/output
  cp -r .open-next/* .vercel/output/
  echo "OpenNext build complete - output ready for Cloudflare Pages"
else
  echo "Error: .open-next directory not found"
  exit 1
fi
