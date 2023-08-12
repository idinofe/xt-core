# xt-core

业务中常用工具方法的核心库，包括：微信网页授权链接构建、dexie 数据库操作等。

![npm (scoped)](https://img.shields.io/npm/v/%40dinofe/xt-core)
![npm](https://img.shields.io/npm/dm/%40dinofe/xt-core)
![GitHub contributors](https://img.shields.io/github/contributors/idinotes/xt-core)

## 安装

```bash
npm i -S @dinofe/xt-core
```

## 使用

es6

```js
import { genOAuthUrl } from '@dinofe/xt-core'

const wechatOptions = {
  wx_appid: '123456',
  wx_component_appid: '1123456',
  wx_scope: 'snsapi_base',
  redirect_url: 'https://www.baidu.com',
  state: '0'
}
const url = genOAuthUrl(wechatOptions)
```

es5

```js
const { genOAuthUrl } = require('@dinofe/xt-core')

const wechatOptions = {
  wx_appid: '123456',
  wx_component_appid: '1123456',
  wx_scope: 'snsapi_base',
  redirect_url: 'https://www.baidu.com',
  state: '0'
}
const url = genOAuthUrl(wechatOptions)
```

## 特性

### 微信网页授权链接处理

微信网页授权过程中需要按照微信文档要求生成一个授权跳转的 URL 链接，形如：`https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx520c15f417810387&redirect_uri=https%3A%2F%2Fchong.qq.com%2Fphp%2Findex.php%3Fd%3D%26c%3DwxAdapter%26m%3DmobileDeal%26showwxpaytitle%3D1%26vb2ctag%3D4_2030_5_1194_60&response_type=code&scope=snsapi_base&state=123#wechat_redirect`

将这个参数拼接的过程进行了封装，同时可以对封装好的授权链接进行解析得出原始参数。

微信网页授权官方资料请参考：https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html。

#### 方法列表

1. 根据 appid、scope、redirectUrl 等参数构建构建跳转链接

```js
import { genOAuthUrl } from '@dinofe/xt-core'

const wechatOptions = {
  wx_appid: '123456',
  wx_component_appid: '1123456',
  wx_scope: 'snsapi_base',
  redirect_url: 'https://www.baidu.com',
  state: '0'
}
const url = genOAuthUrl(wechatOptions)
```

2. 从拼接好的 oAuth 认证中方向解析参数

```js
import { decodeOAuthUrl } from '@dinofe/xt-core'

const wechatOptions = decodeOAuthUrl(url) // wechatOptions是个对象
```

## 开源协议

[MIT License](./LICENSE)