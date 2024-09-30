import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        info: path.resolve(__dirname, 'index.html'),
        status: path.resolve(__dirname, 'status.html'),
      },
    },
  },
  plugins: [react()],
});
