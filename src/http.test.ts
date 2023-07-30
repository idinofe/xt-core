import http from 'http'
import fs from 'fs'
import path from 'path'
import { createHttp, createUploadHttp, EncryptVersion } from './http'
import { getFreePort } from '../test/port'
import { createApp, startServer } from '../test/service'
import { AppConfig } from './type'
import { MIME_TYPE } from './web'

// 创建一个本地的接口服务，用于真实的接口逻辑测试
let port: number
let baseURL: string
let app: any = null
let server: any = null

const appKey1 = '3fccc522c79b4bd0848e6a86fec365a7'
const log = (...args: any[]) => console.log('[http.test] ', ...args)

// TODO: 启动 mock server 移动到单独的模块
beforeAll(async () => {
  port = await getFreePort() as number
  app = await createApp()
  server = await startServer(port, app)
  baseURL = `http://127.0.0.1:${port}`
  // server = await createServer(port, MOCK1)
  log('server created at ', baseURL)
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
  afterEach(() => {
    vi.clearAllMocks()
  })

  const baseURL = 'https://example.com'
  it('baseURL is correct', () => {
    const http = createHttp({
      baseURL
    })
    expect(http.getBaseURL()).toEqual(baseURL)
  })

  it('commonParams worked', () => {
    const commonParams = {
      msgId: "202306071636235632966",
      deviceId: "app_123",
      authorization: null,
      appId: "123",
      merNoNo: "125"
    }
    const getCommonParams = vi.fn()
    getCommonParams.mockImplementation(() => commonParams)

    const http = createHttp({
      baseURL,
      commonParams: getCommonParams
    })
    return http.post('/number/200').then(response => {
      expect(getCommonParams).toBeCalledTimes(1)
      expect(response.config?.commonParams).toStrictEqual(getCommonParams)
      expect(response.config?.data).toStrictEqual(JSON.stringify(commonParams))
    })
  })

  it('commonParams worked with data', () => {
    const commonParams = {
      msgId: "202306071636235632966",
      deviceId: "app_123",
      authorization: null,
      appId: "123",
      merNoNo: "125"
    }
    const data = {
      id: '13131311'
    }
    const getCommonParams = vi.fn()
    getCommonParams.mockImplementation(() => commonParams)

    const http = createHttp({
      baseURL,
      commonParams: getCommonParams
    })
    return http.post('/number/200', data).then(response => {
      expect(getCommonParams).toBeCalledTimes(1)
      expect(response.config?.commonParams).toStrictEqual(getCommonParams)
      expect(response.config?.data).toStrictEqual(JSON.stringify({ ...commonParams, body: data }))
    })
  })

  it('commonHeaders worked', () => {
    const commonHeaders = {
      msgId: "202306071636235632966",
      deviceId: "app_123",
      authorization: null,
      appId: "123",
      merNoNo: "125"
    }
    const getCommonHeaders = vi.fn()
    getCommonHeaders.mockImplementation(() => commonHeaders)

    const http = createHttp({
      baseURL,
      commonHeaders: getCommonHeaders
    })
    return http.post('/number/200').then(response => {
      // log(response)
      expect(getCommonHeaders).toBeCalledTimes(1)
      expect(response.config?.commonHeaders).toStrictEqual(getCommonHeaders)
      expect(response.config?.headers).toHaveProperty('msgId', '202306071636235632966')
      expect(response.config?.headers).toHaveProperty('deviceId', 'app_123')
      expect(response.config?.headers).toHaveProperty('authorization', null)
      expect(response.config?.headers).toHaveProperty('appId', '123')
      expect(response.config?.headers).toHaveProperty('merNoNo', '125')
    })
  })

  it('commonHeaders worked with setHeader', () => {
    const commonHeaders = {
      msgId: "202306071636235632966",
      deviceId: "app_123",
      authorization: null,
      appId: "123",
      merNoNo: "125"
    }
    const getCommonHeaders = vi.fn()
    getCommonHeaders.mockImplementation(() => commonHeaders)

    const http = createHttp({
      baseURL,
      commonHeaders: getCommonHeaders
    })
    http.setHeader('token', 'tokentoken')
    http.setHeaders({
      header1: 'header1header1',
      header2: 'header2header2',
    })
    return http.post('/number/200').then(response => {
      // log(response)
      expect(getCommonHeaders).toBeCalledTimes(1)
      expect(response.config?.commonHeaders).toStrictEqual(getCommonHeaders)
      expect(response.config?.headers).toHaveProperty('msgId', '202306071636235632966')
      expect(response.config?.headers).toHaveProperty('deviceId', 'app_123')
      expect(response.config?.headers).toHaveProperty('authorization', null)
      expect(response.config?.headers).toHaveProperty('appId', '123')
      expect(response.config?.headers).toHaveProperty('merNoNo', '125')
      expect(response.config?.headers).toHaveProperty('token', 'tokentoken')
      expect(response.config?.headers).toHaveProperty('header1', 'header1header1')
      expect(response.config?.headers).toHaveProperty('header2', 'header2header2')
    })
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
      // log(response)
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
      // log(response)
      expect(response.ok).toEqual(true)
      expect(response.status).toEqual(200)
      expect(response.success).toEqual(true)
      expect(response.code).toEqual('SUCCESS')
      expect(response.msg).toEqual('')
      expect(response.data).toStrictEqual({ returnCode: 'SUCCESS', returnDes: '', body: 123 })
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
      // log(response)
      expect(response.ok).toEqual(true)
      expect(onFail).not.toHaveBeenCalled()
      expect(onInvalidToken).not.toHaveBeenCalled()
      expect(response.success).toBeUndefined()
      expect(response.code).toBeUndefined()
      expect(response.msg).toBeUndefined()
      expect(response.data).toStrictEqual({ returnCode: 'SUCCESS', returnDes: '', body: 123 })
    })
  })

  it('normal data with returnCode = SUCCESS data is json', () => {
    const http = createHttp({ baseURL })
    return http.post('/json/success').then(response => {
      // log(response)
      expect(response.ok).toEqual(true)
      expect(response.status).toEqual(200)
      expect(response.success).toEqual(true)
      expect(response.code).toEqual('SUCCESS')
      expect(response.msg).toEqual('')
      expect(response.data).toStrictEqual({ returnCode: 'SUCCESS', returnDes: '', body: { foo: 'bar' } })
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
      // log(response)
      expect(response.ok).toEqual(true)
      expect(onFail).not.toHaveBeenCalled()
      expect(onInvalidToken).not.toHaveBeenCalled()
      expect(response.success).toBeUndefined()
      expect(response.code).toBeUndefined()
      expect(response.msg).toBeUndefined()
      expect(response.data).toStrictEqual({ returnCode: 'SUCCESS', returnDes: '', body: { foo: 'bar' } })
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
      expect((response.data as any).body).not.toBeUndefined()
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
      expect((response.data as any).body).not.toBeUndefined()
    })
  })
})

