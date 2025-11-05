# Folder Structure

This document outlines the project's folder organization after cleanup and reorganization.

## Root Directory

```
ticket-ace-portal-10225/
├── src/                          # Source code
├── scripts/                      # Utility scripts (if needed)
├── public/                       # Static assets
├── node_modules/                 # Dependencies (generated)
├── dist/                         # Build output (generated)
├── .env                          # Environment variables (not committed)
├── env.example                   # Environment template
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript config
├── vite.config.ts                # Vite config
├── tailwind.config.ts            # Tailwind CSS config
├── README.md                     # Project documentation
└── docs/                         # Documentation
    ├── ARCHITECTURE.md           # Architecture diagrams & docs
    ├── CLEANUP_SUMMARY.md        # Cleanup documentation
    └── FOLDER_STRUCTURE.md       # This file
```

## Source Code Structure (`src/`)

```
src/
├── api/                          # API integration layer
│   ├── tickets.ts               # Ticket/Conversation API functions
│   └── agents.ts                # Agent/User API functions
│
├── components/                   # React components
│   ├── ui/                      # Shadcn UI base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ... (40+ UI components)
│   │
│   ├── features/                # Feature-specific components
│   │   ├── TicketCard.tsx      # Ticket display component
│   │   └── StatCard.tsx        # Statistics card component
│   │
│   └── layout/                  # Layout components
│       ├── DashboardLayout.tsx  # Main layout wrapper
│       └── AppSidebar.tsx       # Navigation sidebar
│
├── hooks/                        # Custom React hooks
│   ├── use-mobile.tsx          # Mobile detection hook
│   └── use-toast.ts            # Toast notification hook
│
├── lib/                          # Utilities
│   └── utils.ts                # Helper functions (cn, etc.)
│
├── pages/                        # Page components
│   ├── Dashboard.tsx           # Dashboard page
│   ├── Tickets.tsx             # Tickets list page
│   ├── TicketDetails.tsx       # Ticket detail page
│   ├── Agents.tsx              # Agents management page
│   ├── Settings.tsx            # Settings page
│   ├── Index.tsx               # Index redirect
│   └── NotFound.tsx            # 404 page
│
├── types/                        # TypeScript type definitions
│   └── entities.ts             # Domain entities (Ticket, Agent)
│
├── App.tsx                       # Root component (routing setup)
├── App.css                       # Global app styles
├── main.tsx                      # Application entry point
├── index.css                     # Global styles & CSS variables
└── vite-env.d.ts                # Vite type definitions
```

## Key Directories Explained

### `src/api/`
**Purpose**: Data access layer (currently using mock data).

- Functions return domain entities (Ticket, Agent)
- Currently uses in-memory mock data
- Can be replaced with real API calls to any backend
- Used by React Query hooks in components

**Example**:
```typescript
// src/api/tickets.ts
export async function listTickets(): Promise<Ticket[]>
export async function getTicketById(id: string): Promise<Ticket | null>
```

### `src/components/ui/`
**Purpose**: Base UI components from Shadcn UI library.

- Reusable, unstyled components
- Follow design system patterns
- Composable (can be combined)
- Examples: Button, Card, Dialog, Input, Select

### `src/components/features/`
**Purpose**: Feature-specific components that combine UI components.

- Business logic components
- Domain-specific functionality
- Examples: TicketCard (displays ticket data), StatCard (shows metrics)

### `src/components/layout/`
**Purpose**: Layout components that structure the application.

- Define page structure
- Navigation components
- Examples: DashboardLayout (main wrapper), AppSidebar (navigation)

### `src/pages/`
**Purpose**: Top-level page components (route handlers).

- Each file = one route/page
- Composes features and layout components
- Uses React Query for data fetching
- Examples: Dashboard, Tickets, Agents

### `src/lib/`
**Purpose**: Shared utilities.

- **utils.ts**: Helper functions (e.g., `cn` for className merging)

### `src/types/`
**Purpose**: TypeScript type definitions.

- Domain entities (Ticket, Agent)
- API response types
- Shared types across the application

## Scripts (`scripts/`)

Scripts directory is available for custom utility scripts if needed.

## Import Patterns

### Absolute Imports (Recommended)
```typescript
// Use @/ prefix (configured in tsconfig.json)
import { TicketCard } from "@/components/features/TicketCard";
import { listTickets } from "@/api/tickets";
import type { Ticket } from "@/types/entities";
```

### Component Imports
```typescript
// UI components
import { Button } from "@/components/ui/button";

// Feature components
import { TicketCard } from "@/components/features/TicketCard";

// Layout components
import { DashboardLayout } from "@/components/layout/DashboardLayout";
```

### API Imports
```typescript
// API functions
import { listTickets, getTicketById } from "@/api/tickets";
import { listAgents } from "@/api/agents";

// Client
import { chatwootFetch } from "@/lib/chatwootClient";
```

## Adding New Files

### New Page
1. Create file in `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx`
3. Optionally add navigation link in `src/components/layout/AppSidebar.tsx`

### New Feature Component
1. Create file in `src/components/features/NewFeature.tsx`
2. Import UI components from `@/components/ui/`
3. Use in pages or other components

### New API Endpoint
1. Add function in `src/api/` (appropriate file or new file)
2. Replace mock data with real API calls using `fetch` or your HTTP client
3. Define types in `src/types/entities.ts` if needed

### New Type
1. Add to `src/types/entities.ts` or create new file in `src/types/`
2. Export and use across the application

## Best Practices

1. **Keep components small**: Single responsibility principle
2. **Use TypeScript**: All files should be typed
3. **Absolute imports**: Use `@/` prefix for clarity
4. **Feature organization**: Group related components in `features/`
5. **Shared code**: Put reusable utilities in `lib/`
6. **Type safety**: Define types in `types/` and use them consistently

