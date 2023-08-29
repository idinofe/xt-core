<div align="center">
业务中常用工具方法的核心库，包括：微信网页授权链接构建、dexie 数据库操作等。

![npm (scoped)](https://img.shields.io/npm/v/%40dinofe/xt-core)
![npm](https://img.shields.io/npm/dm/%40dinofe/xt-core)
![GitHub contributors](https://img.shields.io/github/contributors/idinotes/xt-core)
</div>

## 🚀 特性

- 🎪[在线文档和 demo](https://idinofe.github.io/xt-core/)
- 🌎无编译器场景：可直接使用 CDN 版本
- 🦾类型支持良好：使用 [TypeScript](https://www.typescriptlang.org/)，[TS Docs](https://github.com/microsoft/tsdoc) 编写
- ⚡摇树优化：通过按需引入不同模块减少打包体积

## 📦 安装

```bash
npm i @dinofe/xt-core
```

### CDN

```html
<script src="https://unpkg.com/@dinofe/xt-core@next/dist/umd/xt-core.min.js"></script>
```

引入此脚本之后，所有 API 都会挂载到 `widnow.XtCore` 上。

## 🦄 使用

```js
import { genOAuthUrl } from '@dinofe/xt-core/wechat'

const wechatOptions = {
  wx_appid: '123456',
  wx_component_appid: '1123456',
  wx_scope: 'snsapi_base',
  redirect_url: 'https://www.github.com',
  state: '0'
}
const url = genOAuthUrl(wechatOptions)
console.log(url)
```

支持的方法列表请查看 [API 文档](https://idinofe.github.io/xt-core/api/xt-core.html#functions)

## 🧱 参与贡献

### 脚本命令

<details>
  <summary>相关脚本命令</summary>

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

3. 发布测试包（预发布）

  ```bash
  npm run releaseit
  ```

  需要先切换到npm官方源、并登录账号
</details>

<details>
  <summary>使用预览版</summary>
  
  预览版使用 `next` tag 发布，安装命令如下：

  ```bash
  npm i @dinofe/xt-core@next
  ```
</details>

## 📄 开源协议

[MIT License](./LICENSE)