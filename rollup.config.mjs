import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: {
    file: 'output/hellfire.min.js',
    format: 'cjs',
  },
  plugins: [typescript(), terser()],
};
