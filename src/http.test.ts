import http from 'http'
import fs from 'fs'
import path from 'path'
import { createHttp } from './http'
import { getFreePort } from '../test/port'
// import createServer from '../test/server'
import { createApp } from '../test/service'

import axios from 'axios'

const port = 3000
const baseURL = `http://127.0.0.1:${port}`

const startServer = (port: number, app: any) => {
  return new Promise((resolve) => {
    const server = http.createServer(app.callback())
    server.listen(port, 'localhost', () => {
      resolve(server)
    })
  })
}

// TODO: 创建一个本地的接口服务，用于真实的接口逻辑测试
// const MOCK1 = { returnCode: 'SUCCESS', returnDes: 'ok', data: { a: { b: [1, 2, 3] } } }
// let port: any = null
// let app: any = null
// let server: any = null
// beforeAll(async () => {
//   port = await getFreePort()
//   app = await createApp(port, MOCK1)
//   server = await startServer(port, app)
//   // server = await createServer(port, MOCK1)
//   console.log('server created at port ', port)
// })

// afterAll(() => {
//   return new Promise((resolve) => {
//     (server as any).close(() => {
//       resolve()
//     })
//   })
// })

// 配置
describe('check config', () => {
  const baseURL = 'https://example.com'
  it('baseURL is correct', () => {
    const http = createHttp({
      baseURL
    })
    expect(http.getBaseURL()).toEqual(baseURL)
  })
  
  it('should have 3 internal responseTransform', () => {
    const http = createHttp({ baseURL })
    expect(http.responseTransforms.length).toEqual(3)
  })

  it('should have 2 internal responseTransform noFail=true', () => {
    const http = createHttp({ baseURL, noFail: true })
    expect(http.responseTransforms.length).toEqual(2)
  })

  it('should have 1 internal responseTransform noFail=true, noStatusTransform=true', () => {
    const http = createHttp({ baseURL, noFail: true, noStatusTransform: true })
    expect(http.responseTransforms.length).toEqual(1)
  })
})

//成功请求
describe('response success', () => {
  it('empty data with status 200', () => {
    const http = createHttp({ baseURL })
    return http.post('/number/200').then(response => {
      // console.log(response)
      expect(response.ok).toEqual(true)
      expect(response.status).toEqual(200)
      expect(response.success).toEqual(false)
      expect(response.code).toEqual(undefined)
      expect(response.msg).toEqual(undefined)
      expect(response.data).toStrictEqual({})
    })
  })

  it('normal data with returnCode = SUCCESS data is number', () => {
    const http = createHttp({ baseURL })
    return http.post('/number/success').then(response => {
      // console.log(response)
      expect(response.ok).toEqual(true)
      expect(response.status).toEqual(200)
      expect(response.success).toEqual(true)
      expect(response.code).toEqual('SUCCESS')
      expect(response.msg).toEqual('')
      expect(response.data).toStrictEqual({ returnCode: 'SUCCESS', returnDes: '', data: 123 })
    })
  })

  it('normal data with returnCode = SUCCESS data is json', () => {
    const http = createHttp({ baseURL })
    return http.post('/json/success').then(response => {
      // console.log(response)
      expect(response.ok).toEqual(true)
      expect(response.status).toEqual(200)
      expect(response.success).toEqual(true)
      expect(response.code).toEqual('SUCCESS')
      expect(response.msg).toEqual('')
      expect(response.data).toStrictEqual({ returnCode: 'SUCCESS', returnDes: '', data: { foo: 'bar' } })
    })
  })

  it('upload with returnCode = SUCCESS data is json', () => {
    const http = createHttp({ baseURL })
    const file = fs.createReadStream(path.resolve(__dirname, '../test/koa/file01.txt'))
    http.setHeader('Content-Type', 'multipart/form-data')

    // afterAll(() => {
    //   console.log(http.axiosInstance)
    // })
    
    return http.post('/file/upload/success', { file }).then(response => {
      expect(response.ok).toEqual(true)
      expect(response.status).toEqual(200)
      expect(response.success).toEqual(true)
      expect(response.code).toEqual('SUCCESS')
      expect(response.msg).toEqual('')
      expect((response.data as any).returnCode).toEqual('SUCCESS')
      expect((response.data as any).returnDes).toEqual('')
      expect((response.data as any).data).not.toBeUndefined()
    })
  })
})

