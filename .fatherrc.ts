import { defineConfig } from 'father';

export default defineConfig({
  esm: { input: 'src' },
  cjs: { input: 'src' },
  umd: {
    entry: 'src/index',
    name: 'XtCore',
    externals: {
      // TODO: 暂时把所有依赖都内置打包
      // axios: 'axios'
    }
  },
  prebundle: {
    deps: {}
  },
  sourcemap: true,
});
