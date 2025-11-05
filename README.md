# Ticket Ace Portal

A modern, customizable React UI application for ticket management and agent administration. Built with a clean, modular architecture that can be easily connected to any backend API.

## Features

- 🎨 **Modern UI** - Built with Shadcn-ui and Tailwind CSS
- 📊 **Dashboard** - Overview of tickets, agents, and metrics
- 🎫 **Ticket Management** - Create, view, update, and track tickets
- 👥 **Agent Management** - Manage AI agents and their configurations
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- ⚡ **Fast & Performant** - Built with Vite and React
- 🔄 **Real-time Ready** - Uses React Query for efficient data fetching

## Tech Stack

- **Frontend**: Vite + React + TypeScript
- **UI Framework**: Shadcn-ui + Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router DOM
- **Build Tool**: Vite

## Project Structure

```
├── src/
│   ├── api/                    # API integration layer
│   │   ├── tickets.ts          # Ticket operations
│   │   └── agents.ts           # Agent operations
│   ├── components/
│   │   ├── ui/                 # Shadcn UI base components
│   │   ├── features/           # Feature-specific components
│   │   └── layout/             # Layout components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities
│   │   └── utils.ts            # Helper functions
│   ├── pages/                  # Page components
│   └── types/                  # TypeScript type definitions
└── docs/                       # Documentation
```

For detailed documentation, see the [docs/](./docs/) folder or start with the [Documentation Index](./docs/README.md):
- [Architecture Diagrams](./docs/ARCHITECTURE.md) - System architecture, data flow, and component hierarchy
- [Folder Structure](./docs/FOLDER_STRUCTURE.md) - Detailed project organization
- [CI/CD Pipeline](./docs/CI_CD.md) - Continuous Integration and Deployment setup

## Quick Start

### Prerequisites

- Node.js 20+ and npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ticket-ace-portal-10225
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:8080` (or the port shown in the terminal)

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run typecheck` - Check TypeScript types
- `npm run preview` - Preview production build
- `npm run ci` - Run full CI pipeline locally (lint + typecheck + build)

### Project Structure

- **`src/api/`** - API integration functions (currently using mock data)
- **`src/components/ui/`** - Reusable UI components from Shadcn-ui
- **`src/components/features/`** - Feature-specific components (TicketCard, StatCard)
- **`src/components/layout/`** - Layout components (DashboardLayout, AppSidebar)
- **`src/pages/`** - Page components (Dashboard, Tickets, Agents, Settings)
- **`src/types/`** - TypeScript type definitions

### Adding New Features

1. **New Page**: Add route in `src/App.tsx`, create component in `src/pages/`
2. **New Component**: Add to `src/components/features/` or `src/components/layout/`
3. **New API Endpoint**: Add function in `src/api/` and replace mock data with real API calls
4. **New Type**: Add to `src/types/entities.ts`

## Connecting to a Backend

Currently, the application uses mock data. To connect to a real backend:

1. **Update API functions** in `src/api/tickets.ts` and `src/api/agents.ts`
2. **Replace mock data** with actual API calls using `fetch` or your preferred HTTP client
3. **Configure environment variables** in `.env` file (see `env.example`)
4. **Update API base URL** if needed

Example:
```typescript
// src/api/tickets.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export async function listTickets(): Promise<Ticket[]> {
  const response = await fetch(`${API_BASE_URL}/api/tickets`);
  return response.json();
}
```

## Customization

This UI is designed to be highly customizable:

- **UI Components**: Modify components in `src/components/` or add new Shadcn-ui components
- **Styling**: Tailwind CSS configuration in `tailwind.config.ts`
- **Theme**: Customize colors and theme in `src/index.css` (CSS variables)
- **Layout**: Customize page layouts in `src/components/layout/DashboardLayout.tsx`

## Production Deployment

### Build

```bash
npm run build
```

This creates a `dist/` folder with production-ready static files.

### Deploy

Deploy the `dist/` folder to any static hosting service:

- **Vercel**: `vercel --prod`
- **Netlify**: `netlify deploy --prod --dir=dist`
- **AWS S3**: Upload `dist/` contents to S3 bucket
- **Any static host**: Upload `dist/` folder contents

See [CI/CD Pipeline Documentation](./docs/CI_CD.md) for automated deployment options.

## Environment Variables

Create a `.env` file in the project root (see `env.example`):

```env
# Backend API URL (if connecting to a backend)
VITE_API_BASE_URL=http://localhost:3000
```

## Troubleshooting

### Build Errors

- Run `npm install` to ensure dependencies are installed
- Clear `node_modules` and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check TypeScript errors: `npm run typecheck`

### Linting Errors

- Auto-fix issues: `npm run lint:fix`
- Check ESLint configuration in `eslint.config.js`

### Development Server Issues

- Ensure port 8080 is available (or change in `vite.config.ts`)
- Check for conflicting processes: `lsof -i :8080`

## Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Shadcn-ui Components](https://ui.shadcn.com/)
- [React Query Docs](https://tanstack.com/query/latest)
- [Tailwind CSS Docs](https://tailwindcss.com/)

## License

See LICENSE file for details.
