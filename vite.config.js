import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { reactPlugins } from './vite.react.ts';

export default defineConfig({
  plugins: reactPlugins,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
  },
});
