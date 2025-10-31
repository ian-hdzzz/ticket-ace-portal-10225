# Ticket Ace Portal

A modern, customizable UI layer built on top of Chatwoot — a powerful customer support platform. This frontend provides visualization and customization capabilities while Chatwoot handles all backend functionality, including data persistence, authentication, and business logic.

## Architecture

**Frontend (This Project)**
- React + TypeScript + Vite
- Shadcn-ui + Tailwind CSS for UI components
- React Query for data fetching and state management
- React Router for navigation
- Acts as a visualization and customization layer

**Backend (Chatwoot)**
- Self-hosted Chatwoot instance (Ruby on Rails)
- PostgreSQL database (included with Chatwoot)
- Redis for job queuing
- REST API for all operations
- Handles all business logic, authentication, and data management

This architecture allows you to:
- **Customize the UI** to match your brand and workflow
- **Visualize data** from Chatwoot in your preferred layout
- **Extend functionality** through the Chatwoot API
- **Leverage Chatwoot's features** without rebuilding them

## Tech Stack

- **Frontend**: Vite + React + TypeScript
- **UI Framework**: Shadcn-ui + Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router DOM
- **Backend**: Chatwoot (self-hosted)
- **Database**: PostgreSQL (via Chatwoot)
- **Deployment**: Docker Compose (for Chatwoot)

## Project Structure

```
├── src/
│   ├── api/                    # Chatwoot API integration layer
│   │   ├── tickets.ts          # Conversation/ticket operations
│   │   └── agents.ts           # Agent/user operations
│   ├── components/
│   │   ├── ui/                 # Shadcn UI base components
│   │   ├── features/           # Feature-specific components
│   │   └── layout/             # Layout components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities and client setup
│   │   ├── chatwootClient.ts   # Chatwoot API client
│   │   └── utils.ts            # Helper functions
│   ├── pages/                  # Page components
│   └── types/                  # TypeScript type definitions
├── infra/                      # Chatwoot Docker infrastructure
│   ├── docker-compose.chatwoot.upstream.yaml
│   ├── docker-compose.chatwoot.local.yaml
│   └── chatwoot.env
├── scripts/                    # Utility scripts
│   ├── chatwoot-start.sh
│   ├── chatwoot-stop.sh
│   └── chatwoot-init.sh
└── third_party/                # External dependencies
    └── chatwoot/               # Chatwoot upstream (git submodule)
```

For detailed documentation, see the [docs/](./docs/) folder or start with the [Documentation Index](./docs/README.md):
- [Architecture Diagrams](./docs/ARCHITECTURE.md) - System architecture, data flow, and component hierarchy
- [Folder Structure](./docs/FOLDER_STRUCTURE.md) - Detailed project organization
- [CI/CD Pipeline](./docs/CI_CD.md) - Continuous Integration and Deployment setup
- [Cleanup Summary](./docs/CLEANUP_SUMMARY.md) - Project cleanup documentation

## Setup

### Prerequisites

- Node.js 20+ and npm
- Docker and Docker Compose
- Git (for submodule)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Chatwoot Backend

Chatwoot runs in Docker and provides the backend API for this frontend.

#### Start Chatwoot

```bash
cd infra

# Start Chatwoot services (Postgres, Redis, Rails, Sidekiq)
docker compose \
  --env-file .env \
  -f docker-compose.chatwoot.upstream.yaml \
  -f docker-compose.chatwoot.local.yaml \
  up -d postgres redis rails sidekiq
```

The first time, you need to prepare the database:

```bash
docker compose \
  --env-file .env \
  -f docker-compose.chatwoot.upstream.yaml \
  -f docker-compose.chatwoot.local.yaml \
  run --rm rails bundle exec rails db:chatwoot_prepare
```

#### Configure Chatwoot

1. Open `http://localhost:3000` in your browser
2. Sign up for an account (signup is enabled by default in local setup)
3. After login, go to **Settings → Applications → Access Tokens**
4. Create a personal access token
5. Note your **Account ID** from the URL (e.g., `http://localhost:3000/app/accounts/1/...`) or from Settings

#### Stop Chatwoot

```bash
cd infra
docker compose \
  --env-file .env \
  -f docker-compose.chatwoot.upstream.yaml \
  -f docker-compose.chatwoot.local.yaml \
  down
```

### 3. Configure Frontend

Create a `.env` file in the project root:

```bash
cp env.example .env
```

Edit `.env` with your Chatwoot credentials:

```env
VITE_CHATWOOT_BASE_URL=http://localhost:3000
VITE_CHATWOOT_ACCESS_TOKEN=your-access-token-here
VITE_CHATWOOT_ACCOUNT_ID=1
```

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port Vite assigns).

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Adding New Features

1. **Data Layer**: Add functions in `src/api/` to interact with Chatwoot API
2. **Components**: Create reusable UI components in `src/components/`
3. **Pages**: Add new pages in `src/pages/` and register routes in `src/App.tsx`
4. **Types**: Define TypeScript interfaces in `src/types/` to match your data structures

### Chatwoot API Integration

All API calls go through `src/lib/chatwootClient.ts`, which handles:
- Base URL configuration
- Authentication headers
- Error handling

See [Chatwoot API Documentation](https://www.chatwoot.com/developers/api/) for available endpoints.

## Customization

This frontend is designed to be highly customizable:

- **UI Components**: Modify components in `src/components/` or add new Shadcn-ui components
- **Styling**: Tailwind CSS configuration in `tailwind.config.ts`
- **Data Mapping**: Adjust how Chatwoot data maps to your UI in `src/api/tickets.ts` and `src/api/agents.ts`
- **Layout**: Customize page layouts in `src/components/DashboardLayout.tsx`

## Production Deployment

### Frontend

Build the frontend:

```bash
npm run build
```

Deploy the `dist/` folder to your preferred static hosting (Vercel, Netlify, etc.).

### Chatwoot Backend

For production Chatwoot deployment, refer to the [official Chatwoot deployment guide](https://www.chatwoot.com/docs/self-hosted/deployment/docker).

**Important**: Update `VITE_CHATWOOT_BASE_URL` in your frontend `.env` to point to your production Chatwoot instance.

## Troubleshooting

### Chatwoot Not Starting

- Check Docker logs: `docker compose -f infra/docker-compose.chatwoot.upstream.yaml logs`
- Ensure Postgres is ready before starting Rails: `docker compose exec postgres pg_isready`
- Reset volumes if needed: `docker compose down -v`

### API Errors

- Verify `VITE_CHATWOOT_ACCESS_TOKEN` is set correctly
- Ensure `VITE_CHATWOOT_ACCOUNT_ID` matches your account
- Check Chatwoot logs for API errors

### Build Errors

- Run `npm install` to ensure dependencies are installed
- Clear `node_modules` and reinstall if needed: `rm -rf node_modules package-lock.json && npm install`

## Resources

- [Chatwoot Documentation](https://www.chatwoot.com/docs/)
- [Chatwoot API Reference](https://www.chatwoot.com/developers/api/)
- [Chatwoot GitHub](https://github.com/chatwoot/chatwoot)
- [Shadcn-ui Components](https://ui.shadcn.com/)
- [React Query Docs](https://tanstack.com/query/latest)

## License

See LICENSE file for details.
