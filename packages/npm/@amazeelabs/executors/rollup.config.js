import { defineConfig } from 'rollup';
import dts from 'rollup-plugin-dts';

export default defineConfig({
  input: 'build/dts/index.d.ts',
  output: [{ file: 'build/index.d.ts', format: 'es' }],
  plugins: [dts()],
});
