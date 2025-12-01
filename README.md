# The Lokals Platform

## Overview

The Lokals Platform is a decentralized service marketplace that connects local service providers with customers. This repository contains the code for the entire platform, which is built using a monorepo architecture. The platform consists of four main packages:

*   **`client`**: A React-based web application that allows customers to find and book services.
*   **`provider`**: A web application for service providers to manage their profiles, services, and bookings.
*   **`core`**: A library that contains the core business logic and data models for the platform.
*   **`db`**: A package that contains the database schema and migration scripts.

## Getting Started

To get started with the platform, you will need to have the following installed:

*   [Node.js](https.://nodejs.org/en/)
*   [pnpm](https://pnpm.io/)

Once you have these installed, you can clone the repository and install the dependencies:

```bash
git clone https://github.com/the-lokals/platform.git
cd platform
pnpm install
```

## Running the Platform

To run the platform, you can use the following command:

```bash
pnpm dev
```

This will start the `client` and `provider` applications in development mode. The `client` application will be available at `http://localhost:5173` and the `provider` application will be available at `http://localhost:5174`.

## Deployment

The platform is deployed using Vercel. The `client` and `provider` applications are deployed as separate Vercel projects. The `core` and `db` packages are not deployed directly, but are used by the `client` and `provider` applications.

## Documentation

Comprehensive project documentation is available in the **[docs](./docs/)** folder, including:

- **[System Architecture](./docs/SYSTEM_ARCHITECTURE.md)**: High-level design and database schema.
- **[Development Guide](./docs/DEVELOPMENT_GUIDE.md)**: Setup and workflow instructions.
- **[API Reference](./docs/API_REFERENCE.md)**: Database functions and API details.
- **[Testing Guide](./docs/TESTING_GUIDE.md)**: E2E testing strategy and instructions.
- **[Worker Credentials](./docs/WORKER_CREDENTIALS.md)**: Test account details.

## Contributing

We welcome contributions to the platform. If you would like to contribute, please fork the repository and create a pull request.
