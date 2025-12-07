# Development Guide

## Prerequisites

- **Node.js**: v18 or later
- **pnpm**: Package manager (`npm install -g pnpm`)
- **Supabase Account**: For backend services
- **Git**: Version control

## Quick Start

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd thelokals.com
    ```

2.  **Install Dependencies**
    ```bash
    pnpm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory:
    ```bash
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    # VITE_GEMINI_API_KEY is managed via Supabase Edge Functions for production
    ```

4.  **Database Setup**
    - Go to your Supabase SQL Editor.
    - Copy the content of `supabase/complete-database-setup.sql`.
    - Run the script to set up the entire schema, functions, and policies.
    - (Optional) Run `scripts/seed-workers.sql` to populate test data.

5.  **Start Development Server**
    ```bash
    pnpm dev
    ```
    - **Client App**: http://localhost:5173
    - **Provider App**: http://localhost:5174

## Project Structure

```
.
├── packages/
│   ├── client/     # Customer web application
│   ├── provider/   # Provider web application
│   ├── core/       # Shared logic and types
│   └── db/         # Database migrations
├── supabase/       # Supabase configuration and SQL
└── scripts/        # Utility scripts
```

## Development Workflow

### Working with Database
- The database schema is defined in `supabase/complete-database-setup.sql`.
- To make changes, update this file and re-run it (for development) or create a new migration if preserving data is required.
- **Always** update the consolidated SQL file when making schema changes to keep it as the source of truth.

### Working with Core Package
- The `core` package is shared. Changes here affect both Client and Provider apps.
- It exports types, constants, and service functions.

### Testing
- Run E2E tests: `npm run test:e2e`
- See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for details.

## Troubleshooting

- **"Supabase environment variables are missing"**: Check your `.env` file.
- **"Relation does not exist"**: Your database schema might be out of sync. Run the setup script.
- **Build errors**: Try deleting `node_modules` and running `pnpm install` again.
