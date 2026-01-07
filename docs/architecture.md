# Architecture

## Directory Structure
```text
lokals/
├── apps/               # Entry points (Thin Clients)
│   ├── web-client/     # Next.js
│   ├── web-provider/   # Next.js
│   ├── web-admin/      # Next.js
│   ├── mobile-client/  # Expo (React Native)
│   └── mobile-provider/# Expo (React Native)
├── packages/           # Shared Logic (The Platform)
│   ├── platform-core/  # Contracts, API Clients, Validation, Hooks (Logic)
│   ├── platform-config/# Glossaries, Constants, Env Vars
│   ├── platform-analytics/ # Abstracted Analytics Events
│   ├── ui-web/         # Shared React Components (DOM)
│   └── ui-mobile/      # Shared React Native Components
```

## Dependency Flow
`Apps` -> depend on -> `Packages`
`Packages` -> depend on -> `External Libs` (or other `Packages`)

## Technologies
- **Monorepo Manager**: Npm Workspaces + Turbo
- **Web**: Next.js, TailwindCSS
- **Mobile**: React Native, Expo, NativeWind
- **Shared**: TypeScript, Zod, SWR/React Query
