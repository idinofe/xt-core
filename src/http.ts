import { create, ApisauceConfig, ApisauceInstance, ResponseTransform, AsyncRequestTransform, ApiResponse, PROBLEM_CODE, RequestTransform, HEADERS } from 'apisauce'
import { AxiosRequestConfig, AxiosProgressEvent } from 'axios'
import { encrypt, decrypt, isEncryptedData, DataType, createSign, BaseObject } from 'decrypt-core'
import { isNormalObject, isDef, isString, randomNumber, genMessageId, promisify, isFunction, isFormData, isUndef, isPromise } from './common'
import { AppConfig } from './type'
import { base64ToBlob, MIME_TYPE } from './web'

/**
 * HTTP 自定义配置
 * 
 * @public
 */
export interface CustomConfig {
  // 不开启业务状态码转换
  noStatusTransform?: boolean
  // 判定状态码为无效 token 的钩子函数
  isInvalidToken?: (data: any, response: XApiResponse<any, any>) => boolean
  // 无效 token 的钩子函数
  onInvalidToken?: (response: XApiResponse<any, any>) => void
  // 不开启业务处理失败的校验
  noFail?: boolean
  // 业务处理失败的钩子函数
  onFail?: (msg: FailMessageType, response: XApiResponse<any, any>) => void
  // 是否对接口数据进行加密
  useEncrypt?: boolean
  // 是否对接口数据进行加签
  useSign?: boolean 
  // 加密方法版本（在 useEncrypt 为 true 时才生效）
  encryptVersion?: EncryptVersion
  // 加密秘钥（在 useEncrypt 为 true 时必传）
  appKey?: string
  /**
   * commonParams 基础参数与业务参数保持嵌套 
   * true | undefined: 保持嵌套在 body 下
   * false: 不嵌套 string: 签到在 nestBizData 下；
   * 默认：undefined；
   * 在 encryptVersion = '2' 时嵌套在 body 下，此配置无效
   */
  nestBizData?: boolean | string
  // 通用参数，会拼接到发送请求时传递的参数上
  commonParams?: (request: CustomAxiosRequestConfig) => Record<string, any> | Promise<Record<string, any>>
  // 通用 Header，自动拼接到 Header 上
  commonHeaders?: (request: CustomAxiosRequestConfig) => Record<string, any> | Promise<Record<string, any>>
}

/**
 * HTTP 上传配置
 * 
 * @internal
 */
interface UploadConfig<D = any> {
  /**
   * 文件名称
   */
  fileName?: string
  /**
   * 文件在FormData中的key
   */
  fileKey?: string
  /**
   * 上传进度回调钩子
   */
  onUploadProgress?: AxiosRequestConfig<D>['onUploadProgress']
}

/**
 * UploadRequestConfig
 * 
 * @internal
 */
type UploadRequestConfig = UploadConfig & CustomAxiosRequestConfig

/**
 * UploadData
 * 
 * @internal
 */
type UploadData = {
  data: string
  mimeType: MIME_TYPE
} | {
  file: Blob | File
}

/**
 * UploadInstance
 * 
 * @internal
 */
interface UploadInstance extends ApisauceInstance {
  upload: <T, U = T>(url: string, data: UploadData, config?: UploadRequestConfig) => Promise<XApiResponse<T, U>>
}

/**
 * Authorization
 * 
 * @internal
 */
type Authorization = string | undefined | null | (() => (string | undefined | null)) | (() => Promise<string | undefined | null>)

/**
 * 业务处理成功状态码
 * 
 * @public
 */
export const RETURN_CODE_SUCCESS = 'SUCCESS'
/**
 * 业务处理失败状态码
 * 
 * @public
 */
export const RETURN_CODE_FAIL = 'FAIL'

/**
 * ApiCheckResponse
 * 
 * @internal
 */
interface ApiCheckResponse {
  /**
   * 业务是否处理成功
   */
  success?: boolean
  /**
   * 业务状态码
   */
  code?: string
  /**
   * 业务成功/失败原因
   */
  msg?: string
}

/**
 * 数据加密版本
 * 
 * @public
 */
export const enum EncryptVersion {
  v1 = '1',
  v2 = '2'
}

/**
 * 业务失败类型
 * 
 * @public
 */
