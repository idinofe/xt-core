import { create, ApisauceConfig, ApisauceInstance, ResponseTransform, AsyncRequestTransform, ApiResponse, PROBLEM_CODE, RequestTransform, HEADERS } from 'apisauce'
import { AxiosRequestConfig } from 'axios'
import { encrypt, decrypt, isEncryptedData, DataType, createSign, BaseObject } from 'decrypt-core'
import { isPromise, isNormalObject, isDef, isString, randomNumber, genMessageId, isFunction, promisify } from './common'
import { AppConfig } from './type'
import { base64ToBlob, MIME_TYPE } from './web'

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

interface UploadConfig<T = any> {
  fileName?: string
  fileKey?: string
  onUploadProgress?: (e: T) => void
}

type UploadData = {
  data: string
  mimeType: MIME_TYPE
} | {
  file: Blob | File
}

interface UploadInstance extends ApisauceInstance {
  upload: <T, U = T>(url: string, data: UploadData, config?: UploadConfig) => Promise<XApiResponse<T, U>>
}

export const RETURN_CODE_SUCCESS = 'SUCCESS'
export const RETURN_CODE_FAIL = 'FAIL'

interface ApiCheckResponse {
  success?: boolean
  code?: string
  msg?: string
}

export const enum EncryptVersion {
  v1 = '1',
  v2 = '2'
}

export type FailMessageType = PROBLEM_CODE | string | undefined

export type XApiResponse<T, U = T> = Pick<ApiResponse<T, U>, keyof ApiResponse<T, T>> & {
  config?: CustomAxiosRequestConfig
  success?: boolean
  code?: string
  msg?: string
}

// export type XApiRequest = 

export type XRequestTransform = (request: AxiosRequestConfig, customConfig: CustomConfig) => void

interface BaseTransform {
  (...args: any[]): any | Promise<any>
}

// export type XAsyncRequestTransform = ( request: CustomAxiosRequestConfig) => Promise<void> | ((request: CustomAxiosRequestConfig) => Promise<void>)
export type XAsyncRequestTransform = (request: AxiosRequestConfig, customConfig: CustomConfig) => Promise<void> | ((request: AxiosRequestConfig) => Promise<void>)

export type XResponseTransform = (response: XApiResponse<any>) => void

export type HttpConfig = ApisauceConfig & CustomConfig

export type UploadAppConfig = Pick<AppConfig, 'appId' | 'merNo' | 'deviceId'>

export type UploadHttpConfig = Omit<HttpConfig, 'useEncrypt' | 'useSign' | 'commonHeaders'> & {
  getToken: () => string
}

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


/**
 * 给 XAsyncRequestTransform 包装一个自定义配置项 customConfig
 * @param config CustomConfig
 * @param transform XAsyncRequestTransform
 * @returns XAsyncRequestTransform
 */
// const withCustomConfig = <T extends BaseTransform = XAsyncRequestTransform, D extends BaseTransform = RequestTransform>(httpConfig: HttpConfig, transform: T): D => {
const withCustomConfig = <T extends BaseTransform = XAsyncRequestTransform>(httpConfig: HttpConfig, transform: T): RequestTransform & AsyncRequestTransform => {
  const config: CustomConfig = {
    noStatusTransform: httpConfig.noStatusTransform,
    isInvalidToken: httpConfig.isInvalidToken,
    onInvalidToken: httpConfig.onInvalidToken,
    noFail: httpConfig.noFail,
    onFail: httpConfig.onFail,
    useEncrypt: httpConfig.useEncrypt,
    useSign: httpConfig.useSign,
    encryptVersion: httpConfig.encryptVersion,
    appKey: httpConfig.appKey,
    commonParams: httpConfig.commonParams,
    commonHeaders: httpConfig.commonHeaders,
  }
  return (request: AxiosRequestConfig) => {
    return transform(request, config)
  }
}

