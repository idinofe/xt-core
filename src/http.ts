import { create, ApisauceConfig, ApisauceInstance, ResponseTransform, ApiResponse } from 'apisauce'
import { AxiosRequestConfig } from 'axios'

interface CustomConfig {
  noStatusTransform?: boolean // 不开启业务状态码转换
  isInvalidToken?: (data: any) => boolean // 判定状态码为无效 token 的钩子函数
  onInvalidToken?: (response: ApiResponse<any, any>) => void // 无效 token 的钩子函数
  noFail?: boolean // 不开启业务处理失败的校验
  onFail?: (msg: string, response: ApiResponse<any, any>) => void // 业务处理失败的钩子函数
}

export type HttpConfig = ApisauceConfig & CustomConfig

export type CustomAxiosRequestConfig = AxiosRequestConfig & CustomConfig

/**
 * 校验业务状态是否为成功，成功则会给response.data添加success=true，以及 code 和 msg
 * @param response ApiResponse<any, any>
 */
const defaultResponseTransform: ResponseTransform = (response) => {
  const data = response.data
  if (data) {
    response.data.success = data.returnCode === 'SUCCESS'
    response.data.code = data.returnCode
    response.data.msg = data.returnDes
  }
}

const defaultIsInvalidToken = (data: any): boolean => {
  return data.returnCode === 'INVALID_TOKEN'
}

const defaultTokenCheckTransform: ResponseTransform = (response) => {
  if (!response.ok || !response.data) { return }

  // 判断是否有传递isInvalidToken，没有则使用默认的defaultIsInvalidToken
  const config = getCustomConfig(response) as CustomAxiosRequestConfig
  let invalid = false
  if (!config.isInvalidToken) {
    invalid = defaultIsInvalidToken(response.data)
  } else {
    invalid = config.isInvalidToken(response.data)
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

const getCustomConfig = (response: ApiResponse<any, any>) => {
  return response.ok ? response.config as CustomAxiosRequestConfig : null
}

/**
 * 根据配置创建 API 实例
 * @param config HttpConfig
 * @returns ApisauceInstance
 */
export function createHttp(config: HttpConfig): ApisauceInstance {
  let instance = create(config)
  instance.addResponseTransform(defaultTokenCheckTransform)
  !config.noFail && instance.addResponseTransform(defaultFailTransform)
  !config.noStatusTransform && instance.addResponseTransform(defaultResponseTransform)
  return instance
}
