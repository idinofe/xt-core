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
