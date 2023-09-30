# 参与贡献

1. 启动项目

  ```bash
  npm run vitest
  ```

  或者

  ```bash
  npm run vitest:ui
  ```

2. 构建打包

  ```bash
  npm run build
  ```

3. 预览文档

  编译项目，生成类型声明

  ```bash
  npm run docs:build
  ```

  启动文档本地预览

  ```bash
  cd ./tsdoc
  npm run docs:dev
  ```

  ::: warning 提示
  如果源码有变更需要手动重新执行 `npm run docs:build`
  :::

4. 发布测试包（预发布）

  ```bash
  npm run releaseit
  ```
  ::: warning 提示
  需要先切换到npm官方源、并登录账号
  :::
