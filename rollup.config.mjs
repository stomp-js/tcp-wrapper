import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: 'src/index.ts',
    plugins: [typescript()],
    external: ['net', '@stomp/stompjs'],
    output: {
      file: 'bundles/tcp-wrapper.cjs',
      format: 'cjs',
      sourcemap: true,
    },
  },
];
