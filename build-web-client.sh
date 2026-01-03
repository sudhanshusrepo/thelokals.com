#!/bin/bash
# Legacy shim for Cloudflare Pages build configuration
# This ensures that if the CP build command is set to "bash build-web-client.sh",
# it redirects to the new standardized node build script.

echo "⚠️  Using legacy shell script entry point. Please update Cloudflare Pages build command to: 'npm run pages:build'"
node scripts/build-app.js web-client
