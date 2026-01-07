# Lokals Platform Vision

## Mission
To normalize the monorepo into an `apps/` + `packages/` structure that supports platform-first, API-centric, provider-agnostic development. We are building the **Lokals Platform**, not just a collection of apps.

## Principles
1.  **Platform First**: Business logic lives in `packages/platform-*`. Apps are thin clients.
2.  **Surface Agnostic Logic**: Core logic should work on Web and Mobile.
3.  **Strict Boundaries**: UI components stay in `ui-web` or `ui-mobile`. Domain logic stays in `platform-core`.
4.  **Terminolgy**: Consistent naming across variables, filenames, and documentation.

## The 5 Pillars (Apps)
1.  **Web Client**: Next.js (Desktop/Mobile Web) for Customers.
2.  **Web Provider**: Next.js (Desktop/Mobile Web) for Service Providers.
3.  **Web Admin**: Next.js for Platform Administrators.
4.  **Mobile Client**: React Native (Expo) for Customers.
5.  **Mobile Provider**: React Native (Expo) for Service Providers.
