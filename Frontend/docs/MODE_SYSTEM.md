# Application Mode System

This document explains the dual-mode system (Demo/Production) implemented in the application.

## Overview

The application supports two operational modes:

- **Demo Mode**: Uses in-memory mock data (default)
- **Production Mode**: Connects to Supabase for persistent data storage

## Architecture

### Mode Detection

Mode is determined by the `VITE_APP_MODE` environment variable:
- `demo` or unset → Demo mode
- `production` → Production mode

Configuration is handled in `src/lib/config.ts`:

```typescript
export function getAppMode(): AppMode {
  const mode = import.meta.env.VITE_APP_MODE || "demo";
  return mode === "production" ? "production" : "demo";
}
```

### API Layer

All API functions in `src/api/` are mode-aware:

1. **Demo functions**: Use in-memory arrays with simulated network delays
2. **Production functions**: Connect to Supabase
3. **Public API**: Automatically routes to the correct implementation

Example from `src/api/tickets.ts`:

```typescript
export async function listTickets(): Promise<Ticket[]> {
  return isDemoMode() ? listTicketsDemo() : listTicketsProduction();
}
```

### Data Mapping

The application uses English values in the API layer and Spanish values in the UI:

- **Status**: `open` → `abierto`, `in_progress` → `en_progreso`, etc.
- **Priority**: `low` → `baja`, `medium` → `media`, etc.

Mapping functions are in `src/lib/mappers.ts`:

```typescript
export function mapStatus(status: string): "abierto" | "en_progreso" | "resuelto" | "cerrado"
export function mapPriority(priority: string): "baja" | "media" | "alta" | "urgente"
```

## Demo Mode

### Characteristics

- ✅ No backend required
- ✅ Instant setup
- ✅ Perfect for demos and development
- ❌ Data resets on page refresh
- ❌ No data persistence

### Implementation

- Data stored in module-level arrays (`mockTickets`, `mockAgents`)
- Simulated network delays (200-300ms)
- All CRUD operations work with in-memory data

### Usage

```env
VITE_APP_MODE=demo
# Or simply omit the variable (demo is default)
```

## Production Mode

### Characteristics

- ✅ Persistent data storage
- ✅ Real-time updates (with Supabase Realtime)
- ✅ Scalable and production-ready
- ❌ Requires Supabase setup
- ❌ Requires database schema configuration

### Implementation

- Uses Supabase client (`@supabase/supabase-js`)
- Connects to PostgreSQL database
- Full CRUD operations with error handling

### Setup

1. **Environment Variables**:
   ```env
   VITE_APP_MODE=production
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

2. **Database Schema**: See [Supabase Setup Guide](./SUPABASE_SETUP.md)

3. **Row Level Security**: Configure RLS policies in Supabase

### Usage

```env
VITE_APP_MODE=production
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Switching Modes

### Development

1. Update `.env` file
2. Restart development server (`npm run dev`)
3. Mode change takes effect immediately

### Production Build

1. Update `.env` file
2. Rebuild: `npm run build`
3. Deploy the new `dist/` folder

## Error Handling

### Demo Mode Errors

- Minimal error handling (mostly for type safety)
- Errors are logged to console

### Production Mode Errors

- Comprehensive error handling
- Supabase connection errors are caught and reported
- Missing configuration shows helpful warnings

Example error handling:

```typescript
if (!supabase) {
  throw new Error("Supabase client not available. Check your configuration.");
}
```

## Testing Both Modes

### Test Demo Mode

```bash
# .env
VITE_APP_MODE=demo

npm run dev
```

### Test Production Mode

```bash
# .env
VITE_APP_MODE=production
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

npm run dev
```

## Adding New Features

When adding new API endpoints:

1. **Create demo function**: `async function myFunctionDemo() { ... }`
2. **Create production function**: `async function myFunctionProduction() { ... }`
3. **Create public API**: `export async function myFunction() { return isDemoMode() ? myFunctionDemo() : myFunctionProduction(); }`

This ensures all features work in both modes.

## Benefits

1. **Development Speed**: Demo mode allows rapid development without backend setup
2. **Production Ready**: Easy switch to production mode when ready
3. **Testing**: Test features in both modes to ensure compatibility
4. **Demos**: Perfect for client demonstrations without backend dependencies
5. **CI/CD**: Can run tests in demo mode without external dependencies

