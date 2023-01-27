import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';

export default [
  {
    input: 'src/index.ts',
    plugins: [typescript(), nodeResolve()],
    external: ['net'],
    output: {
      file: 'bundles/tcp-wrapper.cjs',
      format: 'cjs',
      sourcemap: true,
    },
  },
];
