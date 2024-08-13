import type { UserConfig } from 'vite';

export default {
  ssr: {
    external: ['sharp', 'image-dimensions'],
  },
  optimizeDeps: {
    exclude: ['sharp', 'image-dimensions'],
  },
} satisfies UserConfig;
