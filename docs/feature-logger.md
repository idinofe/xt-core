# 日记记录功能封装

记录用户的操作、功能调用，可以配置日志存储层，配置日志记录级别

## 上报日志

```ts
enum LogType = {
  info = 'info'
  warn = 'warn'
  error = 'error'
  debug = 'debug'
}

import log, { errorCatch } from '@dinofe/xt-core/logger'

// 手动上报
log({
  type: LogType.info,
  action: 'genRedirectUrl',
  content: {
    merNo: '1234',
    appId: '123456',
    url: 'https://www.example.com'
  }
})

log.info({
  action: 'genRedirectUrl',
  content: {
    merNo: '1234',
    appId: '123456',
    url: 'https://www.example.com'
  }
})

log.warn({
  action: 'genRedirectUrl',
  content: {
    merNo: '1234',
    appId: '123456',
    url: 'https://www.example.com'
  }
})

log.error({
  action: 'genRedirectUrl',
  content: new Error('there is an error') // error类型内容为Error对象
})

log.debug({
  action: 'genRedirectUrl',
  content: {
    merNo: '1234',
    appId: '123456',
    url: 'https://www.example.com'
  }
})

// 捕获函数错误并上报
const fn = () => {
  setTimeout(() => {
    throw new Error('an error happened')
  }, 1000)
}
const handledFn = errorCatch(fn)

```
