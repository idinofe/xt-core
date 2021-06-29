/**
 * 微信业务相关工具方法
 * 提供功能有：
 * 1.根据应用的domain、appid等拼接用于微信oAuth的redirect_url
 * 2.根据微信APPID、第三方商户APPID、授权域scope等拼接微信oAuth地址
 */

import { isEncodeURILike } from './common'
import { AppConfig } from './type'

export enum WxScope {
  snsapi_base = 'snsapi_base',
  snsapi_info = 'snsapi_info'
}



export type RedirectUrlConfig = {
  appendHtml?: boolean
  https?: boolean
}

export type WechatOption = {
  wx_appid: string
  wx_component_appid: string
  wx_scope: WxScope
  redirect_url: string
  response_type?: string
  state?: string
  hash?: string
}

export type WechatBaseConfig = {
  
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
