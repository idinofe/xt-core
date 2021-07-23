# web端indexedDB数据存取

## 单例模式生成database对象

> 采用[Dexie.js](https://github.com/dfahlander/Dexie.js)进行indexedDB数据库CURD

#### 数据库设计

1. 操作日志表
2. 预设配置表
3. 结果记录表

操作日志表

| 字段 | ++id   | type   | action | content  | createdAt | updatedAt | delFlag  |
| ---- | ------ | ------ | ------ | -------- | --------- | --------- | -------- |
| 说明 | 自增ID | 时间戳 | 分类   | 动作类别 | 日志内容  | 创建时间  | 更新时间 | 删除标记 |

预设配置表（拆分子表）

| 字段 | ++id   | appName  | appId  | merNo    | merName  | wxAppid   | wxComponentId | createdAt | updatedAt | delFlag  |
| ---- | ------ | -------- | ------ | -------- | -------- | --------- | ------------- | --------- | --------- | -------- |
| 说明 | 自增ID | 应用名称 | 应用ID | 商户编号 | 商户名称 | 微信APPID | 微信三方ID    | 创建时间  | 更新时间  | 删除标记 |

结果记录表

| 字段 | ++id   | type | source   | result   | createdAt | updateAt | delFlag  |
| ---- | ------ | ---- | -------- | -------- | --------- | -------- | -------- |
| 说明 | 自增ID | 分类 | 原始参数 | 处理结果 | 创建时间  | 更新时间 | 删除标记 |


## 初始化

```ts
import Storage from '@dinofe/xt-core/storage'
const storage = new Storage({
  name: 'demo_database',
  version: 1,
  tables: {
    log: '++id,timestamp,content,createdAt'
  }
})
```

## 清理数据

```ts
storage.clean()
```

## 重置数据库  废弃

```ts
storage.reset(storage.log) // 重置操作日志表
```

## 操作日志CURD

```ts
storage.log.add({
  // ...
})
storage.log.remove({
  id: 1
})
storage.log.update({
  id: 1,
  // ...
})
storage.log.list({
  page: 0,
  size: 10
})
```

## 预设配置CURD

```ts
storage.config.add({
  appName: '',
  // ..
})
storage.config.remove({
  id: 1
})
storage.config.update({
  id: 1,
  appName: ''
})
storage.config.list({
  page: 0,
  size: 0
})
```

## 结果记录CURD

```ts
storage.result.add({
  timestamp: Date.now(),
  // ..
})
storage.result.remove({
  id: 1
})
storage.result.update({
  id: 1,
  appName: ''
})
storage.result.list({
  page: 0,
  size: 0
})
```
