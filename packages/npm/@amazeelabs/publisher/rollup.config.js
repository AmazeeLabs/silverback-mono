import esbuild from 'rollup-plugin-esbuild';

export default {
  input: `src/server.ts`,
  output: {
    file: `build/server.js`,
    format: 'cjs',
  },
  plugins: [esbuild()],
};
