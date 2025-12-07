# Architecture Documentation

## Overview

Ticket Ace Portal is a modern React frontend application for ticket management and agent administration. Built with a clean, modular architecture that uses mock data by default but can be easily connected to any backend API.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Browser                              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         React Frontend (This Project)                    │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Pages & Components (UI Layer)                     │  │  │
│  │  │  - Dashboard, Tickets, Agents, Settings           │  │  │
│  │  └──────────────────┬─────────────────────────────────┘  │  │
│  │                     │                                     │  │
│  │  ┌──────────────────▼─────────────────────────────────┐  │  │
│  │  │  React Query (State Management)                    │  │  │
│  │  │  - Data fetching, caching, synchronization        │  │  │
│  │  └──────────────────┬─────────────────────────────────┘  │  │
│  │                     │                                     │  │
│  │  ┌──────────────────▼─────────────────────────────────┐  │  │
│  │  │  API Layer (src/api/)                              │  │  │
│  │  │  - tickets.ts, agents.ts                           │  │  │
│  │  │  - Currently uses mock data                        │  │  │
│  │  └──────────────────┬─────────────────────────────────┘  │  │
│  └──────────────────────┼───────────────────────────────────┘  │
│                         │ (Optional: Replace with API calls)   │
└─────────────────────────┼──────────────────────────────────────┘
                          │
                  ┌───────▼────────┐
                  │  Backend API   │
                  │  (Your choice) │
                  └────────────────┘
```

## Frontend Architecture

### Directory Structure

```
src/
├── api/                    # API integration layer
│   ├── tickets.ts         # Ticket operations (mock data)
│   └── agents.ts          # Agent operations (mock data)
│
├── components/            # React components
│   ├── ui/               # Shadcn UI components (base components)
│   ├── features/         # Feature-specific components
│   │   ├── TicketCard.tsx
│   │   └── StatCard.tsx
│   └── layout/           # Layout components
│       ├── DashboardLayout.tsx
│       └── AppSidebar.tsx
│
├── hooks/                 # Custom React hooks
│   ├── use-mobile.tsx
│   └── use-toast.ts
│
├── lib/                   # Utilities
│   └── utils.ts          # Helper functions
│
├── pages/                 # Page components
│   ├── Dashboard.tsx
│   ├── Tickets.tsx
│   ├── TicketDetails.tsx
│   ├── Agents.tsx
│   ├── Settings.tsx
│   └── NotFound.tsx
│
├── types/                 # TypeScript definitions
│   └── entities.ts       # Domain entities (Ticket, Agent)
│
├── App.tsx               # Root component with routing
└── main.tsx              # Application entry point
```

### Data Flow

```
┌──────────┐
│  Page    │
│Component │
└────┬─────┘
     │
     │ useQuery / useMutation
     │
┌────▼─────────┐
│  React Query │
│  (State Mgmt)│
└────┬─────────┘
     │
     │ Function call
     │
┌────▼──────────────┐
│  API Layer        │
│  (src/api/*.ts)   │
│  - Mock data      │
│  - Or API calls   │
└───────────────────┘
```

## Component Hierarchy

```
App
├── QueryClientProvider
│   └── TooltipProvider
│       └── BrowserRouter
│           └── Routes
│               └── DashboardLayout
│                   ├── AppSidebar (Navigation)
│                   └── Outlet (Page Content)
│                       ├── Dashboard
│                       │   ├── StatCard (×4)
│                       │   └── TicketCard (×3)
│                       ├── Tickets
│                       │   └── TicketCard (×N)
│                       ├── TicketDetails
│                       ├── Agents
│                       └── Settings
```

## API Integration

### Current Implementation: Mock Data

The application currently uses in-memory mock data for development and demonstration purposes. This allows the UI to function independently without requiring a backend.

**Mock Data Storage**:
- Data is stored in module-level arrays (`mockTickets`, `mockAgents`)
- Simulated network delays using `delay()` function
- All CRUD operations work with mock data

### Connecting to a Backend

To connect to a real backend API:

1. **Update API functions** in `src/api/tickets.ts` and `src/api/agents.ts`
2. **Replace mock data** with actual API calls using `fetch` or your preferred HTTP client
3. **Configure environment variables** in `.env` file
4. **Update API base URL** as needed

**Example**:
```typescript
// src/api/tickets.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export async function listTickets(): Promise<Ticket[]> {
  const response = await fetch(`${API_BASE_URL}/api/tickets`, {
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}
```

## State Management

### React Query

- **Caching**: Automatic caching of API responses
- **Refetching**: Automatic refetch on window focus
- **Optimistic Updates**: Support for optimistic UI updates
- **Error Handling**: Built-in error states

### Query Keys

```typescript
["tickets"]              // List of all tickets
["ticket", id]           // Single ticket by ID
["agents"]               // List of all agents
```

## Styling Architecture

```
Tailwind CSS (Utility-first)
    ↓
Shadcn UI Components (Component library)
    ↓
Custom Components (Feature-specific)
    ↓
Pages (Composition)
```

### Theme System

- CSS Variables for theming
- Dark mode support via `next-themes`
- Customizable via `tailwind.config.ts`

## Build & Deployment

### Development

```
npm run dev
    ↓
Vite Dev Server (HMR)
    ↓
Mock data (no backend required)
```

### Production

```
npm run build
    ↓
Static files (dist/)
    ↓
Deploy to CDN/Static Host
    ↓
(Optional: Connect to backend API)
```

## Security Considerations

1. **API Tokens**: Store in environment variables (not committed)
2. **CORS**: Configure on backend if needed
3. **HTTPS**: Required for production
4. **Authentication**: Handled by backend (if applicable)

## Scalability

### Frontend
- Stateless components
- Client-side caching (React Query)
- Code splitting (Vite)
- Lazy loading support

### Backend Integration
- RESTful API patterns
- Environment-based configuration
- Error handling and retry logic
- Request/response typing

## Extension Points

### Adding New Features

1. **New Page**: Add route in `App.tsx`, create component in `pages/`
2. **New API Endpoint**: Add function in `src/api/`, replace mock with API calls
3. **New Component**: Add to `components/features/` or `components/layout/`
4. **New Type**: Add to `types/entities.ts`

### Integrating a Backend

1. **Choose your backend**: REST API, GraphQL, gRPC, etc.
2. **Create API client**: Add HTTP client in `src/lib/` if needed
3. **Update API functions**: Replace mock data in `src/api/`
4. **Configure environment**: Set `VITE_API_BASE_URL` in `.env`
5. **Handle authentication**: Add auth headers/tokens as needed

## Future Considerations

1. **WebSocket Integration**: Real-time updates via WebSockets
2. **Offline Support**: Service workers and offline-first patterns
3. **Progressive Web App**: PWA features for mobile-like experience
4. **Multi-language**: i18n support for UI
5. **Testing**: Unit tests, integration tests, E2E tests
6. **Performance**: Code splitting, lazy loading, optimization