// 业务处理失败
describe('response fail', () => {
  it('normal data with returnCode = FAIL data is null', () => {
    const http = createHttp({ baseURL })
    return http.post('/json/fail').then(response => {
      // console.log(response)
      expect(response.ok).toEqual(true)
      expect(response.status).toEqual(200)
      expect(response.success).toEqual(false)
      expect(response.code).toEqual('FAIL')
      expect(response.msg).toEqual('参数校验未通过')
      expect(response.data).toStrictEqual({ returnCode: 'FAIL', returnDes: '参数校验未通过', data: null })
    })
  })

  it('normal data with returnCode = ERR001 data is null', () => {
    const http = createHttp({ baseURL })
    return http.post('/json/fail/ERR001').then(response => {
      // console.log(response)
      expect(response.ok).toEqual(true)
      expect(response.status).toEqual(200)
      expect(response.success).toEqual(false)
      expect(response.code).toEqual('ERR001')
      expect(response.msg).toEqual('业务处理失败')
      expect(response.data).toStrictEqual({ returnCode: 'ERR001', returnDes: '业务处理失败', data: null })
    })
  })

  // it('normal data with returnCode = INVALID_TOKEN data is null', () => {

  // })
})

// 无效 token 拦截
describe('token intercept', () => {
  it('normal data with returnCode = INVALID_TOKEN data is null', () => {
    const http = createHttp({ baseURL })
    return http.post('/json/fail/INVALID_TOKEN').then(response => {
      expect(response.ok).toEqual(true)
      expect(response.status).toEqual(200)
      expect(response.success).toEqual(false)
      expect(response.code).toEqual('INVALID_TOKEN')
      expect(response.msg).toEqual('登录信息已失效')
      expect(response.data).toStrictEqual({ returnCode: 'INVALID_TOKEN', returnDes: '登录信息已失效', data: null })
    })
  })

  it('normal data with returnCode = INVALID_TOKEN data is null, onInvalidToken hook workd', () => {

    afterAll(() => {
      vi.clearAllMocks()
    })

    const onInvalidToken = vi.fn()
    const http = createHttp({ baseURL, onInvalidToken })
    return http.post('/json/fail/INVALID_TOKEN').then(response => {
      expect(response.ok).toEqual(true)
      expect(response.status).toEqual(200)
      expect(response.success).toEqual(false)
      expect(response.code).toEqual('INVALID_TOKEN')
      expect(response.msg).toEqual('登录信息已失效')
      expect(response.data).toStrictEqual({ returnCode: 'INVALID_TOKEN', returnDes: '登录信息已失效', data: null })
      expect(onInvalidToken).toBeCalledTimes(1)
      // expect(isInvalidToken).toBeCalledWith()
    })
  })

  it('normal data with returnCode = INVALID_TOKEN data is null, isInvalidToken hook workd', () => {

    afterAll(() => {
      vi.clearAllMocks()
    })
    
    const isInvalidToken = vi.fn()
    isInvalidToken.mockImplementation(() => {
      return true
    })
    const http = createHttp({ baseURL, isInvalidToken })
    return http.post('/json/fail/INVALID_TOKEN').then(response => {
      expect(response.ok).toEqual(true)
      expect(response.status).toEqual(200)
      expect(response.success).toEqual(false)
      expect(response.code).toEqual('INVALID_TOKEN')
      expect(response.msg).toEqual('登录信息已失效')
      expect(response.data).toStrictEqual({ returnCode: 'INVALID_TOKEN', returnDes: '登录信息已失效', data: null })
      expect(isInvalidToken).toBeCalledTimes(1)
      // expect(isInvalidToken).toBeCalledWith()
    })
  })

  it('normal data with returnCode = INVALID_TOKEN data is null, isInvalidToken hook workd', () => {

    afterAll(() => {
      vi.clearAllMocks()
    })
    
    const isInvalidToken = vi.fn()
    const onInvalidToken = vi.fn()
    isInvalidToken.mockImplementation(() => {
      return false
    })
    const http = createHttp({ baseURL, isInvalidToken, onInvalidToken })
    return http.post('/json/fail/INVALID_TOKEN').then(response => {
      expect(response.ok).toEqual(true)
      expect(response.status).toEqual(200)
      expect(response.success).toEqual(false)
      expect(response.code).toEqual('INVALID_TOKEN')
      expect(response.msg).toEqual('登录信息已失效')
      expect(response.data).toStrictEqual({ returnCode: 'INVALID_TOKEN', returnDes: '登录信息已失效', data: null })
      expect(isInvalidToken).toBeCalledTimes(1)
      expect(onInvalidToken).not.toBeCalled()
      // expect(isInvalidToken).toBeCalledWith()
    })
  })
})

// 接口异常
