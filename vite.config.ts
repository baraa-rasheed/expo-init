import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import netlifyReactRouter from "@netlify/vite-plugin-react-router";
import netlify from "@netlify/vite-plugin";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),   tsconfigPaths(), netlifyReactRouter(), netlify()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server:{
    allowedHosts: ['*'],
  }
})
