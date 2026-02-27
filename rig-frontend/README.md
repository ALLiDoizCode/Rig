# Rig

A decentralized Git hosting frontend implementing NIP-34 (Nostr Implementation Possibilities #34) for censorship-resistant code collaboration.

Rig provides a web interface to browse Git repositories announced on Nostr relays, with permanent file storage on Arweave via ar.io gateways.

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd rig-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env.development
```

For local overrides, create a `.env.local` file (git-ignored):

```bash
cp .env.example .env.local
```

See the [Environment Variables](#environment-variables) section for details.

### 4. Start the development server

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (default Vite port).

## Environment Variables

All environment variables must be prefixed with `VITE_` to be exposed to the client-side application (Vite security model).

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_NOSTR_RELAYS` | Comma-separated WebSocket URLs of Nostr relays to query for NIP-34 git repository events | `wss://relay.damus.io,wss://nos.lol,wss://relay.nostr.band` |
| `VITE_ARWEAVE_GATEWAY` | Primary Arweave gateway URL for fetching permanent file storage | `https://arweave.net` |
| `VITE_ENABLE_DEVTOOLS` | Enable React Query DevTools UI (`true` or `false`) | `true` (dev), `false` (prod) |

### Environment Files

- `.env.development` - Development mode (loaded by `npm run dev`)
- `.env.production` - Production mode (loaded by `npm run build`)
- `.env.local` - Local overrides (git-ignored, highest priority)
- `.env.example` - Template with documentation (committed to git)

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server with HMR |
| `npm run build` | Build for production (runs type check + vite build) |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run all tests with Vitest |
| `npm run test:ui` | Run tests with Vitest UI |
| `npm run lint` | Run ESLint for code quality checks |

## Project Structure

```
rig-frontend/
├── src/
│   ├── components/     # Reusable React components
│   ├── contexts/       # React Context providers (Theme, etc.)
│   ├── constants/      # App-wide constants (event kinds, relays, gateways)
│   ├── lib/            # Service layer (Nostr, Arweave, cache, query client)
│   ├── pages/          # Route-level page components
│   ├── routes.tsx      # React Router route definitions
│   ├── types/          # TypeScript type definitions and Zod schemas
│   ├── env.d.ts        # Environment variable type declarations
│   ├── main.tsx        # Application entry point
│   └── App.tsx         # Root application component
├── .env.development    # Development environment config
├── .env.production     # Production environment config
├── .env.example        # Environment template
└── README.md           # This file
```

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router v7** - Client-side routing
- **TanStack Query v6** - Data fetching and caching
- **shadcn/ui** - UI component library (Radix UI + Tailwind CSS)
- **Vitest** - Unit and integration testing
- **Zod v4** - Runtime validation and schema definitions
- **Nostr Tools** - Nostr protocol client
- **IndexedDB** - Client-side data persistence
- **Arweave** - Permanent file storage via ar.io gateways

## Architecture

Rig follows a layered architecture:

1. **UI Layer** (`components/`, `pages/`) - React components
2. **Service Layer** (`lib/`) - Business logic and external integrations
   - `lib/nostr.ts` - Nostr relay communication
   - `lib/arweave.ts` - Arweave gateway integration
   - `lib/cache.ts` - IndexedDB caching layer
   - `lib/query-client.ts` - TanStack Query configuration
3. **Data Layer** (`types/`, `constants/`) - Type definitions and constants

## Development Workflow

1. **Environment setup**: Copy `.env.example` to `.env.local` and customize as needed
2. **Development**: Run `npm run dev` for hot-reloading development server
3. **Testing**: Run `npm run test` to execute unit and integration tests
4. **Linting**: Run `npm run lint` to check code quality
5. **Type checking**: Run `npx tsc --noEmit` to verify TypeScript types
6. **Build**: Run `npm run build` to create production bundle
7. **Preview**: Run `npm run preview` to test production build locally

## Contributing

Please ensure all tests pass and linting is clean before submitting changes:

```bash
npm run lint
npm run test
npx tsc --noEmit
```

## License

[License information to be added]