const defaultEncryptTransform: XAsyncRequestTransform = async (request, customConfig) => {
  // console.log(request, customConfig)
  const useEncrypt = customConfig.useEncrypt
  const encryptVersion = customConfig.encryptVersion || EncryptVersion.v1
  const appKey = customConfig.appKey
  const useSign = !!customConfig.useSign

  if (!useEncrypt) {
    // console.log('未开启加密，不做处理')
    return
  }

  if (useEncrypt && !appKey) {
    console.error('加密秘钥未提供，不做处理')
    return
  }

  const encryptV1 = <T = any>(data: T, key: string, useSign: boolean): T => {
    if (typeof data === 'undefined') {
      return data
    }
    const ed = encrypt(data as DataType, key)
    return ed as T
  }

  const encryptV2 = <T = any>(data: T, key: string, useSign: boolean): T => {
    const ed = encrypt(data as DataType, key)
    if (useSign) {
      const sign = createSign(data as BaseObject, key)
      return {
        body: ed,
        sign,
        encodeMethod: '1',
        signMethod: '1'
      } as T
    }
    return {
      body: ed,
      encodeMethod: '1',
      signMethod: '0'
    } as T
  }

  const ed = encryptVersion === EncryptVersion.v1
    ? encryptV1<string>(request.data, appKey as any, useSign)
    : encryptV2<BaseObject>(request.data, appKey as any, useSign)

  if (encryptVersion === EncryptVersion.v1) {
    if (request.headers) {
      (request.headers as any).encodeMethod = '1';
      (request.headers as any).signMethod = '1';
      (request.headers as any).sign = createSign(request.data, appKey as any);
    }
  }

  request.data = ed
}

const defaultCommonParamsTransform: XAsyncRequestTransform = async (request, customConfig) => {
  const commonParams = customConfig.commonParams
  const useEncrypt = customConfig.useEncrypt
  const encryptVersion = customConfig.encryptVersion || EncryptVersion.v1

  if (!commonParams) {
    return
  }
  const p = commonParams(request)
  const params = isPromise(p) ? await p : p

  if (useEncrypt) {
    if (encryptVersion === EncryptVersion.v1) {
      // 加密方法一
      request.data = {
        ...params,
        ...request.data,
      }
    } else if (encryptVersion === EncryptVersion.v2) {
      // 加密方法二
      request.data = {
        ...params,
        body: request.data,
      }
    }
  } else {
    request.data = {
      ...params,
      body: request.data,
    }
  }
}

const defaultCommonHeadersTrasform: XAsyncRequestTransform = async (request, customConfig) => {
  const commonHeaders = customConfig.commonHeaders

  if (!commonHeaders) {
    return
  }

  const p = commonHeaders(request)
  const params = isPromise(p) ? await p : p
  const headerKeys = Object.keys(params)

  if (request.headers !== null && request.headers !== undefined) {
    headerKeys.forEach(key => {
      (request.headers as any)[key] = (params as any)[key]
    })
  }
}

