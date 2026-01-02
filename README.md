# The Lokals Platform

## 📋 Executive Summary
The Lokals Platform is a **monorepo-based local services marketplace** connecting customers with service providers.

- **3 Web Applications**: Client, Provider, and Admin portals
- **2 Mobile Applications**: Client and Provider mobile apps
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **AI Integration**: Google Gemini for natural language booking

## 🏗️ Repository Structure

This project uses **Turborepo** and **npm workspaces**.

```
thelokals.com-main/
├── frontend/apps/          # Next.js & Expo applications
│   ├── web-client/         # Customer web app (Port: 3000)
│   ├── web-provider/       # Provider web app (Port: 3001)
│   ├── web-admin/          # Admin portal (Port: 3002)
│   ├── mobile-client/      # React Native client app
│   └── mobile-provider/    # React Native provider app
│
├── shared/                 # Shared libraries
│   ├── core/               # Business logic, types, and constants
│   └── ui/                 # Shared UI components (planned)
│
├── backend/                # Supabase backend
│   ├── functions/          # Edge Functions
│   └── migrations/         # Database migrations
│
└── .github/workflows/      # CI/CD Pipelines
```

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v20+ (Required)
- **npm**: v10+

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/the-lokals/platform.git
    cd thelokals.com
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # Note: This executes at the root, linking all workspaces.
    ```

### Running Applications

Use **Turbo** to run apps in parallel or individually:

```bash
# Run all web apps (Client, Provider, Admin)
npm run dev

# Run a specific app
npm run dev --workspace=web-client
npm run dev --workspace=web-provider
npm run dev --workspace=web-admin
```

| App | URL | Description |
| :--- | :--- | :--- |
| **Client** | `http://localhost:3000` | Customer booking interface |
| **Provider** | `http://localhost:3001` | Service provider dashboard |
| **Admin** | `http://localhost:3002` | Platform administration |

## 🧪 Testing

```bash
# Run all tests
npm run test:full

# Run E2E tests (Playwright)
npm run test:e2e

# Run Unit tests
npm run test:unit
```

## 📦 Deployment
The platform is configured for deployment on **Cloudflare Pages** (frontend) and **Supabase** (backend). CI/CD pipelines are defined in `.github/workflows/ci.yml`.

## 📚 Documentation
- **[System Architecture](./docs/architecture/SYSTEM_ARCHITECTURE.md)**
- **[Deployment Guide](./docs/deployment/DEPLOYMENT_READINESS.md)**
