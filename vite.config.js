import { defineConfig } from 'vite';

export default defineConfig({
  base: '/PlaneDemo2/', // Set the base URL to match your GitHub repo name
  build: {
    assetsDir: 'assets',
    outDir: 'dist',
  },
  publicDir: 'public',
}); 