/**
 * 微信业务相关工具方法
 */

import qs from 'qs' // 需要 ts 处理类型导入问题：https://zhuanlan.zhihu.com/p/148081795
import { isEncodeURILike, isString } from './common'
import { AppConfig } from './type'

/**
 * 微信授权scope
 * 
 * @see {@link https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html#%E5%85%B3%E4%BA%8E%E7%BD%91%E9%A1%B5%E6%8E%88%E6%9D%83%E7%9A%84%E4%B8%A4%E7%A7%8Dscope%E7%9A%84%E5%8C%BA%E5%88%AB%E8%AF%B4%E6%98%8E | 关于网页授权的两种scope的区别说明}
 * 
 * @public
 */
export enum WxScope {
  snsapi_base = 'snsapi_base',
  snsapi_userinfo = 'snsapi_userinfo'
}

/**
 * BooelanString
 * 
 * @public
 */
export type BooelanString = 'true' | 'false'

/**
 * RedirectUrlConfig
 * 
 * @public
 */
export type RedirectUrlConfig = {
  /**
   * 链接最后是否需要拼接 `index.html`
   * 
   * @public
   */
  appendHtml?: boolean
  /**
   * 链接协议是否是 https，默认使用 http
   * 
   * @public
   */
  https?: boolean
}

/**
 * WechatOption
 * 
 * @public
 */
export type WechatOption = {
  /**
   * 微信APPID
   * 
   * @public
   */
  wx_appid: string
  /**
   * 微信三方平台APPID
   * 
   * @public
   */
  wx_component_appid?: string
  /**
   * 微信授权scope
   * 
   * @see {@link @dinofe/xt-core#WxScope | WxScope}
   * 
   * @public
   */
  wx_scope: WxScope
  /**
   * 重定向URL
   * 
   * @public
   */
  redirect_url: string
  /**
   * 返回类型
   * 
   * @defaultValue `'code'`
   * 
   * @public
   */
  response_type?: string
  /**
   * state
   * 
   * @defaultValue `'0'`
   * 
   * @public
   */
  state?: string
  /**
   * hash
   * 
   * @defaultValue `'#wechat_redirect'`
   * 
   * @public
   */
  hash?: string
  /**
   * forcePopup
   * 
   * @public
   */
  forcePopup?: BooelanString
}

/**
 * WechatBaseConfig
 * 
 * @public
 */
export type WechatBaseConfig = {
  
}

/**
 * DecodeOAuthUrlResponse
 * 
 * @public
 */
export type DecodeOAuthUrlResponse = {
  valid: boolean,
  data: null | WechatOption
}

/**
 * 根据配置生成encode编码好的url地址
 * 
 * @see {@link https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html#%E5%BC%80%E5%8F%91%E5%89%8D%E5%BF%85%E8%AF%BB | 网页授权}
 * 
 * @param options - 配置
 * @returns url链接
 * 
 * @public
 */
export const genRedirectUrl = (options: AppConfig & RedirectUrlConfig) => {
  if (!options) {
    throw new TypeError('options is required')
  }
  const {
    domain,
    indexDoc,
    https = true,
    appendHtml = false
  } = options
  const protocol = https ? 'https://' : 'http://'
  const affix = appendHtml ? '/index.html' : ''
  let url = `${domain}/${indexDoc}/${affix}`
  url = url.replace(/\/\/+/g, '\/')
  url = protocol + url
  return encodeURIComponent(url)
}

/**
 * 根据配置生成带有微信oAuth的链接
 * 
 * @param options - 配置
 * @returns url链接
 * 
 * @see {@link https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html#%E5%BC%80%E5%8F%91%E5%89%8D%E5%BF%85%E8%AF%BB | 网页授权}
 * 
 * @public
 */
export const genOAuthUrl = (options: WechatOption) => {
  const {
    wx_appid,
    wx_component_appid,
    wx_scope,
    response_type = 'scope',
    state = '0',
    hash = '#wechat_redirect'
  } = options
  let { redirect_url } = options
  if (!isEncodeURILike(redirect_url)) {
    redirect_url = encodeURIComponent(redirect_url)
  }
  const url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${wx_appid}&redirect_url=${redirect_url}&response_type=${response_type}&scope=${wx_scope}&state=${state}&component_appid=${wx_component_appid}${hash}`
  return url
}

/**
 * 解析微信 oAuth 链接中的配置参数
 * 
 * @param url - oAuth 链接
 * @returns 微信相关配置参数
 * 
 * @public
 */
export const decodeOAuthUrl = (url: string): DecodeOAuthUrlResponse => {
  if (!isString(url)) {
    return {
      valid: false,
      data: null
    }
  }
  const slices = url.split('?')
  
  if (slices.length !== 2) {
    return {
      valid: false,
      data: null
    }
  }

  // 末尾必须包含#wechat_redirect
  if (!/#wechat_redirect$/.test(slices[1])) {
    return {
      valid: false,
      data: null
    }
  }

  const _url = slices[1].replace('#wechat_redirect', '')
  
  const parsed = qs.parse(_url, { depth: 1, allowDots: false })
  // hash 必须为 #wechat_redirect
  if (!parsed.appid || !parsed.redirect_uri || !parsed.response_type || !parsed.scope) {
    // console.log(1)
    return {
      valid: false,
      data: parsed as any
    }
  }
  if (typeof parsed.appid !== 'string' || typeof parsed.redirect_uri !== 'string'
      || typeof parsed.response_type !== 'string' || typeof parsed.scope !== 'string') {
    // console.log(2)
    return {
      valid: false,
      data: parsed as any
    }
  }
  if (parsed.scope !== WxScope.snsapi_base && parsed.scope !== WxScope.snsapi_userinfo) {
    // console.log(3)
    return {
      valid: false,
      data: parsed as any
    }
  }
  const wechatOption: WechatOption = {
    wx_appid: parsed.appid,
    redirect_url: parsed.redirect_uri,
    response_type: parsed.response_type,
    wx_scope: parsed.scope,
    hash: '#wechat_redirect',
  }
  if (parsed.state) {
    wechatOption.state = parsed.state as string
  }
  if (parsed.forcePopup) {
    wechatOption.forcePopup = parsed.forcePopup as BooelanString
  }
  return {
    valid: true,
    data: wechatOption
  }
}
