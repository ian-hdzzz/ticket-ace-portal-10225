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
      '/ceadevws': {
        target: 'https://appcea.ceaqueretaro.gob.mx',
        changeOrigin: true,
        secure: false,
      },
      '/aquacis-cea': {
        target: 'http://aquacis-cf-int.ceaqueretaro.gob.mx/Comercial',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/aquacis-cea/, ''),
      },
      '/aquacis-com': {
        target: 'https://ceaqueretaro-cf-int.aquacis.com/Comercial',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/aquacis-com/, ''),
      }
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
