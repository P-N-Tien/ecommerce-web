# Ecommerce Admin

React, TypeScript and Vite app for the ecommerce administration console.

## Run with demo data

```sh
pnpm install
pnpm dev
```

Development uses local mock data by default, so no API server is required. Open
`http://localhost:3200` and sign in with:

- Email: `admin@example.com`
- Password: `Admin123!`

Category records and the demo session are stored in browser `localStorage`.
Clear the site's local storage to reset the demo. The Change password link in
the header opens the password flow for the signed-in demo account.

## Connect to the API

Copy `.env.example` to `.env`, set `VITE_API_BASE_URL`, then set
`VITE_USE_MOCK_API=false`. The frontend expects the auth and category endpoints
used in `src/features/*/api`.

## Source structure

```text
src/
├── app/                  # Routes, providers, navigation and app-level pages
├── components/           # Shared UI and feedback components
├── features/             # Domain modules (auth, catalog/categories)
├── lib/                  # Small shared utilities
├── services/http/        # HTTP clients and runtime configuration
├── widgets/              # Header, sidebar and admin layout
└── main.tsx              # Browser entry point
```

Keep domain API calls, schemas, types and UI together under `features`. Use
`app` for route composition and cross-feature navigation, and `widgets` for
larger reusable interface sections.

## Scripts

```sh
pnpm dev
pnpm build
pnpm lint
pnpm preview
```
