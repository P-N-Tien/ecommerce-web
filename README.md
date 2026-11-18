# Ecommerce Admin

React, TypeScript and Vite application for the ecommerce administration console.

## Source structure

```text
src/
├── app/                  # Application composition: providers, router, navigation
├── components/ui/        # Reusable, domain-agnostic UI primitives
├── features/             # Product domains and their UI, state, schemas and API calls
│   └── auth/             # Sign-in flow
│       ├── api/
│       ├── components/
│       ├── pages/
│       └── schemas/
├── lib/                  # Shared helpers, API error parsing and auth utilities
├── services/http/        # Axios clients, interceptors and transport-level types
└── main.tsx              # Browser entry point and global providers
```

As the admin areas are implemented, keep each business domain together under
`src/features` (for example `catalog`, `orders`, `inventory`, `customers`, and
`access`). A feature should own its pages, components, schemas, hooks and API
functions. Promote code to `components/ui` or `lib` only when it is genuinely
shared across domains. Keep route composition and cross-feature navigation in
`app`; keep HTTP transport concerns in `services/http`.

## Development

```sh
pnpm install
pnpm dev
```

The dev server uses port `3200` and fails if that port is already in use.

## Production build

```sh
pnpm build
pnpm preview
```

## Environment

Copy `.env.example` to `.env` and set the API base URL for the target environment.
