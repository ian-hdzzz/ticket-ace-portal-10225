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
      // Proxy para API general (notificaciones, etc) - IMPORTANTE para que funcione
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      // Proxy para autenticación
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
        // Use HTTPS target to avoid server redirect from HTTP -> HTTPS which leads
        // the dev proxy to return a 3xx redirect to the browser and trigger CORS.
        // We set `secure: false` because the cert on the remote staging server
        // may not be trusted in local dev env.
        target: 'https://aquacis-cf-int.ceaqueretaro.gob.mx/Comercial',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/aquacis-cea/, ''),
        // Ensure that if the upstream sends redirects with absolute Location headers,
        // we rewrite them back to the dev/proxy URL so the browser follows the proxy
        // instead of attempting to call the remote host directly.
        onProxyRes(proxyRes, req, res) {
          const location = proxyRes.headers && proxyRes.headers.location;
          if (location && typeof location === 'string') {
            // Rewrite the upstream URL to the local proxy path
            proxyRes.headers.location = location.replace(
              'https://aquacis-cf-int.ceaqueretaro.gob.mx/Comercial',
              'http://localhost:8080/aquacis-cea'
            );
          }
        }
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
