/**
 * 基础公共方法（纯JS方法不依赖于执行环境）
 */

import _Big from 'big.js'
import type TBig from 'big.js'

/**
 * @see {@link big.js#Big | Big}
 */
export const Big = _Big

/**
 * 是否为有效的值
 * 
 * @remarks 非 undefined | 'undefined' | null
 * 
 * @param a {any} 待校验的数据
 * @returns {boolean} 判断结果
 * 
 * @public
 */
export function isDef (a: any): boolean {
  return typeof a !== 'undefined' && a !== undefined && a !== null
}

/**
 * 是否为未定义
 * 
 * @remarks 是否是 undefiend | null
 * 
 * @param a {any} 待校验的数据
 * @returns {boolean} 判断结果
 * 
 * @public
 */
export function isUndef (a: any): boolean {
  return typeof a === 'undefined' || a === null
}

/**
 * 字符串是否以'/'结尾
 * 
 * @param a {string} 待校验的数据
 * @returns {boolean} 判断结果
 * 
 * @public
 */
export function isEndWithSlash (a: string): boolean {
  if (!isString(a)) {
    throw new Error('param is not string')
  }
  return /\/$/.test(a)
}

/**
 * 字符串是否以'/'开头
 * 
 * @param a {string} 待校验的数据
 * @returns {boolean} 判断结果
 * 
 * @public
 */
export function isStartWithSlash (a: string): boolean {
  if (!isString(a)) {
    throw new Error('param is not string')
  }
  return /^\//.test(a)
}

/**
 * 是否为字符串
 * 
 * @param a {any} 待校验的数据
 * @returns {boolean} 判断结果
 * 
 * @public
 */
export function isString (a: any): boolean {
  return typeof a === 'string'
}

/**
 * 是否为有效 {@link https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Number | Number}
 * @param a {any} 待校验的数据
 * @returns {boolean} 判断结果
 * 
 * @public
 */
export function isNumber (a: any): boolean {
  return typeof a === 'number' && !Number.isNaN(a)
}

/**
 * 是否为 {@link https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise | Promise} 对象
 * 
 * @param a {any} 待校验的数据
 * @returns {boolean} 判断结果
 * 
 * @public
 */
export function isPromise (a: any): boolean {
  return typeof a === 'object' && a !== null && isFunction(a.then)
}

/**
 * 是否为函数
 * 
 * @param a {any} 待校验的数据
 * @returns {boolean} 判断结果
 * 
 * @public
 */
export function isFunction (a: any): boolean {
  return ['[object Function]', '[object AsyncFunction]'].includes(Object.prototype.toString.call(a))
}

/**
 * 是否为 {@link https://developer.mozilla.org/zh-CN/docs/Web/API/FormData | FormData} 对象
 * 
 * @param a {any} 待校验的数据
 * @returns {boolean} 判断结果
 * 
 * @public
 */
export function isFormData (a: any): boolean {
  return '[object FormData]' === Object.prototype.toString.call(a)
}

/**
 * 是否为普通对象
 * 
 * @remarks 看 toString 是否是 '[object Object]'
 * 
 * @param a {any} 待校验的数据
 * @returns {boolean} 判断结果
 * 
 * @public
 */
export function isNormalObject (a: any): boolean {
  return Object.prototype.toString.call(a) === '[object Object]'
}

/**
 * 判断给定的 URI 是否是 {@link https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/encodeURI | URIEncode} 过的
 * @param url {string} 输入 URL
 * @returns {boolean} 是否 encoded 过的 URI
 * 
 * @public
 */
export function isEncodeURILike (url: string): boolean {
  const reg = /%(\d)+/g
  const res = reg.test(url)
  return res
}

/**
 * 校验字符串是否是 URL 链接
 * 
 * @remarks 是以 http 或 https 开头
 * 
 * @param url {string} 任意字符串
 * @returns {boolean} 是否是 URL 链接
 * 
 * @public
 */
