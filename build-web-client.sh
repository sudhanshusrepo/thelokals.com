#!/bin/bash
# Cloudflare Pages build script for web-client
cd apps/web-client
npm run build
npx @cloudflare/next-on-pages
