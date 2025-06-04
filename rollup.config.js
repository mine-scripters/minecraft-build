const ts = require('@rollup/plugin-typescript');
const nodeResolve = require('@rollup/plugin-node-resolve');

module.exports = [
  {
    input: 'src/index.ts',
    external: ['@minecraft/core-build-tasks', 'just-task'],
    output: [
      {
        file: 'dist/lib-cjs/MinecraftBuild.js',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'dist/lib/MinecraftBuild.js',
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins: [ts(), nodeResolve()],
  },
];