export type FailMessageType = PROBLEM_CODE | string | undefined

/**
 * XApiResponse
 * 
 * @public
 */
export type XApiResponse<T, U = T> = Pick<ApiResponse<T, U>, keyof ApiResponse<T, T>> & {
  config?: CustomAxiosRequestConfig
  success?: boolean
  code?: string
  msg?: string
}

// export type XApiRequest = 

/**
 * XRequestTransform
 * 
 * @public
 */
export type XRequestTransform = (request: AxiosRequestConfig, customConfig: CustomConfig) => void

/**
 * BaseTransform
 * 
 * @internal
 */
interface BaseTransform {
  (...args: any[]): any | Promise<any>
}

/**
 * 异步请求request转换钩子
 * 
 * @see ApiSauce
 * 
 * @public
 */
export type XAsyncRequestTransform = (request: AxiosRequestConfig, customConfig: CustomConfig) => Promise<void> | ((request: AxiosRequestConfig) => Promise<void>)

/**
 * 同步详情response转换钩子
 * 
 * @see ApiSauce
 * 
 * @public
 */
export type XResponseTransform = (response: XApiResponse<any>) => void

/**
 * HTTP 配置
 * 
 * @see {@link @dinofe/xt-core#ApisauceConfig | ApisauceConfig}
 * 
 * @see {@link @dinofe/xt-core#CustomConfig | CustomConfig}
 * 
 * @public
 */
export type HttpConfig = ApisauceConfig & CustomConfig

/**
 * 基础 HTTP 配置
 * 
 * @public
 */
export type BaseConfig = {
  /**
   * 是否加密
   * 
   * @defaultValue `false`
   * 
   * @public
   */
  encrypt: boolean,
  /**
   * 通用参数
   * 
   * @public
   */
  commonParams: Partial<Pick<AppConfig, 'appId' | 'merNo' | 'deviceId' | 'appKey'>>,
  /**
   * token
   * 
   * @public
   */
  authorization: string | null | (() => (string | null)) | (() => Promise<string | null>)
}

/**
 * UploadAppConfig
 * 
 * @public
 */
export type UploadAppConfig = Partial<Pick<AppConfig, 'appId' | 'merNo' | 'deviceId'> & { appKey: string }>

/**
 * 上传 HTTP 配置
 * 
 * @public
 */
export type UploadHttpConfig = Omit<HttpConfig, 'useEncrypt' | 'commonHeaders'> & { authorization?: Authorization, signKey?: string }

/**
 * 带有自定义配置项的AxiosConfig
 * 
 * @see AxiosRequestConfig
 * 
 * @see {@link @dinofe/xt-core#CustomConfig | CustomConfig}
 * 
 * @public
 */
export type CustomAxiosRequestConfig<D = any> = Omit<AxiosRequestConfig<D> & CustomConfig, 'url' | 'method' | 'data'>

/**
 * HTTP 实例
 * 
 * @privateRemarks 修改Apisauce导出实例的类型声明
 * 
 * @remarks
 * 
 * 1. 业务参数校验的transform修改了ApiResponse的属性，类型变成了XApiResponse
 *  'any' | 'get' | 'delete' | 'head' | 'post' | 'put' | 'patch' | 'link' | 'unlink'这些方法类型定义需要重写
 * 
 * 2. 示例对象post等方法的axiosConfig对象可覆盖创建示例对象时的config（除 'url' | 'method' | 'data' 之外）
 * 
 * @public
 */
