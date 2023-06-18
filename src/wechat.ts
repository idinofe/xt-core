/**
 * 微信业务相关工具方法
 * 提供功能有：
 * 1.根据应用的domain、appid等拼接用于微信oAuth的redirect_url
 * 2.根据微信APPID、第三方商户APPID、授权域scope等拼接微信oAuth地址
 */

import qs from 'qs' // 需要 ts 处理类型导入问题：https://zhuanlan.zhihu.com/p/148081795
import { isEncodeURILike, isString } from './common'
import { AppConfig } from './type'

export enum WxScope {
  snsapi_base = 'snsapi_base',
  snsapi_userinfo = 'snsapi_userinfo'
}

export type BooelanString = 'true' | 'false'

export type RedirectUrlConfig = {
  appendHtml?: boolean
  https?: boolean
}

export type WechatOption = {
  wx_appid: string
  wx_component_appid?: string
  wx_scope: WxScope
  redirect_url: string
  response_type?: string
  state?: string
  hash?: string
  forcePopup?: BooelanString
}

export type WechatBaseConfig = {
  
}

export type DecodeOAuthUrlResponse = {
  valid: boolean,
  data: null | WechatOption
}

/**
 * 根据配置生成encode编码好的url地址
 * @param {AppConfig} options 配置
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
 * @param {WechatOption} options 配置
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
 * @param url oAuth 链接
 * @returns {DecodeOAuthUrlResponse} 微信相关配置参数
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
