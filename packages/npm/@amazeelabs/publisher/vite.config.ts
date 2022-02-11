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
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        {
          // Necessary due to wrong export definition in react-virtualized:
          // https://github.com/bvaughn/react-virtualized/issues/1212
          name: 'resolve-fixup',
          setup(build) {
            build.onResolve({ filter: /react-virtualized/ }, async () => {
              return {
                path: path.resolve(
                  '../../../../node_modules/react-virtualized/dist/umd/react-virtualized.js',
                ),
              };
            });
          },
        },
      ],
    },
  },
  plugins: [react()],
});
