# 使用指南

## 安装

```bash
npm i @dinofe/xt-core
```

## 使用

### 1.直接引入需要的方法

> 所有支持的方法请查看 [API 列表](../api/xt-core)

```js
import { isDef, isString } from '@dinofe/xt-core'
const name = 'foo'
console.log(isDef(name), isString(name))
```

### 2.分模块引入需要的方法

这引入方法可以让编译工具有效地进行[摇树优化](https://webpack.js.org/guides/tree-shaking/)，以减少此包最终打包输出占用的体积。

::: warning 提示
此方法需要你的编译工具支持[**条件导入**](https://nodejs.org/api/packages.html)，webpack、rollup、esbuild、vite、Node.js 等对条件导入的支持情况不尽相同，请查看各自文档。
:::

```js {1}
import { isDef, isString } from '@dinofe/xt-core/common'
const name = 'foo'
console.log(isDef(name), isString(name))
```

[example](https://github.com/idinofe/xt-core/tree/master/example) 目录中有不同项目架子的引入写法，可以对比查看你的项目是否也支持[**分模块引入需要的方法**](#2分模块引入需要的方法)，如有不清楚的地方，欢迎[提交 issue](https://github.com/idinofe/xt-core/issues/new/choose) 讨论。

### 3.CDN引入

将下面 script 标签插入到 HTML 页面。

```html
<script src="https://unpkg.com/@dinofe/xt-core@latest/dist/umd/xt-core.min.js"></script>
```

> 替换 `latest` 为对应的版本号或者 `next` 可引入不同版本

之后[所有导出的 API](../api/xt-core) 都挂载到 `window.XtCore` 上。

```js
window.XtCore.isDef('aaa')
```

::: warning 提示
这种方式将依赖的第三方包都内置到了 UMD 模块中，像 `axios` 这些无需再通过 script 引入，不过有些第三方包在重复引入时会有问题，请谨慎使用此模式。
:::

## 参与贡献

对于包的使用者可以忽略这一步骤，对于本项目的开发者，请查看 [参与贡献](./contribute.md)。
