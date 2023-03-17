import { nodeResolve } from '@rollup/plugin-node-resolve';
import { defineConfig } from 'rollup';
import esbuild from 'rollup-plugin-esbuild';

export default defineConfig([
  {
    input: 'src/gatsby-node.ts',
    output: {
      file: 'gatsby-node.js',
      format: 'cjs',
      inlineDynamicImports: true,
      // Respect TypeScript's behavior.
      interop: 'auto',
    },
    plugins: [
      nodeResolve({
        // Bundle all ES modules so everything works in CommonJS environments.
        modulesOnly: true,
      }),
      esbuild(),
    ],
  },
  {
    input: 'src/templates/stub.tsx',
    output: {
      file: 'templates/stub.js',
    },
    plugins: [esbuild()],
  },
]);