const defaultDecryptTransform: XResponseTransform = (response) => {
  // console.log('defaultDecryptTransform', response)
  const config = getCustomConfig(response) as CustomAxiosRequestConfig
  if (!config || !config.useEncrypt) { return }

  const encryptVersion = config.encryptVersion || EncryptVersion.v1
  const appKey = config.appKey
  let data = response.data

  if (!appKey) { return }
  if (encryptVersion === EncryptVersion.v1) {
    if (isDef(data) && isString(data)) {
      data = data.replaceAll('"', '') // V1 协议返回的密文数据头尾包含引号，需要去掉再解密
    }
    if (!isEncryptedData(data)) {
      console.error('返回数据非加密数据格式，不做处理')
      return
    }
  } else {
    if (encryptVersion === EncryptVersion.v2) {
      if (!isEncryptedData(data.body)) {
        console.error('返回数据非加密数据格式，不做处理')
        return
      }
    }
  }

  const decryptV1 = <T = any>(data: T, key: string): T => {
    if (!isString(data)) {
      return data
    }
    const de = decrypt(data as any, key)
    if (!de) {
      console.error('解密失败，不做处理')
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
 * returnCode 的取值顺序：Headers -> response.data
 * returnDes 的取值顺序：Headers -> response.data
 * @param response ApiResponse<any, any>
 */
const defaultResponseTransform: XResponseTransform = (response) => {
  const data = response.data
  const headers = response.headers
  // console.log(response, response.headers, (response.headers as any)['returnCode'])

  // FIX: axios transform all the response headers to lowercase
  const getHeader = (data: Record<string, string> | undefined, key: string) => {
    if (!data) {
      return undefined
    }
    return isDef(data[key])
      ? data[key]
      : isDef(data[key.toLowerCase()])
        ? data[key.toLowerCase()]
        : data[key]
  }
  const _returnCode1 = getHeader(headers, 'returnCode')
  const _returnCode2 = getHeader(data, 'returnCode')
  const _returnDes1 = getHeader(headers, 'returnDes')
  const _returnDes2 = getHeader(data, 'returnDes')

  const returnCode = headers && isDef(_returnCode1)
    ? _returnCode1
    : data && isNormalObject(data) && _returnCode2
      ? _returnCode2
      : undefined

  const returnDes = headers && isDef(_returnDes1)
    ? _returnDes1
    : data && isNormalObject(data) && isDef(_returnDes2)
      ? _returnDes2
      : undefined

  response.success = returnCode === RETURN_CODE_SUCCESS
  response.code = returnCode
  response.msg = returnDes
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
  const onFail = config && config.onFail
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
  config.commonParams && instance.addAsyncRequestTransform(withCustomConfig(config, defaultCommonParamsTransform))
  config.commonHeaders && instance.addAsyncRequestTransform(withCustomConfig(config, defaultCommonHeadersTrasform))
  config.useEncrypt && instance.addAsyncRequestTransform(withCustomConfig(config, defaultEncryptTransform))
  config.useEncrypt && instance.addResponseTransform(defaultDecryptTransform)
  instance.addResponseTransform(defaultTokenCheckTransform)
  !config.noFail && instance.addResponseTransform(defaultFailTransform)
  !config.noStatusTransform && instance.addResponseTransform(defaultResponseTransform)
  return instance as XApisauceInstance
}

/**
 * 创建基础 API 实例
 * @param param0 { encrypt: boolean } 若为 true，则加密加签同时启用，默认采用 V2 版本加密协议
 * @param config {HttpConfig}
 * @returns 
 */
export function createBaseHttp({ encrypt, commonParams = {}, authorization }: {
  encrypt: boolean,
  commonParams: Partial<Pick<AppConfig, 'appId' | 'merNo' | 'deviceId' | 'appKey'>>,
  authorization: string | null | (() => (string | null)) | (() => Promise<string | null>)
}, config: HttpConfig): XApisauceInstance {
  // let getAuthorization: any
  // if (isFunction(authorization)) {
  //   let token = (authorization as any)()
  //   if (isPromise(token)) {
  //     getAuthorization = () => token
  //   } else {
  //     getAuthorization = () => Promise.resolve(token)
  //   }
  // } else {
  //   let token = authorization
  //   getAuthorization = () => Promise.resolve(token)
  // }
  const getAuthorization = () => promisify(authorization)
  const instance = createHttp({
    ...config,
    useEncrypt: encrypt,
    useSign: encrypt,
    encryptVersion: EncryptVersion.v2,
    commonParams: async () => {
      const token = await getAuthorization()
      return {
        ...commonParams,
        authorization: token
      }
    }
  })
  return instance
}

/**
 * 上传文件（Web 环境）
 * 注意：
 * 1.使用了 FormData，故只能在 web 环境使用
 * 2.返回值是 UploadInstance 实例，建议只使用其 upload 方法，
 *  ApisauceInstance 实例提供的其他发请求方法不要使用，可能导
 *  致错误逻辑
 * @platform web
 * @param appConfig {AppConfig}
 * @param config {ApiSauceConfig}
 * @returns {UploadInstance}
 */
export function createUploadHttp(
    appConfig: UploadAppConfig,
    config: UploadHttpConfig
  ): UploadInstance {

  if (!config.appKey) {
    throw new Error('appKey is required')
  }

  // const instance = create(config) as UploadInstance

  const instance = createHttp({
    ...config,
    useEncrypt: false,
    useSign: false,
    commonHeaders: () => {
      const signBody = createSign({
        appId: appConfig.appId,
        merNoNo: appConfig.merNo,
        msgId: genMessageId(),
        random: randomNumber(15),
      }, config.appKey as string)
      return Promise.resolve({
        Authorization: config.getToken ? config.getToken() : null,
        encodeMethod: '1',
        signMethod: '1',
        appId: appConfig.appId,
        signBody
      })
    }
  }) as UploadInstance

  instance.upload = (
    url: string,
    uploadData: UploadData,
    uploadConfig: UploadConfig = {}
  ) => {
    let blob
    if ((uploadData as any).data) {
      blob = base64ToBlob((uploadData as any).data, (uploadData as any).mimeType)
    } else {
      blob = (uploadData as any).file
    }
    const { onUploadProgress, fileKey } = uploadConfig
    const formData = new FormData()
    formData.append(fileKey || 'file', blob, uploadConfig.fileName || 'image.jpg')
    return instance.post<any>(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: onUploadProgress || config.onUploadProgress
    })
  }
  return instance
}
