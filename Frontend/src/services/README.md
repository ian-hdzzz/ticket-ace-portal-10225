# Services Directory

This directory contains service modules that handle all communication with the backend API.

## Purpose

Services provide a clean abstraction layer between UI components and backend APIs. They:
- Encapsulate all API communication logic
- Provide type-safe interfaces
- Handle errors consistently
- Make testing easier (mockable)
- Enable easy backend URL changes

## Current Services

### `auth.service.ts`
Handles user authentication and session management.

**Methods:**
- `login(email, password)` - Authenticate user
- `logout()` - End user session
- `refreshToken()` - Refresh access token
- `getCurrentUser()` - Get stored user data
- `setCurrentUser(user)` - Store user data
- `clearCurrentUser()` - Remove user data

**Example usage:**
```typescript
import { authService } from '@/services/auth.service';

// In a component
const handleLogin = async () => {
  try {
    const response = await authService.login(email, password);
    if (response.success) {
      authService.setCurrentUser(response.user);
      navigate('/dashboard');
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

## Creating New Services

When migrating from Supabase or adding new backend features, follow this pattern:

### 1. Create Service File
```typescript
// services/tickets.service.ts
import apiClient from '../api/client';

// Define response types
export interface Ticket {
  id: string;
  title: string;
  // ...
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  // ...
}

class TicketsService {
  async getAll(): Promise<Ticket[]> {
    try {
      const response = await apiClient.get<Ticket[]>('/tickets');
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data;
      }
      throw {
        success: false,
        message: error.message || 'Error fetching tickets',
      };
    }
  }

  async create(data: CreateTicketRequest): Promise<Ticket> {
    try {
      const response = await apiClient.post<Ticket>('/tickets', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data;
      }
      throw {
        success: false,
        message: error.message || 'Error creating ticket',
      };
    }
  }

  // ... more methods
}

export const ticketsService = new TicketsService();
export default ticketsService;
```

### 2. Use in Components
```typescript
import { ticketsService } from '@/services/tickets.service';
import { useQuery } from '@tanstack/react-query';

function TicketsPage() {
  const { data: tickets, isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => ticketsService.getAll(),
  });

  // ...
}
```

## Best Practices

### ✅ Do's
- Use TypeScript types for all requests/responses
- Use the shared `apiClient` from `api/client.ts`
- Handle errors consistently (try/catch with error.response.data)
- Export a singleton instance of the service
- Keep services focused on API communication only
- Document methods with JSDoc comments

### ❌ Don'ts
- Don't put business logic in services (that belongs in components/hooks)
- Don't create axios instances directly (use `apiClient`)
- Don't store state in services (use React state/context)
- Don't mix Supabase and backend API calls in same service
- Don't handle UI concerns (toasts, redirects) in services

## Error Handling Pattern

All services should follow this error handling pattern:

```typescript
async someMethod() {
  try {
    const response = await apiClient.post('/endpoint', data);
    return response.data;
  } catch (error: any) {
    // Backend returned structured error
    if (error.response?.data) {
      throw error.response.data;
    }
    
    // Network or other error
    throw {
      success: false,
      message: error.message || 'Default error message',
    };
  }
}
```

This ensures components always receive a consistent error structure.

## Migration Checklist

When migrating a feature from Supabase to backend:

- [ ] Create service file in `services/`
- [ ] Define TypeScript interfaces for data types
- [ ] Implement methods using `apiClient`
- [ ] Add proper error handling
- [ ] Update component to use service instead of Supabase
- [ ] Test all CRUD operations
- [ ] Update documentation

## API Client Configuration

The shared API client is configured in `api/client.ts`:
- Base URL: `http://localhost:8081` (or `VITE_BACKEND_URL` env var)
- Timeout: 10 seconds
- Credentials: Included (for JWT cookies)
- Interceptors: Request/response logging in dev mode

## Related Files

- `api/client.ts` - Shared axios instance
- `types/` - Shared TypeScript types (when needed)
- `hooks/` - React hooks that use services (e.g., `useAuth`)

