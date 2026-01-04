---
description: How to deploy the Next.js applications to Cloudflare Pages
---

# Deploying web-client, web-admin, and web-provider

There are two main ways to deploy these applications to Cloudflare Pages: via Git Integration (Recommended) or Manual CLI Deployment.

## Option 1: Git Integration (Recommended)

1.  **Push your changes** to the repository.
2.  **Log in to Cloudflare Dashboard** -> Workers & Pages -> Create Application -> Pages -> Connect to Git.
3.  **Select this repository**.
4.  **Configure the build settings** for each app (you will need to create 3 separate Pages projects):

    **Project Names:** `web-client`, `web-admin`, `web-provider`

    **Build Settings:**
    *   **Framework Preset:** `Next.js`
    *   **Build Command:** `npm run pages:build:client` (or admin/provider appropriately)
    *   **Build Output Directory:** `frontend/new_apps/web-client/.open-next` (Must be the full path from root)
    *   **Root Directory:** `/` (Leave empty - we build from the repo root)

5.  **Environment Variables:**
    Ensure you add any necessary environment variables in the Cloudflare Dashboard (Settings -> Environment Variables).
    *   `NEXT_PUBLIC_SUPABASE_URL`
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    *   `NODE_VERSION`: `20` (or compatible)

## Option 2: Manual CLI Deployment

You can deploy directly from your local machine using the scripts added to `package.json`.

**Prerequisites:**
*   You must be logged in to Wrangler (`npx wrangler login`).

**Steps:**

1.  **Build and Deploy Web Client:**
    ```bash
    npm run pages:build:client
    npm run pages:deploy:client
    ```

2.  **Build and Deploy Web Admin:**
    ```bash
    npm run pages:build:admin
    npm run pages:deploy:admin
    ```

3.  **Build and Deploy Web Provider:**
    ```bash
    npm run pages:build:provider
    npm run pages:deploy:provider
    ```

## troubleshooting

*   **Build Fails on Windows:** The build adapter (`@cloudflare/next-on-pages`) has known issues on Windows. The recommended deployment method is Option 1 (Git Integration), where Cloudflare's Linux build environment handles the build.
*   **Version Mismatch:** Ensure your `wrangler.toml` compatibility date matches your current Wrangler version if you encounter unexpected errors.
