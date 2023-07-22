import _Big from 'big.js'

import type TBig from 'big.js'

export const Big = _Big

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
 * 是否为 Promise 对象
 * @param a {any}
 * @returns {boolean}
 */
export const isPromise = (a: any): boolean => {
  return typeof a === 'object' && a !== null && isFunction(a.then)
}

/**
 * 是否为函数
 * @param a {any}
 * @returns {boolean}
 */
export const isFunction = (a: any): boolean => {
  return Object.prototype.toString.call(a) === '[object Function]'
}

/**
 * 是否为普通对象
 * @param a {any}
 * @returns {boolean}
 */
export const isNormalObject = (a: any): boolean => {
  return Object.prototype.toString.call(a) === '[object Object]'
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

/**
 * 将科学计数法的数字转为字符串
 * 说明：运算精度丢失方法中处理数字的时候，如果出现科学计数法，就会导致结果出错
 * 4.496794759834739e-9  ==> 0.000000004496794759834739
 * 4.496794759834739e+9  ==> 4496794759.834739
 * @param {number} num 待转换值
 */
export const toNonExponential = (num: number): null | string => {
  if (num == null) {
    return num
  }
  if (typeof num !== 'number') {
    return num
  }
  var m = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/)
  if (m == null) {
    return null
  }
  return num.toFixed(Math.max(0, (m[1] || '').length - Number(m[2])))
}

/**
 * 两浮点数相乘（修复了 js 乘法精度丢失问题）
 * @param {number | string} arg1 浮点数 1
 * @param {number | string} arg2 浮点数 2
 */
export const floatMultiply = (arg1: number | string, arg2: number | string): null | number => {
  if(arg1 === null || arg2 === null) {
    return null
  }
  arg1 = Number(arg1)
  arg2 = Number(arg2)
  if (Number.isNaN(arg1) || Number.isNaN(arg2)) {
    return null
  }
  arg1 = toNonExponential(arg1) as any
  arg2 = toNonExponential(arg2) as any
  if (arg1 == null || arg2 == null) {
    return null
  }
  var n1, n2
  var r1, r2 // 小数位数
  try {
    r1 = arg1.toString().split('.')[1].length
  } catch (e) {
    r1 = 0
  }
  try {
    r2 = arg2.toString().split('.')[1].length
  } catch (e) {
    r2 = 0
  }
  n1 = Number(arg1.toString().replace('.', ''))
  n2 = Number(arg2.toString().replace('.', ''))
  return n1 * n2 / Number(Math.pow(10, r1 + r2).toFixed(2))
}

/**
 * 两浮点数相除（修复了 js 除法精度丢失问题）
 * @param {string | number} arg1 被除数
 * @param {string | number} arg2 除数
 */
export const floatDivide = (arg1: string | number, arg2: string | number): null | number => {
  arg1 = Number(arg1)
  arg2 = Number(arg2)
  if (!arg2) {
    return null
  }
  if (!arg1 && arg1 !== 0) {
    return null
  } else if (arg1 === 0) {
    return 0
  }
  arg1 = toNonExponential(arg1) as any
  arg2 = toNonExponential(arg2) as any
  if (arg1 == null || arg2 == null) {
    return null
  }
  var n1, n2
  var r1, r2 // 小数位数
  try {
      r1 = arg1.toString().split('.')[1].length
  } catch (e) {
      r1 = 0
  }
  try {
      r2 = arg2.toString().split('.')[1].length
  } catch (e) {
      r2 = 0
  }
  n1 = Number(arg1.toString().replace('.', ''))
  n2 = Number(arg2.toString().replace('.', ''))
  const result = floatMultiply((n1 / n2), Math.pow(10, r2 - r1))
  return result
  // return (n1 / n2) * Math.pow(10, r2 - r1);   // 直接乘法还是会出现精度问题
}

/**
 * 两浮点数相乘（修复了 js 乘法精度丢失问题）
 * 基于 big.js 实现
 * @param arg1 数字 1
 * @param arg2 数字 2
 * @returns Big
 */
export const times = (arg1: number | string | TBig, arg2: number | string | TBig): TBig => {
  return new Big(arg1).times(arg2)
}

export const multiply = times

/**
 * 两浮点数相除（修复了 js 除法精度丢失问题）
 * 基于 big.js 实现
 * @param arg1 被除数
 * @param arg2 除数
 * @returns Big
 */
export const div = (arg1: number | string | TBig, arg2: number | string | TBig): TBig => {
  return new Big(arg1).div(arg2)
}

export const divide = div

/**
 * 两数相加（修复了 js 加法精度丢失问题）
 * 基于 big.js 实现
 * @param arg1 {string | number} arg1 加数 1
 * @param arg2 {string | number} arg2 加数 2
 * @returns Big
 */
export const plus = (arg1: string | number | TBig, arg2: string | number | TBig): TBig => {
  return new Big(arg1).plus(arg2)
}

/**
 * 两数相减（修复了 js 减法精度丢失问题）
 * 基于 big.js 实现
 * @param arg1 {string | number} arg1 减数 1
 * @param arg2 {string | number} arg2 减数 2
 * @returns Big
 */
export const minus = (arg1: string | number | TBig, arg2: string | number | TBig): TBig => {
  return new Big(arg1).minus(arg2)
}
