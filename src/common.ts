/**
 * 核心库通用公共方法
 */

/**
 * 是否为有效的值
 * @param a {any}
 * @returns {boolean}
 */
export const isDef = (a: any): boolean => {
  return typeof a !== 'undefined' && a !== undefined && a !== null
}

/**
 * 是否为字符串
 * @param a {any}
 * @returns {boolean}
 */
export const isString = (a: any): boolean => {
  return typeof a === 'string'
}

/**
 * 判断给定的 URI 是否是 URIEncode 过的
 * @param url 输入 URL
 * @returns 是否encoded过的 URI
 */
export const isEncodeURILike = (url: string): boolean => {
  const reg = /%(\d)+/g
  const res = reg.test(url)
  return res
}

/**
 * 校验字符串是否是 URL 链接
 * @param url 任意字符串
 * @returns 是否是 URL 链接
 */
export const isUrlLike = (url: string): boolean => {
  const reg = /^http(s):\/\/?/
  return reg.test(url)
}

/**
 * 校验字符串是否是 URL.createObjectURL 返回的 blob 链接
 * @param url 任意字符串
 * @returns 是否是类似 blob 的链接
 */
export const isBlobUrlLike = (url: string): boolean => {
  const reg = /^blob:/ // TODO:
  return reg.test(url)
}

/**
 * 空函数
 */
export const noop = () => {}