export function isUrlLike (url: string): boolean {
  const reg = /^http(s*):\/\/?/
  return reg.test(url)
}

/**
 * 校验字符串是否是 {@link https://developer.mozilla.org/zh-CN/docs/Web/API/URL/createObjectURL_static | URL.createObjectURL} 返回的链接
 * 
 * @param url {string} 任意字符串
 * @returns {boolean} 是否是类似 blob 的链接
 * 
 * @public
 */
export function isBlobUrlLike (url: string): boolean {
  const reg = /^blob:/ // TODO:
  return reg.test(url)
}

/**
 * 转换为已 resolved 的 {@link https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise | Promise} 对象
 * 
 * @remarks
 * 与 {@link https://nodejs.cn/api/util/util_promisify_original.html | uitls.promisify} 不同
 * 
 * 1.传入Promise对象则直接返回
 * 
 * 2.传入非Promise则包装之后再返回
 * 
 * @param a {any} 待转换的数据
 * @returns Promise 转换后的 Promise
 * 
 * @public
 */
export function promisify <T = any>(a: T): Promise<T> {
  if (isPromise(a)) {
    return a as Promise<T>
  }
  return Promise.resolve(a)
}

/**
 * 延迟
 * 
 * @param time {number} 延迟时间（毫秒）
 * @returns Promise 返回 Promise 对象
 * 
 * @public
 */