export interface XApisauceInstance extends Omit<ApisauceInstance, 'any' | 'get' | 'delete' | 'head' | 'post' | 'put' | 'patch' | 'link' | 'unlink'> {
  /**
   * TODO: 未知
   * 
   * @see ApiSauce
   * 
   * @param config 
   * @returns 
   */
  any: <T, U = T>(config: CustomAxiosRequestConfig) => Promise<XApiResponse<T, U>>
  /**
   * 发送GET请求
   * @param url 
   * @param params 
   * @param axiosConfig 
   * @returns 
   */
  get: <T, U = T>(url: string, params?: {}, axiosConfig?: CustomAxiosRequestConfig) => Promise<XApiResponse<T, U>>
  /**
   * 发送DELETE请求
   * @param url 
   * @param params 
   * @param axiosConfig 
   * @returns 
   */
  delete: <T, U = T>(url: string, params?: {}, axiosConfig?: CustomAxiosRequestConfig) => Promise<XApiResponse<T, U>>
  /**
   * 发送HEAD请求
   * @param url 
   * @param params 
   * @param axiosConfig 
   * @returns 
   */
  head: <T, U = T>(url: string, params?: {}, axiosConfig?: CustomAxiosRequestConfig) => Promise<XApiResponse<T, U>>
  /**
   * 发送POST请求
   * @param url 
   * @param data 
   * @param axiosConfig 
   * @returns 
   */
  post: <T, U = T>(url: string, data?: any, axiosConfig?: CustomAxiosRequestConfig) => Promise<XApiResponse<T, U>>
  /**
   * 发送PUT请求
   * @param url 
   * @param data 
   * @param axiosConfig 
   * @returns 
   */
  put: <T, U = T>(url: string, data?: any, axiosConfig?: CustomAxiosRequestConfig) => Promise<XApiResponse<T, U>>
  /**
   * 发送PATCH请求
   * @param url 
   * @param data 
   * @param axiosConfig 
   * @returns 
   */
  patch: <T, U = T>(url: string, data?: any, axiosConfig?: CustomAxiosRequestConfig) => Promise<XApiResponse<T, U>>
  /**
   * 发送LINK请求
   * @param url 
   * @param params 
   * @param axiosConfig 
   * @returns 
   */
  link: <T, U = T>(url: string, params?: {}, axiosConfig?: CustomAxiosRequestConfig) => Promise<XApiResponse<T, U>>
  /**
   * 发送UNLINK请求
   * @param url 
   * @param params 
   * @param axiosConfig 
   * @returns 
   */
  unlink: <T, U = T>(url: string, params?: {}, axiosConfig?: CustomAxiosRequestConfig) => Promise<XApiResponse<T, U>>
}


/**
 * 给 XAsyncRequestTransform 包装一个自定义配置项 customConfig
 * 
 * @privateRemarks 此处导出只是为了进行单元测试
 * 
 * @param config CustomConfig
 * @param transform XAsyncRequestTransform
 * @returns XAsyncRequestTransform
 * 
 * @internal
 */
export const withCustomConfig = <T extends BaseTransform = XAsyncRequestTransform>(httpConfig: HttpConfig, transform: T): RequestTransform & AsyncRequestTransform => {
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
    nestBizData: httpConfig.nestBizData,
    commonParams: httpConfig.commonParams,
    commonHeaders: httpConfig.commonHeaders,
  }
  return (request: AxiosRequestConfig) => {
    return transform(request, config)
  }
}

/**
 * 加密
 * 
 * @privateRemarks 此处导出只是为了进行单元测试
 * 
 * @param request 
 * @param customConfig 
 * @returns 
 * 
 * @internal
 */
export const defaultEncryptTransform: XAsyncRequestTransform = async (request, customConfig) => {
  // console.log(request, customConfig)
  const useEncrypt = customConfig.useEncrypt
  const encryptVersion = customConfig.encryptVersion || EncryptVersion.v2
  const appKey = customConfig.appKey
  const useSign = !!customConfig.useSign

  if (!useEncrypt) {
    // console.log('未开启加密，不做处理')
    return
  }

  if (useEncrypt && !appKey) {
    throw new Error('appKey is required when useEncrypt is true')
  }

  if (useEncrypt && ![EncryptVersion.v1, EncryptVersion.v2].includes(encryptVersion)) {
    throw new Error('encryptVersion should be one of EncryptVersion when useEncrypt is true')
  }

  if (useEncrypt && encryptVersion === EncryptVersion.v2 && !request.data.body) {
    throw new Error('request.data.body should exist when encryptVersion = "2"')
  }

  const encryptV1 = <T = any>(data: T, key: string, useSign: boolean): T => {
    if (typeof data === 'undefined') {
      return data
    }
    const ed = encrypt(data as DataType, key)
    return ed as T
  }

  const encryptV2 = <T = any>(data: T, key: string, useSign: boolean): T => {
    if (typeof data === 'undefined') {
      return data
    }
    const ed = encrypt(data as DataType, key)
    return ed as T
  }

  // TODO: 补充验签测试用例
  const ed = encryptVersion === EncryptVersion.v1
    ? encryptV1<string>(request.data, appKey as any, useSign)
    : encryptV2<BaseObject>(request.data.body, appKey as any, useSign)

  if (encryptVersion === EncryptVersion.v1) {
    if (request.headers) {
      (request.headers as any).encodeMethod = '1';
      (request.headers as any).signMethod = '1';
      if (useSign) {
        // TODO: sign是根据原始数据计算还是ed计算？
        (request.headers as any).sign = createSign(request.data, appKey as any)
      }
    }
    request.data = ed as string
  } else if (encryptVersion === EncryptVersion.v2) {
    let data: any = {
      ...request.data,
      body: ed,
      encodeMethod: '1',
    }
    if (useSign) {
      data.signMethod = '1'
      data.sign = createSign(data, appKey as any)
    }
    request.data = data
  }
}

