#!/bin/bash
# Cloudflare Pages build script for web-client
# Build Next.js
cd apps/web-client
npm run build

# Create Cloudflare Pages compatible output structure
mkdir -p .vercel/output/static
cp -r .next/static .vercel/output/static/_next/static
cp -r public/* .vercel/output/static/ 2>/dev/null || true

# Create minimal config for Cloudflare
cat > .vercel/output/config.json << 'EOF'
{
  "version": 3,
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/"
    }
  ]
}
EOF

echo "Build complete - output in apps/web-client/.vercel/output/static"
