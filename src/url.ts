/**
 * url地址相关工具方法
 * 1.拼接接口业务域名
 * 2.拼接图片基础域名
 */

import { AppConfig } from './type'

export type BasicUrlConfig = Partial<AppConfig>

/**
 * 判断是否是URL（//开头地址判断为是）
 * @param url URL
 */
function isUrl(url: string) {
  const regs = [/^\/\//, /^http(s)?:/]
  const valid = regs.some(reg => reg.test(url))
  return valid
}

/**
 * 去尾部/
 * @param {String} url URL
 */
function trim(url: string) {
  if (!url) { return url }
  if (url.endsWith('/')) {
    url = url.slice(0, -1)
    trim(url)
  }
  return url
}

/**
 * 拼接接口业务域名
 * @param {String} basicUrl 基础路径
 * @param {String} url 相对路径（不以/开头）
 */
export const appendBaiscUrl = (basicUrl: string, url: string) => {
  if (!isUrl(url) || !basicUrl) {
    return url
  }
  return `${trim(basicUrl)}/${url}`
}

/**
 * 拼接图片基础域名
 * @param imgBasicUrl 基础路径
 * @param url 相对路径（不以/开头）
 */
export const appendImageUrl = (imgBasicUrl: string, url: string) => {
  if (!isUrl(url) || !imgBasicUrl) {
    return url
  }
  return `${trim(imgBasicUrl)}/${url}`
}
