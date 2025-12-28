import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // ============================================
      // CHATWOOT REVERSE PROXY (for local development)
      // ============================================
      // These MUST come before /api and /auth to avoid conflicts
      // Chatwoot assets
      '/vite/assets': {
        target: 'https://chatwoot-cea-w2yvjfitdq-uc.a.run.app',
        changeOrigin: true,
        secure: false,
      },
      '/packs': {
        target: 'https://chatwoot-cea-w2yvjfitdq-uc.a.run.app',
        changeOrigin: true,
        secure: false,
      },
      // Chatwoot app routes
      '/app': {
        target: 'https://chatwoot-cea-w2yvjfitdq-uc.a.run.app',
        changeOrigin: true,
        secure: false,
        ws: true,
        cookieDomainRewrite: {
          'chatwoot-cea-w2yvjfitdq-uc.a.run.app': 'localhost',
        },
      },
      // Chatwoot auth (for sign_in, etc) - uses different path patterns than local /auth
      '/auth/sign_in': {
        target: 'https://chatwoot-cea-w2yvjfitdq-uc.a.run.app',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: {
          'chatwoot-cea-w2yvjfitdq-uc.a.run.app': 'localhost',
        },
      },
      '/auth/sign_out': {
        target: 'https://chatwoot-cea-w2yvjfitdq-uc.a.run.app',
        changeOrigin: true,
        secure: false,
      },
      '/auth/password': {
        target: 'https://chatwoot-cea-w2yvjfitdq-uc.a.run.app',
        changeOrigin: true,
        secure: false,
      },
      '/auth/validate_token': {
        target: 'https://chatwoot-cea-w2yvjfitdq-uc.a.run.app',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: {
          'chatwoot-cea-w2yvjfitdq-uc.a.run.app': 'localhost',
        },
      },
      // Chatwoot API v1/v2/v3
      '/api/v1': {
        target: 'https://chatwoot-cea-w2yvjfitdq-uc.a.run.app',
        changeOrigin: true,
        secure: false,
        ws: true,
        cookieDomainRewrite: {
          'chatwoot-cea-w2yvjfitdq-uc.a.run.app': 'localhost',
        },
      },
      '/api/v2': {
        target: 'https://chatwoot-cea-w2yvjfitdq-uc.a.run.app',
        changeOrigin: true,
        secure: false,
      },
      '/api/v3': {
        target: 'https://chatwoot-cea-w2yvjfitdq-uc.a.run.app',
        changeOrigin: true,
        secure: false,
      },
      // Chatwoot cable (websockets)
      '/cable': {
        target: 'https://chatwoot-cea-w2yvjfitdq-uc.a.run.app',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      // Chatwoot additional routes
      '/rails': {
        target: 'https://chatwoot-cea-w2yvjfitdq-uc.a.run.app',
        changeOrigin: true,
        secure: false,
      },
      '/super_admin': {
        target: 'https://chatwoot-cea-w2yvjfitdq-uc.a.run.app',
        changeOrigin: true,
        secure: false,
      },
      // Optional /chatwoot prefix entry point
      '/chatwoot': {
        target: 'https://chatwoot-cea-w2yvjfitdq-uc.a.run.app',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/chatwoot/, ''),
        ws: true,
        cookieDomainRewrite: {
          'chatwoot-cea-w2yvjfitdq-uc.a.run.app': 'localhost',
        },
      },
      // ============================================
      // LOCAL APP PROXIES
      // ============================================
      // Local backend API (for your app's endpoints)
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      // Local backend auth (for your app's auth)
      '/auth': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      '/ceadevws': {
        target: 'https://appcea.ceaqueretaro.gob.mx',
        changeOrigin: true,
        secure: false,
      },
      '/aquacis-cea': {
        target: 'https://aquacis-cf-int.ceaqueretaro.gob.mx/Comercial',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/aquacis-cea/, ''),
      },
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
