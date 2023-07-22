import { create, ApisauceConfig, ApisauceInstance, ResponseTransform, AsyncRequestTransform, ApiResponse, PROBLEM_CODE } from 'apisauce'
import { AxiosRequestConfig } from 'axios'
import { encrypt, decrypt, isEncryptedData, DataType, createSign } from 'decrypt-core'
import { isPromise } from './common'

interface CustomConfig {
  noStatusTransform?: boolean // 不开启业务状态码转换
  isInvalidToken?: (data: any, response: XApiResponse<any, any>) => boolean // 判定状态码为无效 token 的钩子函数
  onInvalidToken?: (response: XApiResponse<any, any>) => void // 无效 token 的钩子函数
  noFail?: boolean // 不开启业务处理失败的校验
  onFail?: (msg: FailMessageType, response: XApiResponse<any, any>) => void // 业务处理失败的钩子函数
  useEncrypt?: boolean // 是否对接口数据进行加密
  useSign?: boolean // 是否对接口数据进行验签
  encryptVersion?: EncryptVersion // 加密方法版本（在 useEncrypt 为 true 时才生效）
  appKey?: string // 加密秘钥（在 useEncrypt 为 true 时比传）
  commonParams?: (request: CustomAxiosRequestConfig) => Record<string, any> | Promise<Record<string, any>> // 通用参数，会拼接到接口调用时传递的参数上
  commonHeaders?: (request: CustomAxiosRequestConfig) => Record<string, any> | Promise<Record<string, any>> // 通用 Header，自动拼接到 Header 上
}

interface ApiCheckResponse {
  success?: boolean
  code?: string
  msg?: string
}

export const enum EncryptVersion {
  v1 = 'v1',
  v2 = 'v2'
}

export type FailMessageType = PROBLEM_CODE | string | undefined

export type XApiResponse<T, U = T> = Pick<ApiResponse<T, U>, keyof ApiResponse<T, T>> & {
  success?: boolean
  code?: string
  msg?: string
}

// export type XApiRequest = 

export type XRequestTransform = (request: CustomAxiosRequestConfig) => void

export type XAsyncRequestTransform = ( request: CustomAxiosRequestConfig) => Promise<void> | ((request: CustomAxiosRequestConfig) => Promise<void>)

export type XResponseTransform = (response: XApiResponse<any>) => void

export type HttpConfig = ApisauceConfig & CustomConfig

export type CustomAxiosRequestConfig = AxiosRequestConfig & CustomConfig

/**
 * 修改Apisauce导出实例的类型声明
 * 1.业务参数校验的transform修改了ApiResponse的属性，类型变成了XApiResponse
 *  'any' | 'get' | 'delete' | 'head' | 'post' | 'put' | 'patch' | 'link' | 'unlink'这些方法类型定义需要重写
 */
export interface XApisauceInstance extends Omit<ApisauceInstance, 'any' | 'get' | 'delete' | 'head' | 'post' | 'put' | 'patch' | 'link' | 'unlink'> {
  any: <T, U = T>(config: AxiosRequestConfig) => Promise<XApiResponse<T, U>>
  get: <T, U = T>(url: string, params?: {}, axiosConfig?: AxiosRequestConfig) => Promise<XApiResponse<T, U>>
  delete: <T, U = T>(url: string, params?: {}, axiosConfig?: AxiosRequestConfig) => Promise<XApiResponse<T, U>>
  head: <T, U = T>(url: string, params?: {}, axiosConfig?: AxiosRequestConfig) => Promise<XApiResponse<T, U>>
  post: <T, U = T>(url: string, data?: any, axiosConfig?: AxiosRequestConfig) => Promise<XApiResponse<T, U>>
  put: <T, U = T>(url: string, data?: any, axiosConfig?: AxiosRequestConfig) => Promise<XApiResponse<T, U>>
  patch: <T, U = T>(url: string, data?: any, axiosConfig?: AxiosRequestConfig) => Promise<XApiResponse<T, U>>
  link: <T, U = T>(url: string, params?: {}, axiosConfig?: AxiosRequestConfig) => Promise<XApiResponse<T, U>>
  unlink: <T, U = T>(url: string, params?: {}, axiosConfig?: AxiosRequestConfig) => Promise<XApiResponse<T, U>>
}

