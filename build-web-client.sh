#!/bin/bash
# Cloudflare Pages build script for web-client
cd apps/web-client
npm run build
cd ../..
npx @cloudflare/next-on-pages --experimental-minify