export function delay (time: number = 1000) {
  if (!isNumber(time)) {
    throw new Error('time should be number')
  }
  if (time < 0) {
    throw new Error('time should not small than 0')
  }
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

/**
 * 空函数
 * 
 * @public
 */
export function noop () {}

/**
 * 生成随机数字符串
 * 
 * @param len {number} 长度 TODO: 怎么定义默认值
 * @returns {string} 生成的字符串
 * 
 * @public
 */
export function randomNumber (len: number = 20): string {
  if (!isNumber(len)) {
    throw new Error("len must be an Number")
  }
  if (len < 0) {
    throw new Error("len must great than -1")
  }
  const random = () => (Math.random() + '').replace('0.', '')
  let rand = random().slice(0, len)
  while (rand.length < len) {
    rand += random()
  }
  return rand.slice(0, len)
}

/**
 * 生成 21 位长度的消息 ID
 * 
 * @returns {string} 21 位长度的字符串
 * 
 * @public
 */
export const genMessageId = (): string => {
  const date = new Date()
  const Y = date.getFullYear()
  const M = date.getMonth() + 1
  const D = date.getDate()
  const H = date.getHours()
  const m = date.getMinutes()
  const s = date.getSeconds()
  const ms = date.getMilliseconds()
  const month = M >= 10 ? '' + M : '0' + M
  const day = D >= 10 ? '' + D : '0' + D
  const hour = H >= 10 ? '' + H : '0' + H
  const minute = m >= 10 ? '' + m : '0' + m
  const second = s >= 10 ? '' + s : '0' + s
  let minsec = '' + ms
  if (ms < 10) {
    minsec = '00' + ms
  } else if (ms < 100 && ms >= 10) {
    minsec = '0' + ms
  }
  return Y + month + day + hour + minute + second + minsec + randomNumber(4)
}

/**
 * 将科学计数法的数字转为字符串
 * 
 * @remarks
 * 4.496794759834739e-9  ==> 0.000000004496794759834739
 * 
 * 4.496794759834739e+9  ==> 4496794759.834739
 * 
 * 若转换失败，则返回 `null`
 * 
 * @privateRemarks
 * 运算精度丢失方法中处理数字的时候，如果出现科学计数法，就会导致结果出错
 * 
 * @param {number} num 待转换值
 * @returns {null | string} 转换结果
 * 
 * @public
 */
export function toNonExponential (num: number): null | string {
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
 * 两浮点数相乘
 * 
 * @remarks 修复了 js 乘法精度丢失问题，若相乘失败返回 `null` 
 * 
 * @param {number | string} arg1 浮点数 1
 * @param {number | string} arg2 浮点数 2
 * 
 * @returns {null | number} 相乘结果
 * 
 * @public
 */
export function floatMultiply (arg1: number | string, arg2: number | string): null | number {
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
 * 两浮点数相除
 * 
 * @remarks 修复了 js 除法精度丢失问题
 * 
 * @param {string | number} arg1 被除数
 * @param {string | number} arg2 除数
 * @returns {null | number} 相除结果
 * 
 * TODO: 为 0 结果会怎样？
 * 
 * @public
 */
export function floatDivide (arg1: string | number, arg2: string | number): null | number {
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
 * 两浮点数相乘
 * 
 * @remarks 修复了 js 乘法精度丢失问题，基于 {@link https://www.npmjs.com/package/big.js | big.js} 实现
 * 
 * @param arg1 数字 1
 * @param arg2 数字 2
 * @returns {TBig} Big
 * 
 * @public
 */
export function times (arg1: number | string | TBig, arg2: number | string | TBig): TBig {
  return new Big(arg1).times(arg2)
}

/**
 * 两浮点数相乘
 * 
 * @see {@link @dinofe/xt-core#times | times}
 * 
 * @public
 */
export const multiply = times

/**
 * 两浮点数相除
 * 
 * @remarks 修复了 js 除法精度丢失问题，基于 {@link https://www.npmjs.com/package/big.js | big.js} 实现
 * 
 * @param arg1 被除数
 * @param arg2 除数
 * @returns {TBig} Big
 * 
 * @public
 */
export function div (arg1: number | string | TBig, arg2: number | string | TBig): TBig {
  return new Big(arg1).div(arg2)
}

/**
 * 两浮点数相除
 * 
 * @see {@link @dinofe/xt-core#div | div}
 * 
 * @public
 */
export const divide = div

/**
 * 两数相加
 * 
 * @remarks 修复了 js 加法精度丢失问题，基于 {@link https://www.npmjs.com/package/big.js | big.js} 实现
 * 
 * @param arg1 {string | number} arg1 加数 1
 * @param arg2 {string | number} arg2 加数 2
 * @returns {TBig} Big
 * 
 * @public
 */
export function plus (arg1: string | number | TBig, arg2: string | number | TBig): TBig {
  return new Big(arg1).plus(arg2)
}

/**
 * 两数相减
 * 
 * @remarks 修复了 js 减法精度丢失问题，基于 {@link https://www.npmjs.com/package/big.js | big.js} 实现
 * 
 * @param arg1 {string | number} arg1 减数 1
 * @param arg2 {string | number} arg2 减数 2
 * @returns {TBig} Big
 * 
 * @public
 */
export function minus (arg1: string | number | TBig, arg2: string | number | TBig): TBig {
  return new Big(arg1).minus(arg2)
}

/**
 * 获取url中参数值
 * 
 * @param {string} str url链接
 * @param {string} a 要获取参数的key
 * @returns {undefined | string}
 * 
 * @public
 */
export function getQuery (str:string, a:string) {
  if (!str || !a) {
    throw new Error('param is not exist')
  }
  if (!isString(str) || !isString(a)) {
    throw new Error('param is not string')
  }
  str = str.split('?')[1]
  if (!str) {
    return
  }
  const obj = {} as Record<string, string | undefined>
  const list = str.split('&')
  if (!list.length) {
    return
  }
  list.forEach(v => {
  const datalist = v.split('=')
    obj[datalist[0]] = datalist[1]
  })
  return obj[a]
}

/**
 * 校验token格式是否正确
 *
 * @param {Any} token token
 * @returns {Boolean} 是否有效token
 *
 * @public
 */
export function isValidToken (token: any): boolean {
  const tokenType = typeof token
  if (!token) { return false }
  if (token === 'undefined' || token === 'null') { return false }
  if (!['string', 'number'].includes(tokenType)) { return false }
  if (tokenType === 'string') {
    if (!token.trim() || token.includes('object ')) {
     return false
    }
  }
  return true
}