const defaultEncryptTransform: XRequestTransform = (request) => {
  console.log(request)
  const useEncrypt = request.useEncrypt
  const encryptVersion = request.encryptVersion || EncryptVersion.v1
  const appKey = request.appKey
  const useSign = !!request.useSign
  
  if (!useEncrypt) {
    console.log('未开启加密，不做处理')
    return
  }

  if (useEncrypt && !appKey) {
    console.error('加密秘钥未提供，不做处理')
    return
  }

  const encryptV1 = <T = any>(data: T, key: string, useSign: boolean): T  => {
    if (typeof data === 'undefined') {
      return data
    }
    const ed = encrypt(data as DataType, key)
    return ed as T
  }

  const encryptV2 = <T = any>(data: T, key: string, useSign: boolean): T => {
    const ed = encrypt(data as DataType, key)
    if (useSign) {
      (ed as any).sign = createSign(ed as any, key)
    }
    return {
      body: ed,
      encodeMethod: '1',
      signMethod: '1'
    } as T
  }

  request.data = encryptVersion === EncryptVersion.v1 ? encryptV1(request.data, appKey as any, useSign) : encryptV2(request.data, appKey as any, useSign)

  if (encryptVersion === EncryptVersion.v1) {
    if (request.headers) {
      (request.headers as any).set('encodeMethod', '1')
      (request.headers as any).set('signMethod', '1')
      (request.headers as any).set('sign', createSign(request.data, appKey as any))
    }
  }
}

const defaultCommonParamsTransform: XAsyncRequestTransform = async (request) => {
  const commonParams = request.commonParams
  const useEncrypt = request.useEncrypt
  const encryptVersion = request.encryptVersion || EncryptVersion.v1

  if (!commonParams) {
    return
  }
  const p = commonParams(request)
  const params = isPromise(p) ? await p : p

  if (useEncrypt) {
    if (encryptVersion === EncryptVersion.v1) {
      // 加密方式一：commonParams 无效
    } else if (encryptVersion === EncryptVersion.v2) {
      request.data = {
        ...request.data,
        ...params,
      }
    }
  } else {
    request.data = {
      ...request.data,
      ...params
    }
  }
}

const defaultCommonHeadersTrasform: XAsyncRequestTransform = async (request) => {
  const commonHeaders = request.commonHeaders

  if (!commonHeaders) {
    return
  }
  
  const p = commonHeaders(request)
  const params = isPromise(p) ? await p : p
  const headerKeys = Object.keys(params)

  if (request.headers !== null && request.headers !== undefined) {
    headerKeys.forEach(key => {
      (request.headers as any).set(key, (params as any)[key])
    })
  }
}

const defaultDecryptTransform: XResponseTransform = (response) => {
  const config = getCustomConfig(response) as CustomAxiosRequestConfig
  if (!config || !config.useEncrypt) { return }

  const encryptVersion = config.encryptVersion || EncryptVersion.v1
  const appKey = config.appKey
  const data = response.data

  // TODO: 校验encryptVersion/appKey
  if (!appKey) { return }
  if (!isEncryptedData(data)) {
    console.error('返回数据非加密数据格式，不做处理')
    return
  }

  const decryptV1 = <T = any>(data: T, key: string): T => {
    if (typeof data !== 'string') {
      return data
    }
    const de = decrypt(data, key)
    if (!de) {
      // TODO: 解密失败
      return data
    } else {
      return de
    }
  }

  const decryptV2 = <T = any>(data: T, key: string): T => {
    if (typeof (data as any).body !== 'string') {
      return data
    }
    const de = decrypt((data as any).body, key)
    if (!de) {
      // TODO: 解密失败
      return data
    } else {
      return {
        ...data,
        body: de
      }
    }
  }

  response.data = encryptVersion === EncryptVersion.v1 ? decryptV1(data, appKey) : decryptV2(data, appKey)
}