/**
 * 公共参数转换
 * 
 * @privateRemarks 此处导出只是为了进行单元测试
 * 
 * @param request 
 * @param customConfig 
 * 
 * @internal
 */
export const defaultCommonParamsTransform: XAsyncRequestTransform = async (request, customConfig) => {
  const commonParams = customConfig.commonParams || function () { return {} }
  const useEncrypt = customConfig.useEncrypt
  const encryptVersion = customConfig.encryptVersion || EncryptVersion.v2
  const nestBizData = customConfig.nestBizData

  const promise = promisify(commonParams(request))
  const params = await promise

  const appendParams = (data: FormData | BaseObject, params: BaseObject) => {
    if (isFormData(data)) {
      let paramsStr = JSON.stringify(params)
      if (!['{}', '[]', '""', 'null', 'undefined'].includes(paramsStr)) {
        if (data.has('params')) {
          console.warn('FormData 中已有 params 字段，commonParams 将被忽略')
        } else {
          data.append('params', JSON.stringify(params))
        }
      }
      return data
    }
    return {
      ...params,
      ...data,
    }
  }

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
    // 不加密
    if (
      (nestBizData === true || nestBizData === undefined)
      && isFormData(request.data)
    ) {
      request.data = appendParams(request.data, params)
    } else {
      request.data = nestBizData === false
        ? appendParams(request.data, params)
        : {
          ...params,
          [isString(nestBizData) ? nestBizData as string : 'body']: request.data,
        }
    }
  }
}

/**
 * 公共头部转换
 * 
 * @privateRemarks 此处导出只是为了进行单元测试
 * 
 * @param request 
 * @param customConfig 
 * @returns 
 * 
 * @internal
 */
export const defaultCommonHeadersTrasform: XAsyncRequestTransform = async (request, customConfig) => {
  const commonHeaders = customConfig.commonHeaders

  if (!commonHeaders) {
    return
  }

  const promise = promisify(commonHeaders(request))
  const params = await promise
  const headerKeys = Object.keys(params)

  if (request.headers !== null && request.headers !== undefined) {
    headerKeys.forEach(key => {
      (request.headers as any)[key] = (params as any)[key]
    })
  }
}

/**
 * 解密
 * 
 * @privateRemarks
 * 此处导出只是为了进行单元测试
 * 
 * 1. 对接口返回的数据进行解密
 * 
 * 2. 根据config配置项决定解密行为，config是createHttp时传入的配置
 * 
 * 3. 不抛出错误阻塞后续逻辑
 * 
 * @param response 
 * @returns 
 * 
 * @internal
 */
