#!/bin/bash
# Cloudflare deployment script using OpenNext adapter
cd frontend/apps/web-client

echo "Building Next.js application with OpenNext adapter..."

# The OpenNext adapter will build and output to .open-next/
npx wrangler pages deploy .open-next/assets --project-name=web-client

echo "Deployment complete!"
