import http from 'http'
import fs from 'fs'
import path from 'path'
import { createHttp, createUploadHttp, CustomConfig, defaultCommonHeadersTrasform, defaultCommonParamsTransform, defaultDecryptTransform, defaultEncryptTransform, defaultIsInvalidToken, defaultTokenCheckTransform, EncryptVersion, getCustomConfig, withCustomConfig, XApiResponse } from './http'
import { getFreePort } from '../test/port'
import { createApp, startServer } from '../test/service'
import { AppConfig } from './type'
import { MIME_TYPE } from './web'
import { delay, isFunction, isPromise, isString } from './common'
import { AxiosRequestConfig } from 'axios'
import { decrypt, encrypt } from 'decrypt-core'
import { clone, deepClone } from '@vitest/utils'

// 创建一个本地的接口服务，用于真实的接口逻辑测试
let port: number
let baseURL: string
let app: any = null
let server: any = null

const appKey1 = '3fccc522c79b4bd0848e6a86fec365a7'
const log = (...args: any[]) => console.log('\x1b[32m[http.test]\x1b[0m ', ...args)

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

// 内部方法
describe('internal methods', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('withCustomConfig', () => {
    let transform1 = vi.fn()
    let commonParams1 = vi.fn()
    let commonHeaders1 = vi.fn()
    commonParams1.mockImplementation(() => ({
      appId: '123131'
    }))
    commonHeaders1.mockImplementation(() => ({
      deviceId: '651112'
    }))

    let wrapped1 = withCustomConfig({
      baseURL: '/test',
      noStatusTransform: true,
      noFail: true,
      useEncrypt: true,
      useSign: true,
      encryptVersion: EncryptVersion.v1,
      appKey: appKey1,
      commonParams: commonParams1,
      commonHeaders: commonHeaders1,
    }, transform1)

    expect(isFunction(wrapped1)).toEqual(true)
    wrapped1({})
    expect(transform1).toBeCalledTimes(1)
    expect(transform1).toHaveBeenCalledWith({}, {
      noStatusTransform: true,
      // isInvalidToken: httpConfig.isInvalidToken,
      // onInvalidToken: httpConfig.onInvalidToken,
      noFail: true,
      // onFail: httpConfig.onFail,
      useEncrypt: true,
      useSign: true,
      encryptVersion: EncryptVersion.v1,
      appKey: appKey1,
      commonParams: commonParams1,
      commonHeaders: commonHeaders1,
    })
    wrapped1({ baseURL: '/testest' })
    expect(transform1).toBeCalledTimes(2)
    expect(transform1).toHaveBeenCalledWith({ baseURL: '/testest' }, {
      noStatusTransform: true,
      // isInvalidToken: httpConfig.isInvalidToken,
      // onInvalidToken: httpConfig.onInvalidToken,
      noFail: true,
      // onFail: httpConfig.onFail,
      useEncrypt: true,
      useSign: true,
      encryptVersion: EncryptVersion.v1,
      appKey: appKey1,
      commonParams: commonParams1,
      commonHeaders: commonHeaders1,
    })
  })

  it('defaultEncryptTransform no encrypt', async () => {
    // 不加密
    let request: any = {}
    let customConfig: any = {
      useEncrypt: false
    }
    let promise = defaultEncryptTransform(request, customConfig)
    expect(isPromise(promise)).toEqual(true)

    let res = await promise
    expect(res).toEqual(undefined)
  })

  it('defaultEncryptTransform encryt v1', async () => {
    let request = {
      data: {
        id: '1646131',
        name: 'foo'
      }
    }
    let customConfig = {
      useEncrypt: true,
      useSign: true,
      appKey: appKey1,
      encryptVersion: EncryptVersion.v1,
    }

    let promise = defaultEncryptTransform(request, customConfig)
    expect(isPromise(promise)).toEqual(true)

    let res = await promise
    expect(res).toEqual(undefined)
    expect(request).toHaveProperty('data')
    // request.data 是被加密后的数据
    expect(typeof request.data === 'string').toEqual(true)
  })

  it('defaultEncryptTransform encrypt v2', async () => {
    // 加密加签-V2
    let request = {
      data: {
        appId: '131531',
        merNo: '62462741',
        body: {
          id: '1646131',
          name: 'foo'
        }
      }
    }
    let customConfig = {
      useEncrypt: true,
      useSign: true,
      appKey: appKey1,
      encryptVersion: EncryptVersion.v2,
    }

    let promise = defaultEncryptTransform(request, customConfig)
    expect(isPromise(promise)).toEqual(true)

    let res = await promise
    expect(res).toEqual(undefined)
    expect(request).toHaveProperty('data.body')
    // log('defaultEncryptTransform', request)
    // request.data.body 是被加密后的数据
    expect(typeof request.data.body === 'string').toEqual(true)
    // commonParams 正常
    expect(request.data).toHaveProperty('appId', '131531')
    expect(request.data).toHaveProperty('merNo', '62462741')
  })

  it('defaultCommonParamsTransform no commonParams no encrypt', async () => {
    let request: AxiosRequestConfig = {
      data: {
        id: '54262125',
        name: 'foo'
      }
    }
    let customConfig: CustomConfig = {
      useEncrypt: false,
      nestBizData: false,
    }
    await defaultCommonParamsTransform(request, customConfig)
    expect(request.data).toEqual({ id: '54262125', name: 'foo' })
  })

  it('defaultCommonParamsTransform no commonParams encrypt', async () => {
    let request: AxiosRequestConfig = {
      data: {
        id: '54262125',
        name: 'foo'
      }
    }
    let customConfig: CustomConfig = {
      useEncrypt: true
    }
    await defaultCommonParamsTransform(request, customConfig)
  })

  it('defaultCommonParamsTransform with commonParams encrypt v1', async () => {
    let commonParams1 = vi.fn()
    commonParams1.mockImplementation(() => ({
      appId: '16442432',
      merNo: '1644623886'
    }))
    let request: AxiosRequestConfig = {
      data: {
        id: '54262125',
        name: 'foo'
      }
    }
    let customConfig: CustomConfig = {
      useEncrypt: true,
      appKey: appKey1,
      encryptVersion: EncryptVersion.v1,
      commonParams: commonParams1
    }
    await defaultCommonParamsTransform(request, customConfig)
    expect(commonParams1).toBeCalledTimes(1)
    expect(request.data).toEqual({
      appId: '16442432',
      merNo: '1644623886',
      id: '54262125',
      name: 'foo',
    })
  })

  it('defaultCommonParamsTransform with commonParams encrypt v1 priority', async () => {
    let commonParams1 = vi.fn()
    commonParams1.mockImplementation(() => ({
      appId: '16442432',
      merNo: '1644623886'
    }))
    let request: AxiosRequestConfig = {
      data: {
        id: '54262125',
        name: 'foo',
        merNo: '888888888', // 会覆盖commonParams.merNo
      }
    }
    let customConfig: CustomConfig = {
      useEncrypt: true,
      appKey: appKey1,
      encryptVersion: EncryptVersion.v1,
      commonParams: commonParams1
    }
    await defaultCommonParamsTransform(request, customConfig)
    expect(commonParams1).toBeCalledTimes(1)
    expect(request.data).toEqual({
      appId: '16442432',
      merNo: '888888888',
      id: '54262125',
      name: 'foo',
    })
  })

  it('defaultCommonParamsTransform with commonParams encrypt v2', async () => {
    let commonParams1 = vi.fn()
    commonParams1.mockImplementation(() => ({
      appId: '16442432',
      merNo: '1644623886'
    }))
    let request: AxiosRequestConfig = {
      data: {
        id: '54262125',
        name: 'foo'
      }
    }
    let customConfig: CustomConfig = {
      useEncrypt: true,
      appKey: appKey1,
      encryptVersion: EncryptVersion.v2,
      commonParams: commonParams1
    }
    await defaultCommonParamsTransform(request, customConfig)
    expect(commonParams1).toBeCalledTimes(1)
    expect(request.data).toEqual({
      appId: '16442432',
      merNo: '1644623886',
      body: {
        id: '54262125',
        name: 'foo',
      },
    })
  })

  it('defaultCommonParamsTransform with commonParams encrypt v2 custom nestBizData', async () => {
    let commonParams1 = vi.fn()
    commonParams1.mockImplementation(() => ({
      appId: '16442432',
      merNo: '1644623886'
    }))
    let request: AxiosRequestConfig = {
      data: {
        id: '54262125',
        name: 'foo'
      }
    }
    let customConfig: CustomConfig = {
      nestBizData: 'data',
      useEncrypt: true,
      appKey: appKey1,
      encryptVersion: EncryptVersion.v2,
      commonParams: commonParams1,
    }
    await defaultCommonParamsTransform(request, customConfig)
    expect(commonParams1).toBeCalledTimes(1)
    expect(request.data).toEqual({
      appId: '16442432',
      merNo: '1644623886',
      body: {
        id: '54262125',
        name: 'foo',
      },
    })
  })

  it('defaultCommonParamsTransform with commonParams encrypt v2 priority', async () => {
    let commonParams1 = vi.fn()
    commonParams1.mockImplementation(() => ({
      appId: '16442432',
      merNo: '1644623886'
    }))
    let request: AxiosRequestConfig = {
      data: {
        id: '54262125',
        name: 'foo',
        merNo: '99999999', // 不会覆盖 commonParams.merNo
      }
    }
    let customConfig: CustomConfig = {
      useEncrypt: true,
      appKey: appKey1,
      encryptVersion: EncryptVersion.v2,
      commonParams: commonParams1
    }
    await defaultCommonParamsTransform(request, customConfig)
    expect(commonParams1).toBeCalledTimes(1)
    expect(request.data).toEqual({
      appId: '16442432',
      merNo: '1644623886',
      body: {
        id: '54262125',
        name: 'foo',
        merNo: '99999999',
      },
    })
  })

  it('defaultCommonParamsTransform with commonParams no encrypt no nestBizData', async () => {
    let request: AxiosRequestConfig = {
      data: {
        id: '54262125',
        name: 'foo'
      }
    }
    let customConfig: CustomConfig = {
      nestBizData: false,
      useEncrypt: false, // 当 useEncrypt 为 false 时下方配置应不生效
      appKey: appKey1,
      encryptVersion: EncryptVersion.v1,
    }
    await defaultCommonParamsTransform(request, customConfig)
    expect(request.data).toEqual({
      id: '54262125',
      name: 'foo'
    })
  })

  it('defaultCommonParamsTransform with commonParams no encrypt nestBizData', async () => {
    let request: AxiosRequestConfig = {
      data: {
        id: '54262125',
        name: 'foo',
      }
    }
    let customConfig: CustomConfig = {
      nestBizData: true,
      useEncrypt: false, // 当 useEncrypt 为 false 时下方配置应不生效
      appKey: appKey1,
      encryptVersion: EncryptVersion.v1,
    }
    await defaultCommonParamsTransform(request, customConfig)
    expect(request.data).toEqual({
      body: {
        id: '54262125',
        name: 'foo',
      },
    })
  })

  it('defaultCommonParamsTransform with commonParams no encrypt custom nestBizData', async () => {
    let request: AxiosRequestConfig = {
      data: {
        id: '54262125',
        name: 'foo',
      }
    }
    let customConfig: CustomConfig = {
      nestBizData: 'data',
      useEncrypt: false, // 当 useEncrypt 为 false 时下方配置应不生效
      appKey: appKey1,
      encryptVersion: EncryptVersion.v1,
    }
    await defaultCommonParamsTransform(request, customConfig)
    expect(request.data).toEqual({
      data: {
        id: '54262125',
        name: 'foo',
      },
    })
  })

  it('defaultCommonParamsTransform with commonParams no encrypt wrong nestBizData', async () => {
    let request: AxiosRequestConfig = {
      data: {
        id: '54262125',
        name: 'foo',
      }
    }
    let customConfig: CustomConfig = {
      nestBizData: null as any,
      useEncrypt: false, // 当 useEncrypt 为 false 时下方配置应不生效
      appKey: appKey1,
      encryptVersion: EncryptVersion.v1,
    }
    await defaultCommonParamsTransform(request, customConfig)
    expect(request.data).toEqual({
      body: {
        id: '54262125',
        name: 'foo',
      },
    })
  })

  it('defaultCommonHeadersTrasform no commonHeaders', async () => {
    let request = {
      headers: {
        'Header-A': 'goadgagaaa',
      }
    }
    let customConfig: CustomConfig = {}
    await defaultCommonHeadersTrasform(request, customConfig)
    expect(request.headers).toEqual({
      'Header-A': 'goadgagaaa',
    })
  })

  it('defaultCommonHeadersTrasform with commonHeaders', async () => {
    let request = {
      headers: {
        'Header-A': 'goadgagaaa',
      }
    }
    let customConfig: CustomConfig = {
      commonHeaders: () => ({
        'My-Token': 'tokentoken',
      })
    }
    await defaultCommonHeadersTrasform(request, customConfig)
    expect(request.headers).toEqual({
      'Header-A': 'goadgagaaa',
      'My-Token': 'tokentoken',
    })
  })

  it('defaultEncryptTransform no encrypt', async () => {
    let request = {
      data: {
        id: '155252554',
        name: 'foo'
      }
    }
    let customConfig: CustomConfig = {
      useEncrypt: false,
    }
    await defaultEncryptTransform(request, customConfig)
    expect(request.data).toEqual({
      id: '155252554',
      name: 'foo',
    })
  })

  it('defaultEncryptTransform encrypt v1 no commonParams', async () => {
    let request = {
      data: {
        id: '155252554',
        name: 'foo'
      }
    }
    let customConfig: CustomConfig = {
      useEncrypt: true,
      encryptVersion: EncryptVersion.v1,
      appKey: appKey1,
    }
    await defaultEncryptTransform(request, customConfig)
    expect(isString(request.data)).toEqual(true)
    expect(decrypt(request.data, appKey1)).toEqual({
      id: '155252554',
      name: 'foo',
    })
  })

  it('defaultEncryptTransform encrypt v1 with commonParams', async () => {
    let commonParams1 = vi.fn()
    commonParams1.mockImplementation(() => ({
      appId: '856864142',
      merNo: '5631850145',
    }))
    let request = {
      data: {
        id: '155252554',
        name: 'foo',
      }
    }
    let customConfig: CustomConfig = {
      useEncrypt: true,
      encryptVersion: EncryptVersion.v1,
      appKey: appKey1,
      commonParams: commonParams1
    }
    // commonParams 配置需要 defaultCommonParamsTransform 先处理，再交给 defaultEncryptTransform
    await defaultCommonParamsTransform(request, customConfig)
    expect(request.data).toEqual({
      appId: '856864142',
      merNo: '5631850145',
      id: '155252554',
      name: 'foo',
    })
    await defaultEncryptTransform(request, customConfig)
    expect(isString(request.data)).toEqual(true)
    expect(decrypt(request.data, appKey1)).toEqual({
      appId: '856864142',
      merNo: '5631850145',
      id: '155252554',
      name: 'foo',
    })
  })

  it('defaultEncryptTransform encrypt v2 no commonParams', async () => {
    let request = {
      data: {
        id: '155252554',
        name: 'foo'
      }
    }
    let customConfig: CustomConfig = {
      useEncrypt: true,
      encryptVersion: EncryptVersion.v1,
      appKey: appKey1,
    }
    await defaultEncryptTransform(request, customConfig)
  })

  it('defaultEncryptTransform encrypt v2 with commonParams', async () => {
    let request = {
      data: {
        id: '155252554',
        name: 'foo'
      }
    }
    let customConfig: CustomConfig = {
      useEncrypt: true,
      encryptVersion: EncryptVersion.v1,
      appKey: appKey1,
    }
    await defaultEncryptTransform(request, customConfig)
  })

  it('defaultEncryptTransform parameters mismatch', async () => {
    let request = {
      data: {
        id: '155252554',
        name: 'foo'
      }
    }
    // 无 appKey
    let customConfig: CustomConfig = {
      useEncrypt: true,
      encryptVersion: EncryptVersion.v1,
    }

    try {
      await defaultEncryptTransform(request, customConfig)
    } catch (e) {
      expect(e).toBeInstanceOf(Error)
    }

    // encryptVersion 错误
    customConfig = {
      useEncrypt: true,
      appKey: appKey1,
      encryptVersion: '3' as any,
    }
    try {
      await defaultEncryptTransform(request, customConfig)
    } catch (e) {
      expect(e).toBeInstanceOf(Error)
    }
  })

  it('defaultDecryptTransform no useEncrypt', async () => {
    let response: any = {
      ok: true,
      data: {
        id: '1427762',
      },
      config: {
        useSign: true,
        appKey: appKey1,
      },
    }
    let _response = deepClone(response)
    await defaultDecryptTransform(response)
    expect(response).toEqual(_response)
  })

  it('defaultDecryptTransform with wrong encryptVersion', async () => {
    let response: any = {
      ok: true,
      data: {
        id: '1656713545',
      },
      config: {
        useEncrypt: true,
        useSign: true,
        appkey: appKey1,
        encryptVersion: '55',
      },
    }
    let _response = deepClone(response)
    await defaultDecryptTransform(response) 
    expect(response).toEqual(_response)
  })

  it('defaultDecryptTransform useEncrypt no appKey', async () => {
    let response: any = {
      ok: true,
      data: {
        id: '1656713545',
      },
      config: {
        useEncrypt: true,
        useSign: true,
        encryptVersion: EncryptVersion.v2,
      },
    }
    let _response = deepClone(response)
    await defaultDecryptTransform(response) 
    expect(response).toEqual(_response)
  })

  it('defaultDecryptTransform useEncrypt v1', async () => {
    let data = {
      id: '1656713545',
    }
    let response: any = {
      ok: true,
      data: encrypt(data, appKey1),
      config: {
        useEncrypt: true,
        useSign: true,
        encryptVersion: EncryptVersion.v1,
        appKey: appKey1,
      },
    }
    await defaultDecryptTransform(response) 
    expect(response).toEqual({
      ok: true,
      data,
      config: {
        useEncrypt: true,
        useSign: true,
        encryptVersion: EncryptVersion.v1,
        appKey: appKey1,
      },
    })
  })

  it('defaultDecryptTransform useEncrypt v2', async () => {
    let data = {
      id: '1656713545',
    }
    let response: any = {
      ok: true,
      data: {
        appId: '15676242',
        merNo: '465967686',
        body: encrypt(data, appKey1),
      },
      config: {
        useEncrypt: true,
        useSign: true,
        encryptVersion: EncryptVersion.v2,
        appKey: appKey1,
      },
    }
    await defaultDecryptTransform(response) 
    expect(response).toEqual({
      ok: true,
      data: {
        appId: '15676242',
        merNo: '465967686',
        body: data,
      },
      config: {
        useEncrypt: true,
        useSign: true,
        encryptVersion: EncryptVersion.v2,
        appKey: appKey1,
      },
    })
  })

  it('defaultIsInvalidToken normal case', () => {
    expect(defaultIsInvalidToken({
      returnCode: 'INVALID_TOKEN'
    })).toEqual(true)
  })

  it('defaultIsInvalidToken error case', () => {
    expect(defaultIsInvalidToken({})).toEqual(false)
    expect(defaultIsInvalidToken({ returnCode: '145141' })).toEqual(false)
    expect(defaultIsInvalidToken({ returnCode: 'abdaa' })).toEqual(false)
    expect(defaultIsInvalidToken(undefined)).toEqual(false)
  })

  it('defaultTokenCheckTransform no isInvalidToken use default', () => {
    let onInvalidToken = vi.fn()
    let response: any = {
      ok: true,
      data: {
        returnCode: 'INVALID_TOKEN'
      },
      config: {
        onInvalidToken
      }
    }
    defaultTokenCheckTransform(response)
    expect(onInvalidToken).toBeCalledTimes(1)
    expect(onInvalidToken).toBeCalledWith(response)
  })

  it('defaultTokenCheckTransform with isInvalidToken true', () => {
    let isInvalidToken = vi.fn()
    let onInvalidToken = vi.fn()
    isInvalidToken.mockImplementation(() => true)
    let response: any = {
      ok: true,
      data: {
        returnCode: 'INVALID_TOKEN'
      },
      config: {
        isInvalidToken,
        onInvalidToken
      }
    }
    defaultTokenCheckTransform(response)
    expect(isInvalidToken).toBeCalledTimes(1)
    expect(onInvalidToken).toBeCalledTimes(1)
    expect(onInvalidToken).toBeCalledWith(response)
  })

  it('defaultTokenCheckTransform with isInvalidToken false', () => {
    let isInvalidToken = vi.fn()
    let onInvalidToken = vi.fn()
    isInvalidToken.mockImplementation(() => false)
    let response: any = {
      ok: true,
      data: {
        returnCode: 'INVALID_TOKEN'
      },
      config: {
        isInvalidToken,
        onInvalidToken
      }
    }
    defaultTokenCheckTransform(response)
    expect(isInvalidToken).toBeCalledTimes(1)
    expect(onInvalidToken).not.toBeCalled()
  })
  
  it('defaultTokenCheckTransform with wrong isInvalidToken use default', () => {
    let isInvalidToken: any = 1233151
    let onInvalidToken = vi.fn()
    let response: any = {
      ok: true,
      data: {
        returnCode: 'INVALID_TOKEN'
      },
      config: {
        isInvalidToken,
        onInvalidToken
      }
    }
    defaultTokenCheckTransform(response)
    expect(onInvalidToken).toBeCalledTimes(1)
    
    isInvalidToken = 'agaha'
    defaultTokenCheckTransform(response)
    expect(onInvalidToken).toBeCalledTimes(2)

    isInvalidToken = true
    defaultTokenCheckTransform(response)
    expect(onInvalidToken).toBeCalledTimes(3)

    isInvalidToken = false
    defaultTokenCheckTransform(response)
    expect(onInvalidToken).toBeCalledTimes(4)

    isInvalidToken = undefined
    defaultTokenCheckTransform(response)
    expect(onInvalidToken).toBeCalledTimes(5)

    isInvalidToken = null
    defaultTokenCheckTransform(response)
    expect(onInvalidToken).toBeCalledTimes(6)
    
    isInvalidToken = Symbol()
    defaultTokenCheckTransform(response)
    expect(onInvalidToken).toBeCalledTimes(7)

    isInvalidToken = {}
    defaultTokenCheckTransform(response)
    expect(onInvalidToken).toBeCalledTimes(8)
  })

  it('getCustomConfig normal case', () => {
    let config = {
      useEncrypt: true,
    }
    let response: any = {
      ok: true,
      config,
    }
    expect(getCustomConfig(response)).toEqual(config)

    response = {
      ok: false,
      config,
    }
    expect(getCustomConfig(response)).toEqual(null)
  })

  it('getCustomConfig error case', () => {
    expect(() => getCustomConfig(undefined as any)).toThrowError()
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

    http.post('/number/200').then(response => {
      expect(getCommonParams).toBeCalledTimes(1)
      expect(response.config?.commonParams).toStrictEqual(getCommonParams)
      expect(response.config?.data).toStrictEqual(JSON.stringify(commonParams))
    })

    // FIX: 偶尔出现单元测试超时，暂时通过延迟退出解决
    return delay(3000)
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
      commonParams: getCommonParams,
      nestBizData: false,
    })

    http.post('/number/200', data).then(response => {
      expect(getCommonParams).toBeCalledTimes(1)
      expect(response.config?.commonParams).toStrictEqual(getCommonParams)
      expect(response.config?.data).toStrictEqual(JSON.stringify({ ...commonParams, ...data }))
    })

    // FIX: 偶尔出现单元测试超时，暂时通过延迟退出解决
    return delay(3000)
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

    http.post('/number/200').then(response => {
      // log(response)
      expect(getCommonHeaders).toBeCalledTimes(1)
      expect(response.config?.commonHeaders).toStrictEqual(getCommonHeaders)
      expect(response.config?.headers).toHaveProperty('msgId', '202306071636235632966')
      expect(response.config?.headers).toHaveProperty('deviceId', 'app_123')
      expect(response.config?.headers).toHaveProperty('authorization', null)
      expect(response.config?.headers).toHaveProperty('appId', '123')
      expect(response.config?.headers).toHaveProperty('merNoNo', '125')
    })

    // FIX: 偶尔出现单元测试超时，暂时通过延迟退出解决
    return delay(3000)
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

    http.post('/number/200').then(response => {
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

    // FIX: 偶尔出现单元测试超时，暂时通过延迟退出解决
    return delay(3000)
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

  it('config in instance should merge into factory config', () => {
    const onFail = vi.fn()
    const onInvalidToken = vi.fn()
    const timeout = 300
    const http = createHttp({ baseURL, noFail: true, noStatusTransform: true })
    return http.post('/foo/bar', {}, {
      timeout,
      baseURL: baseURL + '/aaa',
      noFail: false,
      noStatusTransform: false,
      useEncrypt: false,
      useSign: false,
      appKey: appKey1,
      encryptVersion: EncryptVersion.v1,
      onFail,
      onInvalidToken,
    }).then(res => {
      expect(res).toHaveProperty('config')
      expect(res.config?.timeout).toEqual(timeout)
      expect(res.config?.baseURL).toEqual(baseURL + '/aaa')
      expect(res.config?.noFail).toEqual(false)
      expect(res.config?.noStatusTransform).toEqual(false)
      expect(res.config?.useEncrypt).toEqual(false)
      expect(res.config?.useSign).toEqual(false)
      expect(res.config?.appKey).toEqual(appKey1)
      expect(res.config?.encryptVersion).toEqual(EncryptVersion.v1)
      expect(res.config?.onFail).toEqual(onFail)
      expect(res.config?.onInvalidToken).toEqual(onInvalidToken)
    })
  }, {
    timeout: 500
  })

  // TODO: 测试实例的配置项确实生效
  it('config in instance should not impact the origin config', () => {
    const onFail = vi.fn()
    const onInvalidToken = vi.fn()
    const timeout = 300
    const http = createHttp({ baseURL, noFail: false, noStatusTransform: false })
    return http.post('/hello/world', undefined, {
      timeout,
      baseURL: baseURL + '/aaa',
      noFail: true,
      noStatusTransform: true,
      useEncrypt: true,
      useSign: true,
      appKey: appKey1,
      encryptVersion: EncryptVersion.v1,
      onFail,
      onInvalidToken,
    }).then(() => {
      expect(http.getBaseURL()).toEqual(baseURL)
      return http.get('/foo/bar', {}, { timeout }).then(res => {
        expect(res).toHaveProperty('config')
        expect(http.getBaseURL()).toEqual(baseURL)
        expect(res.config?.baseURL).toEqual(baseURL)
        expect(res.config?.noFail).toEqual(false)
        expect(res.config?.noStatusTransform).toEqual(false)
        expect(res.config?.useEncrypt).toEqual(undefined)
        expect(res.config?.useSign).toEqual(undefined)
        expect(res.config?.appKey).toEqual(undefined)
      })
    })
  }, {
    timeout: 1500
  })

  it('config in instance continuous call should not impact the origin config', () => {
    const onFail = vi.fn()
    const onInvalidToken = vi.fn()
    const timeout = 300
    const http = createHttp({ baseURL, noFail: false, noStatusTransform: false })
    return http.post('/hello/world', undefined, {
      timeout,
      baseURL: baseURL + '/aaa',
      noFail: true,
      noStatusTransform: true,
      useEncrypt: true,
      useSign: true,
      appKey: appKey1,
      encryptVersion: EncryptVersion.v1,
      onFail,
      onInvalidToken,
    }).then(() => {
      return http.post('/hello/world', undefined, {
        timeout
      }).then(res => {
        expect(res).toHaveProperty('config')
        expect(http.getBaseURL()).toEqual(baseURL)
        expect(res.config?.baseURL).toEqual(baseURL)
        expect(res.config?.noFail).toEqual(false)
        expect(res.config?.noStatusTransform).toEqual(false)
        expect(res.config?.useEncrypt).toEqual(undefined)
        expect(res.config?.useSign).toEqual(undefined)
        expect(res.config?.appKey).toEqual(undefined)
      })
    })
  }, {
    timeout: 1000
  })
})

// 成功请求
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

  it('normal data with returnCode = NOT_AUTHORIZED data is null onFail, onInvalidToken, isInvalidToken', () => {
    const onFail = vi.fn()
    const onInvalidToken = vi.fn()
    const isInvalidToken = vi.fn()
    
    isInvalidToken.mockImplementation((data) => { return data.returnCode === 'NOT_AUTHORIZED' })
    
    afterAll(() => {
      vi.clearAllMocks()
    })

    const http = createHttp({ baseURL, onFail, onInvalidToken, isInvalidToken })
    return http.post('/json/fail/NOT_AUTHORIZED').then(response => {
      log(response)
      expect(response.success).toEqual(false)
      expect(response.code).toEqual('NOT_AUTHORIZED')
      expect(response.msg).toEqual('未授权')
      expect(isInvalidToken).toBeCalled()
      expect(isInvalidToken).toHaveBeenCalledWith(response.data, response)
      expect(onInvalidToken).toBeCalledTimes(1)
      expect(onInvalidToken).toHaveBeenCalledWith(response)
      expect(onFail).not.toBeCalled()
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
      expect(isInvalidToken).toBeCalled()
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
      expect(isInvalidToken).toBeCalled()
      expect(onInvalidToken).not.toBeCalled()
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
  it('normal data with returnCode = SUCCESS data is json ecnryptVersion = v2 with commonParams', () => {
    const commonParams = {
      appId: '123456',
      merNo: '123457',
      deviceId: '123458',
    }
    const http = createHttp({
      baseURL,
      useEncrypt: true,
      encryptVersion: EncryptVersion.v2,
      useSign: true,
      appKey: appKey1,
      commonParams: () => commonParams
    })
    return http.post('/encrypt/v2/success/json/params', { id: '131132' }).then(response => {
      log(response)
      expect(response.ok).toEqual(true)
      expect(response.status).toEqual(200)
      expect(response.success).toEqual(true)
      expect(response.code).toEqual('SUCCESS')
      expect(response.msg).toEqual('')
      expect(response.data).toStrictEqual({ returnCode: 'SUCCESS', returnDes: '', body: { foo: 'bar' }, ...commonParams })
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
      basicImgUrl: 'https://www.example.com/static/',
      appKey: appKey1,
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
      // log('response', response)
      expect(getToken).toBeCalledTimes(1)
      expect(getCommonHeaders).toBeCalledTimes(1)
      expect(getCommonParams).toBeCalledTimes(1)
      expect(response.ok).toEqual(true)
      expect(response.status).toEqual(200)
      expect(response.success).toEqual(true)
      expect(response.code).toEqual('SUCCESS')
      expect(response.msg).toEqual('')
      // expect((response.data as any).body).toHaveProperty('body')
      // expect((response.data as any).body.body).toHaveProperty('id', '713642')
      // expect((response.data as any).body).toHaveProperty('appId', appParams.appId)
      // expect((response.data as any).body).toHaveProperty('merNoNo', appParams.merNo)
      // expect((response.data as any).body).toHaveProperty('foo', 'bar')
      expect(response.data).toStrictEqual({
        ...getCommonParams(),
        body: {
          body: {
            id: '713642'
          },
          ...{ foo: 'bar' },
          token: getToken()
        },
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
      authorization: function (): string {
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
