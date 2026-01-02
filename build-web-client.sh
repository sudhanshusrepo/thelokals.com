#!/bin/bash
# Cloudflare deployment script using OpenNext adapter
cd frontend/apps/web-client

echo "Building Next.js application with OpenNext adapter..."
npx wrangler pages deploy

echo "Deployment complete!"