export const defaultDecryptTransform: XResponseTransform = (response) => {
  // console.log('defaultDecryptTransform', response)
  const config = getCustomConfig(response) as CustomAxiosRequestConfig
  if (!config || !config.useEncrypt) { return }

  const encryptVersion = config.encryptVersion || EncryptVersion.v2
  const appKey = config.appKey as string
  let data = response.data

  if (config.useEncrypt && ![EncryptVersion.v1, EncryptVersion.v2].includes(encryptVersion as any)) {
    console.error('加密数据版本配置错误，不作处理')
    return
  }

  if (!appKey) {
    console.error('秘钥 appKey 未配置，不作处理')
    return
  }
  
  if (encryptVersion === EncryptVersion.v1) {
    if (isDef(data) && isString(data)) {
      data = data.replaceAll('"', '') // V1 协议返回的密文数据头尾包含引号，需要去掉再解密
    }
    if (!isEncryptedData(data)) {
      console.error('返回数据非加密数据格式，不作处理')
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
      // TODO: 如何判断解密是否成功、失败了如何处理
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
      // TODO: 如何判断解密是否成功、失败了如何处理
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
 * 校验业务状态成功与否
 * 
 * @privateRemarks
 * 
 * 此处导出只是为了单元测试
 * 
 * 校验业务状态是否为成功，成功则会给response.data添加success=true,code和msg
 * 
 * 1. returnCode 的取值顺序：Headers -> response.data
 * 
 * 2. returnDes 的取值顺序：Headers -> response.data
 * 
 * @param response {ApiResponse<any, any>}
 * 
 * @internal
 */
export const defaultResponseTransform: XResponseTransform = (response) => {
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

/**
 * 判断业务状态码是否是token失效
 * 
 * @privateRemarks 此处导出只是为了单元测试
 * 
 * @param data 
 * @param response 
 * @returns {boolean}
 * 
 * @internal
 */
export const defaultIsInvalidToken = (data: any, response?: XApiResponse<any, any>): boolean => {
  return !!(data && data.returnCode === 'INVALID_TOKEN')
}

/**
 * token失效校验
 * 
 * @privateRemarks 此处导出只是为了单元测试
 * 
 * @param response 
 * @returns 
 * 
 * @internal
 */
export const defaultTokenCheckTransform: XResponseTransform = (response) => {
  if (!response.ok || !response.data) { return }

  // 判断是否有传递isInvalidToken，没有则使用默认的defaultIsInvalidToken
  const config = getCustomConfig(response) as CustomAxiosRequestConfig
  let invalid = false
  if (!config.isInvalidToken || !isFunction(config.isInvalidToken)) {
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
      console.warn('token invalid onInvalidToken not found')
    }
  }
}

/**
 * 业务状态码失败时 Toast 提示
 * 
 * @privateRemarks 此处导出只是为了单元测试
 * 
 * @param response 
 * @returns 
 * 
 * @internal
 */
export const defaultFailTransform: ResponseTransform = (response) => {
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

/**
 * 获取传递的自定义配置
 * 
 * @privateRemarks 此处导出只是为了单元测试
 * 
 * @param response 
 * @returns 
 * 
 * @internal
 */
export const getCustomConfig = (response: XApiResponse<any, any>) => {
  return response.ok ? response.config as CustomAxiosRequestConfig : null
}

/**
 * 根据配置创建 HTTP 实例
 * 
 * @param config {HttpConfig} - 配置项
 * @returns  {ApisauceInstance} 返回 HTTP 实例
 * 
 * @example
 * 简单示例一：
 * ```ts
 * import { createHttp } from '@dinofe/xt-core/http'
 * const http = createHttp({
 *  baseURL: '/api-abc',
 *  useEncrypt: true,
 *  useSign: true,
 *  appKey: '3a2e424c56754e90a8948b74f163f0cb',
 *  encryptVersion: '2',
 *  commonParams: () => ({
 *    appId: '3130042001040',
 *    deviceId: 'xxx_h5',
 *    merNoNo: '130042001040'
 *  }),
 *  onFail: (msg) => {
 *    log(msg)
 *  },
 *  onInvalidToken: (res) => {
 *    log('Token已失效', res.code, res.msg)
 *  }
 * })
 * http.post('/user/bankQuickLogin', { openid: '1652454242' }).then(res => { console.log(res) })
 * ```
 * 
 * @public
 */
export function createHttp(config: HttpConfig): XApisauceInstance {
  const instance = create(config)
  instance.addAsyncRequestTransform(withCustomConfig(config, defaultCommonParamsTransform))
  instance.addAsyncRequestTransform(withCustomConfig(config, defaultCommonHeadersTrasform))
  config.useEncrypt && instance.addAsyncRequestTransform(withCustomConfig(config, defaultEncryptTransform))
  config.useEncrypt && instance.addResponseTransform(defaultDecryptTransform)
  instance.addResponseTransform(defaultTokenCheckTransform)
  !config.noFail && instance.addResponseTransform(defaultFailTransform)
  !config.noStatusTransform && instance.addResponseTransform(defaultResponseTransform)
  return instance as XApisauceInstance
}

/**
 * 创建基础 HTTP 实例
 * 
 * @param baseConfig {BaseConfig} 基础配置
 * @param config {HttpConfig} 通用配置
 * @returns {XApisauceInstance} 返回 HTTP 实例
 * 
 * @example
 * 简单示例一：
 * ```ts
 * import { createBaseHttp } from '@dinofe/xt-core/http'
 * const baseHttp = createBaseHttp({
 *   encrypt: true,
 *   commonParams: {
 *     appId: '3130042001040',
 *     merNo: '130042001040',
 *     deviceId: 'hbjh_h5'
 *   }
 * }, {
 *   baseURL: '/api-hbccb',
 *   appKey: '3a2e424c56754e90a8948b74f163f0cb',
 *   onFail: (msg) => {
 *     log(msg)
 *   },
 *   onInvalidToken: (res) => {
 *     log('Token已失效', res.code, res.msg)
 *   }
 * })
 * 
 * http.post('/user/bankQuickLogin', { openid: '1652454242' }).then(res => { console.log(res) })
 * ```
 * 
 * @public
 */
export function createBaseHttp(baseConfig: BaseConfig, config: HttpConfig): XApisauceInstance {
  if (isUndef(baseConfig)) {
    throw new Error('baseConfig is required')
  }
  const { encrypt, commonParams = {}, authorization } = baseConfig
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
 * 创建上传文件 HTTP 实例（Web 环境）
 * 
 * @remarks
 * 注意：
 * 
 * 1. 使用了 FormData，故只能在 web 环境使用
 * 
 * 2. 返回值是 UploadInstance 实例，建议只使用其 upload 方法，
 *  ApisauceInstance 实例提供的其他发请求方法不要使用，可能导
 *  致错误逻辑
 * 
 * @platform web
 * @param appConfig {AppConfig}
 * @param config {ApiSauceConfig}
 * @returns {UploadInstance}
 * 
 * @public
 */
export function createUploadHttp(
    appConfig: UploadAppConfig,
    config: UploadHttpConfig = { baseURL: '' }
  ): UploadInstance {

  if (isUndef(appConfig)) {
    throw new Error('appConfig is required')
  }
  
  // config.appKey 优先
  const appKey = config.appKey || appConfig.appKey
  const useSign = config.useSign === true
  // TODO: 需要判断 signKey 是否和现有headers重复吗？
  const signKey = isString(config.signKey) && config.signKey ? config.signKey : 'signBody'

  if (!appKey) {
    throw new Error('appKey is required')
  }

  const instance = createHttp({
    ...config,
    useEncrypt: false,
    useSign,
    nestBizData: false,
    commonHeaders: async () => {
      let authorization = null
      if (isFunction(config.authorization)) {
        authorization = await promisify((config.authorization as any)())
      } else if (isPromise(config.authorization)) {
        authorization = await config.authorization
      } else {
        authorization = config.authorization
      }
      if (useSign) {
        const signBody = createSign({
          appId: appConfig.appId,
          merNoNo: appConfig.merNo,
          msgId: genMessageId(),
          random: randomNumber(15),
        }, appKey)
        return {
          Authorization: authorization,
          encodeMethod: '1',
          signMethod: '1',
          appId: appConfig.appId,
          [signKey]: signBody
        }
      } else {
        return {
          Authorization: authorization,
          encodeMethod: '1',
          signMethod: '1',
          appId: appConfig.appId,
        }
      }
    }
  }) as UploadInstance

  instance.upload = (
    url: string,
    uploadData: UploadData,
    uploadConfig: UploadRequestConfig = {}
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

    // config uploadConfig都合并到axiosRequestConfig，保证 instance.upload 实例方法调用时有机会覆盖 config
    const axiosRequestConfig = {
      ...config,
      ...uploadConfig,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: onUploadProgress || config.onUploadProgress
    }

    return instance.post<any>(url, formData, axiosRequestConfig)
  }
  return instance
}
