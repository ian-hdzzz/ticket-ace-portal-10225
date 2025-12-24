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

3. **Start development server** (No `.env` file needed for demo mode!)
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:8080` (or the port shown in the terminal)

**Note:** The application runs in **demo mode** by default with mock data. No configuration is required! See [Application Modes](#application-modes) section for production setup.

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

## Application Modes

The application supports two modes: **Demo** and **Production**.

### Demo Mode (Default)

Demo mode uses hardcoded mock data and requires **no configuration or `.env` file**. Perfect for development and demonstrations.

**To use Demo Mode:**
1. **No setup required!** Just run `npm run dev`
2. The application automatically defaults to demo mode
3. All data is stored in-memory and resets on page refresh
4. Works out of the box without any environment variables

### Production Mode

Production mode connects to a Supabase backend for persistent data storage.

**To use Production Mode:**
1. Set `VITE_APP_MODE=production` in your `.env` file
2. Configure Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. Set up your Supabase database schema (see [Supabase Setup Guide](./docs/SUPABASE_SETUP.md))

**See [Supabase Setup Guide](./docs/SUPABASE_SETUP.md) for detailed instructions.**

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
# Application Mode: "demo" or "production"
VITE_APP_MODE=demo

# Supabase Configuration (Required for production mode)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Note:** In demo mode, Supabase credentials are not required. The application will use mock data instead.

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

### CORS & Dev Proxy

- If you're calling CEA (aquacis) SOAP endpoints from the browser during development you will hit cross-origin restrictions unless you route requests through the dev proxy or a backend proxy.
- Use the local Vite proxy by setting the SOAP env variables to the proxy paths (default set in `env.example`):
   ```env
   VITE_CEA_SOAP_CONTRACT_URL=/aquacis-cea/services/InterfazGenericaContratacionWS
   VITE_CEA_SOAP_DEBT_URL=/aquacis-cea/services/InterfazGenericaGestionDeudaWS
   ```
- The dev proxy is configured in `vite.config.ts`. If you change proxy settings, restart the dev server to apply changes:
   ```powershell
   npm run dev
   ```
- If the remote CEA server redirects from HTTP to HTTPS, configure the proxy target as HTTPS in `vite.config.ts` to avoid the proxy returning a 3xx redirect to the browser and causing a CORS failure.

#### DNS / `ENOTFOUND` errors when resolving remote hosts

- If you see `getaddrinfo ENOTFOUND` from Vite for a host like `ceaqueretaro-cf-int.aquacis.com`, try the following:
   1. Confirm the hostname is correct for your environment and you have network access (VPN, internal DNS) if required.
   2. If the host should be reachable but isn't, add a temporary hosts file entry (Windows: `%SystemRoot%\\system32\\drivers\\etc\\hosts`) mapping `ceaqueretaro-cf-int.aquacis.com` to the appropriate IP, then restart the dev server.
   3. If the environment uses a different host (e.g., `aquacis-cf-int.ceaqueretaro.gob.mx`), update `vite.config.ts` to point the `/aquacis-com` proxy to the working host instead.
   4. As a fallback, implement a server-side proxy on `server.js` that can reach internal hosts but the browser cannot. Example (simplified) and recommended: the included `server.js` contains a proxy route we can use.

      ```js
       // server.js (Express)
       import axios from 'axios';
      app.post('/api/cea/:proxyName/*', async (req, res) => {
          try {
             const upstreamPath = req.params[0];
            const response = await axios.post('https://ceaqueretaro-cf-int.aquacis.com/Comercial/' + upstreamPath, req.body, {
                headers: { 'Content-Type': 'text/xml;charset=UTF-8' },
             });
             res.status(response.status).send(response.data);
          } catch (err) {
             res.status(500).send(err?.response?.data || err.message);
          }
         });
       ```

##### Using the included Express proxy

- Start the server in a separate terminal:
   ```powershell
   npm run webhook
   ```
- Point your frontend stamps to use the dev proxy path in your `.env` or `env.example` (example):
   ```env
   VITE_CEA_SOAP_READINGS_URL=/api/cea/aquacis-com/services/InterfazOficinaVirtualClientesWS
   VITE_CEA_SOAP_RECEIPT_URL=/api/cea/aquacis-cea/services/InterfazOficinaVirtualClientesWS
   ```
- Restart both the `npm run webhook` and `npm run dev` servers and re-try API calls.

### Parsing SOAP Responses in the UI

- The app returns SOAP envelope responses and, in development, the `ApiTest` page converts XML responses to a readable JSON-like structure for convenience. The parser handles `xsi:nil="true"` values and maps them to `null` in the parsed object so empty fields are explicit.
- If you're creating UI components to consume SOAP responses, use the `xmlToJson` helper in `src/api/cea.ts` — it handles nested objects, repeated arrays, and `xsi:nil` attributes.

## Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Shadcn-ui Components](https://ui.shadcn.com/)
- [React Query Docs](https://tanstack.com/query/latest)
- [Tailwind CSS Docs](https://tailwindcss.com/)

## License

See LICENSE file for details.
