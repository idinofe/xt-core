import http from 'http'
import fs from 'fs'
import path from 'path'
import { createHttp, EncryptVersion } from './http'
import { getFreePort } from '../test/port'
import { createApp, startServer } from '../test/service'

// 创建一个本地的接口服务，用于真实的接口逻辑测试
let port: number
let baseURL: string
let app: any = null
let server: any = null

const appKey1 = '3fccc522c79b4bd0848e6a86fec365a7'

beforeAll(async () => {
  port = await getFreePort() as number
  app = await createApp()
  server = await startServer(port, app)
  baseURL = `http://127.0.0.1:${port}`
  // server = await createServer(port, MOCK1)
  console.log('server created at ', baseURL)
})

afterAll(() => {
  return new Promise((resolve) => {
    (server as any).close(() => {
      resolve()
    })
  })
})

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

  it('normal data with returnCode = SUCCESS data is number, noStatusTransform', () => {

    const onFail = vi.fn()
    const onInvalidToken = vi.fn()
    onFail.mockImplementation((msg) => msg)

    afterAll(() => {
      vi.clearAllMocks()
    })

    const http = createHttp({ baseURL, onFail, onInvalidToken, noStatusTransform: true })
    return http.post('/number/success').then(response => {
      // console.log(response)
      expect(response.ok).toEqual(true)
      expect(onFail).not.toHaveBeenCalled()
      expect(onInvalidToken).not.toHaveBeenCalled()
      expect(response.success).toBeUndefined()
      expect(response.code).toBeUndefined()
      expect(response.msg).toBeUndefined()
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

  it('normal data with returnCode = SUCCESS data is json, noStatusTransform', () => {

    const onFail = vi.fn()
    const onInvalidToken = vi.fn()
    onFail.mockImplementation((msg) => msg)

    afterAll(() => {
      vi.clearAllMocks()
    })

    const http = createHttp({ baseURL, onFail, onInvalidToken, noStatusTransform: true })
    return http.post('/json/success').then(response => {
      // console.log(response)
      expect(response.ok).toEqual(true)
      expect(onFail).not.toHaveBeenCalled()
      expect(onInvalidToken).not.toHaveBeenCalled()
      expect(response.success).toBeUndefined()
      expect(response.code).toBeUndefined()
      expect(response.msg).toBeUndefined()
      expect(response.data).toStrictEqual({ returnCode: 'SUCCESS', returnDes: '', data: { foo: 'bar' } })
    })
  })

  it('upload with returnCode = SUCCESS data is json', () => {
    const http = createHttp({ baseURL })
    const file = fs.createReadStream(path.resolve(__dirname, '../test/koa/file01.txt'))
    http.setHeader('Content-Type', 'multipart/form-data')
    
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

  it('upload with returnCode = SUCCESS data is json, noStatusTransform', () => {

    const onFail = vi.fn()
    const onInvalidToken = vi.fn()
    onFail.mockImplementation((msg) => msg)

    afterAll(() => {
      vi.clearAllMocks()
    })

    const http = createHttp({ baseURL, onFail, onInvalidToken, noStatusTransform: true })
    const file = fs.createReadStream(path.resolve(__dirname, '../test/koa/file01.txt'))
    http.setHeader('Content-Type', 'multipart/form-data')
    
    return http.post('/file/upload/success', { file }).then(response => {
      expect(response.ok).toEqual(true)
      expect(onFail).not.toHaveBeenCalled()
      expect(onInvalidToken).not.toHaveBeenCalled()
      expect(response.success).toBeUndefined()
      expect(response.code).toBeUndefined()
      expect(response.msg).toBeUndefined()
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

  it('normal data with returnCode = FAIL data is null onFail, onInvalidToken', () => {

    const onFail = vi.fn()
    const onInvalidToken = vi.fn()
    onFail.mockImplementation((msg) => msg)

    afterAll(() => {
      vi.clearAllMocks()
    })
    
    const http = createHttp({ baseURL, onFail, onInvalidToken })
    return http.post('/json/fail').then(response => {
      // console.log(response)
      expect(response.success).toEqual(false)
      expect(onFail).toBeCalledTimes(1)
      expect(onFail).toHaveBeenLastCalledWith('参数校验未通过', response)
      expect(onInvalidToken).not.toHaveBeenCalled()
    })
  })

  it('normal data with returnCode = FAIL data is null noFail', () => {
    const onFail = vi.fn()
    const onInvalidToken = vi.fn()
    onFail.mockImplementation((msg) => msg)

    afterAll(() => {
      vi.clearAllMocks()
    })
    
    const http = createHttp({ baseURL, onFail, onInvalidToken, noFail: true })
    return http.post('/json/fail').then(response => {
      // console.log(response)
      expect(response.success).toEqual(false)
      expect(onFail).not.toHaveBeenCalled()
      expect(onInvalidToken).not.toHaveBeenCalled()
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

  it('normal data with returnCode = ERR001 data is null onFail, onInvalidToken', () => {
    const onFail = vi.fn()
    const onInvalidToken = vi.fn()
    onFail.mockImplementation((msg) => msg)

    afterAll(() => {
      vi.clearAllMocks()
    })

    const http = createHttp({ baseURL, onFail, onInvalidToken })
    return http.post('/json/fail/ERR001').then(response => {
      // console.log(response)
      expect(response.success).toEqual(false)
      expect(onFail).toHaveBeenCalledTimes(1)
      expect(onFail).toHaveBeenCalledWith('业务处理失败', response)
      expect(onInvalidToken).not.toHaveBeenCalled()
    })
  })

  it('normal data with returnCode = ERR001 data is null noFail', () => {
    const onFail = vi.fn()
    const onInvalidToken = vi.fn()
    onFail.mockImplementation((msg) => msg)

    afterAll(() => {
      vi.clearAllMocks()
    })

    const http = createHttp({ baseURL, onFail, onInvalidToken, noFail: true })
    return http.post('/json/fail/ERR001').then(response => {
      // console.log(response)
      expect(response.success).toEqual(false)
      expect(onFail).not.toHaveBeenCalled()
      expect(onInvalidToken).not.toHaveBeenCalled()
    })
  })
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
describe('request error', () => {
  it('response status 404', () => {
    const http = createHttp({ baseURL })
    return http.get('/number/404').then(response => {
      // console.log(response)
      expect(response.status).toEqual(404)
      expect(response.data).toEqual('Not Found')
      expect(response.success).toEqual(false)
      expect(response.code).toBeUndefined()
      expect(response.msg).toBeUndefined()
    })
  })

  it('response status 500', () => {
    const http = createHttp({ baseURL })
    return http.get('/number/500').then(response => {
      // console.log(response)
      expect(response.status).toEqual(500)
      expect(response.data).toEqual('Internal Server Error')
      expect(response.success).toEqual(false)
      expect(response.code).toBeUndefined()
      expect(response.msg).toBeUndefined()
    })
  })
})

// 加密解密成功
describe('encrypt/decrypt success', () => {
  it('normal data with returnCode = SUCCESS data is json encryptVersion = v2', () => {
    const http = createHttp({
      baseURL,
      useEncrypt: true,
      encryptVersion: EncryptVersion.v2,
      useSign: true,
      appKey: appKey1,
    })
    return http.post('/encrypt/v2/success/json/', { id: '131131' }).then(response => {
      console.log(response)
      expect(response.ok).toEqual(true)
      expect(response.status).toEqual(200)
      expect(response.success).toEqual(true)
      expect(response.code).toEqual('SUCCESS')
      expect(response.msg).toEqual('')
      expect(response.data).toStrictEqual(({ returnCode: 'SUCCESS', returnDes: '', body: { foo: 'bar' } }))
    })
  })
})
