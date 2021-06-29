/**
 * 核心库通用公共方法
 */

/**
 * 是否为有效的值
 * @param a any
 * @returns boolean
 */
export const isDef = (a: any) => {
  return typeof a !== 'undefined' && a !== undefined && a !== null
}

/**
 * 判断给定的 URI 是否是 URIEncode 过的
 * @param url 输入 URL
 * @returns 是否encoded过的 URI
 */
export const isEncodeURILike = (url: string): Boolean => {
  const reg = /%(\d)+/g
  const res = reg.test(url)
  return res;
}