/**
 * 校验业务状态是否为成功，成功则会给response.data添加success=true，以及 code 和 msg
 * @param response ApiResponse<any, any>
 */
const defaultResponseTransform: XResponseTransform = (response) => {
  const data = response.data
  if (data) {
    // 业务状态校验产生的额外字段放到 response 上，不影响原始接口返回的 data 数据
    response.success = data.returnCode === 'SUCCESS'
    response.code = data.returnCode
    response.msg = data.returnDes
    // response.data.success = data.returnCode === 'SUCCESS'
    // response.data.code = data.returnCode
    // response.data.msg = data.returnDes
  }
}

const defaultIsInvalidToken = (data: any, response?: XApiResponse<any, any>): boolean => {
  return data.returnCode === 'INVALID_TOKEN'
}

const defaultTokenCheckTransform: XResponseTransform = (response) => {
  if (!response.ok || !response.data) { return }

  // 判断是否有传递isInvalidToken，没有则使用默认的defaultIsInvalidToken
  const config = getCustomConfig(response) as CustomAxiosRequestConfig
  let invalid = false
  if (!config.isInvalidToken) {
    invalid = defaultIsInvalidToken(response.data)
  } else {
    invalid = config.isInvalidToken(response.data, response)
  }

  // 根据invalid调用 token 失效处理的钩子
  if (invalid) {
    if (config.onInvalidToken) {
      config.onInvalidToken(response)
    }
    if (process.env.NODE_ENV === 'development') {
      console.warn('token invalid')
    }
  }
}

// 业务状态码失败时 Toast 提示
const defaultFailTransform: ResponseTransform = (response) => {
  const config = getCustomConfig(response)
  const data = response.data
  const onFail =  config && config.onFail
  const warn = () => {
    if (!onFail && process.env.NODE_ENV === 'development') {
      console.warn('config.onFail hook not configured')
    }
  }
  // 请求未成功
  if (!response.ok) {
    warn()
    onFail && onFail(response.problem, response)
    return
  }

  // 请求成功但无业务数据
  if (!data) {
    warn()
    onFail && onFail('接口异常，请重试', response)
    return
  }

  // 请求成功但业务未成功
  if (data.returnCode !== 'SUCCESS') {
    warn()
    onFail && onFail(data.returnDes || '处理失败，请重试', response)
    return
  }
}

const getCustomConfig = (response: XApiResponse<any, any>) => {
  return response.ok ? response.config as CustomAxiosRequestConfig : null
}

/**
 * 根据配置创建 API 实例
 * @param config HttpConfig
 * @returns ApisauceInstance
 */
export function createHttp(config: HttpConfig): XApisauceInstance {
  const instance = create(config)
  config.useEncrypt && instance.addRequestTransform(defaultEncryptTransform)
  config.commonParams && instance.addAsyncRequestTransform(defaultCommonParamsTransform)
  config.commonHeaders && instance.addAsyncRequestTransform(defaultCommonHeadersTrasform)
  config.useEncrypt && instance.addResponseTransform(defaultDecryptTransform)
  instance.addResponseTransform(defaultTokenCheckTransform)
  !config.noFail && instance.addResponseTransform(defaultFailTransform)
  !config.noStatusTransform && instance.addResponseTransform(defaultResponseTransform)
  return instance as XApisauceInstance
}

/**
 * @deprecated
 * @param param0 
 * @param config 
 * @returns 
 */
export function createBaseHttp({ encrypt }: {
  encrypt: boolean
}, config: HttpConfig): XApisauceInstance {
  const instance = createHttp({
    ...config,
    useEncrypt: encrypt,
    useSign: encrypt,
    encryptVersion: EncryptVersion.v2
  })
  return instance
}