# Architecture Documentation

## Overview

Ticket Ace Portal is a modern React frontend that serves as a visualization and customization layer on top of Chatwoot, a self-hosted customer support platform. This architecture leverages Chatwoot's robust backend capabilities while providing a fully customizable user interface.

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
│  │  │  API Layer (src/api/)                              │  │  │
│  │  │  - tickets.ts, agents.ts                           │  │  │
│  │  └──────────────────┬─────────────────────────────────┘  │  │
│  │                     │                                     │  │
│  │  ┌──────────────────▼─────────────────────────────────┐  │  │
│  │  │  Chatwoot Client (src/lib/chatwootClient.ts)      │  │  │
│  │  │  - HTTP client, authentication, error handling    │  │  │
│  │  └──────────────────┬─────────────────────────────────┘  │  │
│  └──────────────────────┼───────────────────────────────────┘  │
│                         │ REST API (HTTPS)                      │
└─────────────────────────┼──────────────────────────────────────┘
                          │
┌─────────────────────────▼──────────────────────────────────────┐
│              Chatwoot Backend (Docker)                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Rails Application                                       │  │
│  │  - REST API endpoints                                    │  │
│  │  - Business logic                                        │  │
│  │  - Authentication & Authorization                        │  │
│  └────┬─────────────────────────────┬──────────────────────┘  │
│       │                             │                          │
│  ┌────▼─────┐                 ┌─────▼─────┐                  │
│  │PostgreSQL│                 │   Redis   │                  │
│  │ Database │                 │   Queue   │                  │
│  │          │                 │           │                  │
│  │ - Tickets│                 │ - Jobs    │                  │
│  │ - Agents │                 │ - Cache   │                  │
│  │ - Users  │                 │           │                  │
│  └──────────┘                 └───────────┘                  │
└───────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Directory Structure

```
src/
├── api/                    # API integration layer
│   ├── tickets.ts         # Ticket/Conversation operations
│   └── agents.ts          # Agent/User operations
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
├── lib/                   # Utilities and clients
│   ├── chatwootClient.ts # Chatwoot API client
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
└────┬──────────────┘
     │
     │ chatwootFetch()
     │
┌────▼──────────────────┐
│  Chatwoot Client      │
│  (chatwootClient.ts)  │
└────┬──────────────────┘
     │
     │ HTTP Request
     │
┌────▼──────────┐
│  Chatwoot API │
│  (Backend)    │
└───────────────┘
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

## Backend Architecture (Chatwoot)

### Services

```
┌─────────────────────────────────────────┐
│      Docker Compose Stack               │
│                                         │
│  ┌─────────────┐  ┌─────────────┐     │
│  │   Rails     │  │   Sidekiq   │     │
│  │  (Web)      │  │  (Worker)   │     │
│  │  Port:3000  │  │             │     │
│  └──────┬──────┘  └──────┬──────┘     │
│         │                │             │
│  ┌──────▼───────────────▼───────┐     │
│  │      PostgreSQL              │     │
│  │      Port:5432               │     │
│  └──────────────────────────────┘     │
│                                         │
│  ┌──────────────────────────────┐     │
│  │      Redis                   │     │
│  │      Port:6379               │     │
│  └──────────────────────────────┘     │
└─────────────────────────────────────────┘
```

### Key Concepts

1. **Conversations** (Chatwoot) = **Tickets** (Our UI)
   - Chatwoot uses "conversations" as the core entity
   - We map these to "tickets" in our UI

2. **Users/Agents** (Chatwoot) = **Agents** (Our UI)
   - Chatwoot users with agent/admin roles
   - Displayed as agents in our interface

3. **Accounts**
   - Multi-tenant structure
   - Each account has its own conversations, users, and settings

## API Integration

### Authentication

```typescript
// Headers sent with every request
{
  "Content-Type": "application/json",
  "api_access_token": "<VITE_CHATWOOT_ACCESS_TOKEN>"
}
```

### Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/accounts/{id}/conversations` | GET | List all conversations |
| `/api/v1/accounts/{id}/conversations/{id}` | GET | Get conversation details |
| `/api/v1/accounts/{id}/conversations/{id}` | PUT | Update conversation |
| `/api/v1/accounts/{id}/agents` | GET | List agents |

### Data Mapping

**Chatwoot Conversation → Our Ticket**
```typescript
{
  id: number → string
  status: string → "open" | "in_progress" | "resolved" | "closed"
  priority: string → "low" | "medium" | "high" | "urgent"
  contact.name → title
  created_at → created_at
  updated_at → updated_at
  meta.sender.id → agent_id
}
```

**Chatwoot Agent → Our Agent**
```typescript
{
  id: number → string
  name / available_name → name
  role → mapped to status/type
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
Proxy requests to Chatwoot API
```

### Production

```
npm run build
    ↓
Static files (dist/)
    ↓
Deploy to CDN/Static Host
    ↓
Environment variables (.env)
    ↓
API requests to Chatwoot instance
```

## Security Considerations

1. **API Tokens**: Stored in environment variables (not committed)
2. **CORS**: Configured on Chatwoot backend
3. **HTTPS**: Required for production
4. **Authentication**: Handled by Chatwoot backend

## Scalability

### Frontend
- Stateless components
- Client-side caching (React Query)
- Code splitting (Vite)

### Backend (Chatwoot)
- Horizontal scaling via Docker
- PostgreSQL replication
- Redis clustering
- Load balancing

## Extension Points

### Adding New Features

1. **New Page**: Add route in `App.tsx`, create component in `pages/`
2. **New API Endpoint**: Add function in `src/api/`, use in components
3. **New Component**: Add to `components/features/` or `components/layout/`
4. **New Type**: Add to `types/entities.ts`

### Integrating Chatwoot Features

Chatwoot provides a comprehensive API. To integrate new features:

1. Review [Chatwoot API Docs](https://www.chatwoot.com/developers/api/)
2. Add client function in `src/lib/chatwootClient.ts` if needed
3. Add API wrapper in `src/api/`
4. Create UI components
5. Add to pages

## Troubleshooting Architecture

### Frontend Issues

```
Component not rendering
    ↓
Check React Query state
    ↓
Check API function
    ↓
Check Chatwoot client
    ↓
Check network requests (DevTools)
```

### Backend Issues

```
API error
    ↓
Check Chatwoot logs (Docker)
    ↓
Verify credentials (.env)
    ↓
Check Chatwoot API status
    ↓
Verify database connection
```

## Future Considerations

1. **WebSocket Integration**: Real-time updates via Chatwoot WebSockets
2. **Custom Actions**: Extend Chatwoot with custom actions
3. **Plugin System**: Modular feature additions
4. **Mobile App**: React Native version using same API
5. **Multi-language**: i18n support for UI