// 业务处理失败
describe('response fail', () => {
  it('normal data with returnCode = FAIL data is null', () => {
    const http = createHttp({ baseURL })
    return http.post('/json/fail').then(response => {
      // log(response)
      expect(response.ok).toEqual(true)
      expect(response.status).toEqual(200)
      expect(response.success).toEqual(false)
      expect(response.code).toEqual('FAIL')
      expect(response.msg).toEqual('参数校验未通过')
      expect(response.data).toStrictEqual({ returnCode: 'FAIL', returnDes: '参数校验未通过', body: null })
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
      // log(response)
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
      // log(response)
      expect(response.success).toEqual(false)
      expect(onFail).not.toHaveBeenCalled()
      expect(onInvalidToken).not.toHaveBeenCalled()
    })
  })

  it('normal data with returnCode = ERR001 data is null', () => {
    const http = createHttp({ baseURL })
    return http.post('/json/fail/ERR001').then(response => {
      // log(response)
      expect(response.ok).toEqual(true)
      expect(response.status).toEqual(200)
      expect(response.success).toEqual(false)
      expect(response.code).toEqual('ERR001')
      expect(response.msg).toEqual('业务处理失败')
      expect(response.data).toStrictEqual({ returnCode: 'ERR001', returnDes: '业务处理失败', body: null })
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
      // log(response)
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
      // log(response)
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
      expect(response.data).toStrictEqual({ returnCode: 'INVALID_TOKEN', returnDes: '登录信息已失效', body: null })
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
      expect(response.data).toStrictEqual({ returnCode: 'INVALID_TOKEN', returnDes: '登录信息已失效', body: null })
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
      expect(response.data).toStrictEqual({ returnCode: 'INVALID_TOKEN', returnDes: '登录信息已失效', body: null })
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
      expect(response.data).toStrictEqual({ returnCode: 'INVALID_TOKEN', returnDes: '登录信息已失效', body: null })
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
      // log(response)
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
      // log(response)
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
  it('normal data with returnCode = SUCCESS data is json encryptVersion = v1', () => {
    const http = createHttp({
      baseURL,
      useEncrypt: true,
      useSign: true,
      encryptVersion: EncryptVersion.v1,
      appKey: appKey1,
    })
    return http.post('/encrypt/v1/success/json/', { id: '313141', msgId: 12311111 }).then(response => {
      // log(response)
      expect(response.ok).toEqual(true)
      expect(response.status).toEqual(200)
      expect(response.success).toEqual(true)
      expect(response.code).toEqual('SUCCESS')
      expect(response.msg).toEqual('')
      expect(response.data).toStrictEqual({ foo: 'bar' })
    })
  })
  it('normal data with returnCode = SUCCESS data is json encryptVersion = v2', () => {
    const http = createHttp({
      baseURL,
      useEncrypt: true,
      encryptVersion: EncryptVersion.v2,
      useSign: true,
      appKey: appKey1,
    })
    return http.post('/encrypt/v2/success/json/', { id: '131131' }).then(response => {
      // log(response)
      expect(response.ok).toEqual(true)
      expect(response.status).toEqual(200)
      expect(response.success).toEqual(true)
      expect(response.code).toEqual('SUCCESS')
      expect(response.msg).toEqual('')
      expect(response.data).toStrictEqual({ returnCode: 'SUCCESS', returnDes: '', body: { foo: 'bar' } })
    })
  })
  // 带完整参数的请求
  it ('with complete parameters succees encryptVersion = v1', () => {
    afterEach(() => {
      vi.clearAllMocks()
    })

    const appParams: AppConfig = {
      appId: '1203032031009',
      merNo: '203032031009',
      deviceId: 'htmlid',
      indexDoc: 'xxx_h5',
      domain: 'https://www.example.com/',
      basic: 'xxx-interface',
      basicImgUrl: 'https://www.example.com/static/'
    }
    const getToken = vi.fn()
    const getCommonHeaders = vi.fn()
    const getCommonParams = vi.fn()

    getToken.mockImplementation(() => "tokentoken")
    getCommonHeaders.mockImplementation(() => {
      return {
        appId: appParams.appId,
        merNo: appParams.merNo,
        Authorization: getToken(),
      }
    })
    getCommonParams.mockImplementation(() => {
      return {
        appId: appParams.appId,
        merNoNo: appParams.merNo,
      }
    })

    const http = createHttp({
      baseURL,
      useEncrypt: true,
      useSign: true,
      encryptVersion: EncryptVersion.v1,
      appKey: appKey1,
      commonHeaders: getCommonHeaders,
      commonParams: getCommonParams
    })

    return http.post('/encrypt/v1/success/real/', { id: '713641' }).then(response => {
      expect(getToken).toBeCalledTimes(1)
      expect(getCommonHeaders).toBeCalledTimes(1)
      expect(getCommonParams).toBeCalledTimes(1)
      expect(response.ok).toEqual(true)
      expect(response.status).toEqual(200)
      expect(response.success).toEqual(true)
      expect(response.code).toEqual('SUCCESS')
      expect(response.msg).toEqual('')
      expect(response.data).toHaveProperty('id', '713641')
      expect(response.data).toHaveProperty('appId', appParams.appId)
      expect(response.data).toHaveProperty('merNoNo', appParams.merNo)
      expect(response.data).toHaveProperty('foo', 'bar')
      expect(response.data).toHaveProperty('token', getToken())
      expect(response.data).toStrictEqual({ ...getCommonParams(), ...{ id: '713641' }, ...{ foo: 'bar' }, token: getToken() })
    })
  })

  // 带完整参数的请求
  it ('with complete parameters succees encryptVersion = v2', () => {
    afterEach(() => {
      vi.clearAllMocks()
    })

    const appParams: AppConfig = {
      appId: '1203032031009',
      merNo: '203032031009',
      deviceId: 'htmlid',
      indexDoc: 'xxx_h5',
      domain: 'https://www.example.com/',
      basic: 'xxx-interface',
      basicImgUrl: 'https://www.example.com/static/',
      appKey: appKey1
    }
    const getToken = vi.fn()
    const getCommonHeaders = vi.fn()
    const getCommonParams = vi.fn()

    getToken.mockImplementation(() => "tokentoken")
    getCommonHeaders.mockImplementation(() => {
      return {
        appId: appParams.appId,
        merNo: appParams.merNo,
        Authorization: getToken(),
      }
    })
    getCommonParams.mockImplementation(() => {
      return {
        appId: appParams.appId,
        merNoNo: appParams.merNo,
      }
    })

    const http = createHttp({
      baseURL,
      useEncrypt: true,
      useSign: true,
      encryptVersion: EncryptVersion.v2,
      appKey: appKey1,
      commonHeaders: getCommonHeaders,
      commonParams: getCommonParams
    })

    return http.post('/encrypt/v2/success/real/', { id: '713642' }).then(response => {
      expect(getToken).toBeCalledTimes(1)
      expect(getCommonHeaders).toBeCalledTimes(1)
      expect(getCommonParams).toBeCalledTimes(1)
      expect(response.ok).toEqual(true)
      expect(response.status).toEqual(200)
      expect(response.success).toEqual(true)
      expect(response.code).toEqual('SUCCESS')
      expect(response.msg).toEqual('')
      expect((response.data as any).body).toHaveProperty('body')
      expect((response.data as any).body.body).toHaveProperty('id', '713642')
      expect((response.data as any).body).toHaveProperty('appId', appParams.appId)
      expect((response.data as any).body).toHaveProperty('merNoNo', appParams.merNo)
      expect((response.data as any).body).toHaveProperty('foo', 'bar')
      expect(response.data).toStrictEqual({
        body: { ...getCommonParams(), body: { id: '713642' }, ...{ foo: 'bar' }, token: getToken() },
        returnCode: 'SUCCESS',
        returnDes: '',
      })
    })
  })
})

// 文件上传-createUploadHttp
describe('createUploadHttp success', () => {
  const baseURL = 'https://example.com'
  it('baseURL is correct', () => {
    const http = createUploadHttp({
      appId: 'appId',
      merNo: 'merNo',
      deviceId: 'deviceId'
    }, {
      baseURL,
      appKey: appKey1,
      getToken: function (): string {
        return 'tokentoken'
      }
    })
    expect(http.getBaseURL()).toEqual(baseURL)
  })
  // TODO: 此用例需要在真实的浏览器环境执行
  // it('normal data with returnCode = SUCCESS data is base64', () => {
  //   const http = createUploadHttp({
  //     appId: '3130042001040',
  //     merNo: '130042001040',
  //     deviceId: 'xxx_h5'
  //   }, {
  //     getToken: () => "tokentoken",
  //     baseURL,
  //     appKey: appKey1
  //   })
  //   return http.upload('/file/upload/sign/success', {
  //     data: 'aadadada',
  //     mimeType: MIME_TYPE.JPG,
  //   }).then(response => {
  //     expect(response.ok).toEqual(true)
  //     expect(response.status).toEqual(200)
  //     expect(response.success).toEqual(false)
  //     expect(response.code).toEqual(undefined)
  //     expect(response.msg).toEqual(undefined)
  //     expect(response.data).toStrictEqual({ body: 'no path', returnCode: 'SUCCESS', returnDes: '' })
  //   })
  // })
})
