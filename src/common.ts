/**
 * 基础公共方法（纯JS方法不依赖于执行环境）
 */

import _Big from 'big.js'
import type TBig from 'big.js'
import type { IRunWithDelayedLoadingOptions } from "./type";

/**
 * 解决JS计算精度问题的类
 * 
 * @remarks
 * @see {@link big.js#Big | Big}
 * 
 * 用法参考：{@link https://github.com/MikeMcl/big.js}
 * 
 * @example
 * ```ts
 * import { Big } from '@dinofe/xt-core/common'
 * x = new Big(123.4567)
 * y = Big('123456.7e-3')                 // 'new' is optional
 * z = new Big(x)
 * x.eq(y) && x.eq(z) && y.eq(z)          // true
 * ```
 * 
 * @public
 */
export const Big = _Big

/**
 * 是否为有效的值
 * 
 * @remarks 非 undefined | 'undefined' | null
 * 
 * @param a - 待校验的数据
 * @returns 判断结果
 * 
 * @example
 * ```ts
 * import { isDef } from '@dinofe/xt-core/common'
 * isDef(undefined) // false
 * isDef('undefined') // false
 * isDef(null) // false
 * isDef('foo') // true
 * ```
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
 * @param a - 待校验的数据
 * @returns 判断结果
 * 
 * @example
 * ```ts
 * import { isUndef } from '@dinofe/xt-core/common'
 * isUndef(undefined) // true
 * isUndef(null) // true
 * isUndef('undefined') // false
 * isUndef({}) // false
 * ```
 * 
 * @public
 */
export function isUndef (a: any): boolean {
  return typeof a === 'undefined' || a === null
}

/**
 * 字符串是否以'/'结尾
 * 
 * @param a - 待校验的数据
 * @returns 判断结果
 * 
 * @example
 * ```ts
 * import { isEndWithSlash } from '@dinofe/xt-core/common'
 * isEndWithSlash('/') // true
 * isEndWithSlash('/foo/bar/') // true
 * isEndWithSlash('foo bar') // false
 * ```
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
 * @param a - 待校验的数据
 * @returns 判断结果
 *
 * @example
 * ```ts
 * import { isStartWithSlash } from '@dinofe/xt-core/common'
 * isStartWithSlash('/') // true
 * isStartWithSlash('/foo/bar/') // true
 * isStartWithSlash('foo bar') // false
 * ```
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
 * @param a - 待校验的数据
 * @returns 判断结果
 * 
 * @example
 * ```ts
 * import { isString } from '@dinofe/xt-core/common'
 * isString('foo') // true
 * isString({}) // false
 * ```
 * 
 * @public
 */
export function isString (a: any): boolean {
  return typeof a === 'string'
}

/**
 * 是否为有效 {@link https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Number | Number}
 * @param a - 待校验的数据
 * @returns 判断结果
 * 
 * @example
 * ```ts
 * import { isNumber } from '@dinofe/xt-core/common'
 * isNumber(0) // true
 * isNumber({}) // false
 * ```
 * 
 * @public
 */
export function isNumber (a: any): boolean {
  return typeof a === 'number' && !Number.isNaN(a)
}

/**
 * 是否为 {@link https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise | Promise} 对象
 * 
 * @remarks
 * 
 * ::: warning 提示
 * 
 * 此方法并非严格的判断，具有 `then` 方法的对象也可能被判断为是 `Promise`
 * 
 * :::
 * 
 * @param a - 待校验的数据
 * @returns 判断结果
 * 
 * @example
 * ```ts
 * import { isPromise } from '@dinofe/xt-core/common'
 * let p1 = Promise.resolve()
 * let f1 = () => {}
 * isPromise(p1) // true
 * isPromise(f1) // false
 * ```
 * 
 * @public
 */
export function isPromise (a: any): boolean {
  return typeof a === 'object' && a !== null && isFunction(a.then)
}

/**
 * 是否为函数
 * 
 * @param a - 待校验的数据
 * @returns 判断结果
 * 
 * @example
 * ```ts
 * import { isFunction } from '@dinofe/xt-core/common'
 * isFunction(() => {}) // true
 * ```
 * 
 * @public
 */
export function isFunction (a: any): boolean {
  return ['[object Function]', '[object AsyncFunction]'].includes(Object.prototype.toString.call(a))
}

/**
 * 是否为 {@link https://developer.mozilla.org/zh-CN/docs/Web/API/FormData | FormData} 对象
 * 
 * @param a - 待校验的数据
 * @returns 判断结果
 * 
 * @example
 * ```ts
 * import { isFromData } from '@dinofe/xt-core/common'
 * isFromData({}) // false
 * ```
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
 * @param a - 待校验的数据
 * @returns 判断结果
 * 
 * @example
 * ```ts
 * import { isNormalObject } from '@dinofe/xt-core/common'
 * isNormalObject({ foo: 'bar' }) // true
 * ```
 * 
 * @public
 */
export function isNormalObject (a: any): boolean {
  return Object.prototype.toString.call(a) === '[object Object]'
}

/**
 * 判断给定的 URI 是否是 {@link https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/encodeURI | URIEncode} 过的
 * 
 * @remarks
 * 
 * ::: warning 提示
 * 
 * 只是判断字符串中是否有 URIEncode 编码产生的 '%' 字符特征，不是十分严谨
 * 
 * :::
 * 
 * @param url - 输入 URL
 * @returns 是否 encoded 过的 URI
 * 
 * @example
 * ```ts
 * import { isEncodeURILike } from '@dinofe/xt-core/common'
 * isEncodeURILike('foo bar') // false
 * ```
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
 * @remarks 是否以 `http://` 或 `https://` 开头
 * 
 * @param url - 任意字符串
 * @returns 是否是 URL 链接
 * 
 * @example
 * ```ts
 * import { isUrlLike } from '@dinofe/xt-core/common'
 * isUrlLike('https://www.foo.bar') // true
 * ```
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
 * @remarks
 * 是否以 `blob://` 开头
 * 
 * ::: warning 提示
 * 
 * 该方法只是判断链接是否符合 `blob` 链接的特性，不保证 `blob` 链接一定可用
 * 
 * :::
 * 
 * 
 * @param url - 任意字符串
 * @returns 是否是类似 blob 的链接
 * 
 * @example
 * ```ts
 * import { isBlobUrlLike } from '@dinofe/xt-core/common'
 * isBlobUrlLike('blob://6136234752134') // true
 * ```
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
 * 与 {@link https://nodejs.cn/api/util/util_promisify_original.html | uitls.promisify} 不同，它是将回调函数写法转成 Promise 写法；
 * 
 * {@link @dinofe/xt-core#promisify | promisify} 是将传入的值包装成 Promise 对象，方便统一业务代码的写法
 * 
 * 1.传入Promise对象则直接返回
 * 
 * 2.传入非Promise则包装之后再返回
 * 
 * ::: warning 提示
 * 
 * 对于不支持的 Promise 的环境，需要自行进行 polyfill
 * 
 * :::
 * 
 * @param a - 待转换的数据
 * @returns 返回包装后的 Promise 对象
 * 
 * @example
 * ```ts
 * import { promisify } from '@dinofe/xt-core/common'
 * promisify('foo').then(e => {
 *  console.log(e) // foo
 * })
 * ```
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
 * @param time - 延迟时间（毫秒）
 * @returns 返回 Promise 对象
 * 
 * @example
 * ```ts
 * import { delay } from '@dinofe/xt-core/common'
 * async function fn1() {
 *  await delay(3000)
 *  console.log('foo') // 3s 之后才打印 foo
 * }
 * ```
 * 
 * @public
 */
export function delay (time: number = 1000) {
  if (!isNumber(time)) {
    throw new Error('time should be a number')
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
 * @remarks 不执行任何逻辑，使用这个相同的函数引入，可以避免业务代码中频繁创建空函数
 * 
 * @example
 * ```ts
 * import { noop } from '@dinofe/xt-core/common'
 * Promise.reject('foo').catch(noop) // 吞掉 reject 的错误
 * ```
 * 
 * @public
 */
export function noop () {}

/**
 * 生成随机数字符串
 * 
 * @param len - 长度
 * @returns 生成的字符串
 * 
 * @example
 * ```ts
 * import { randomNumber } from '@dinofe/xt-core/common'
 * randomNumber(10) // 生成 10 位长度的随机数
 * ```
 * 
 * @public
 */
export function randomNumber (len: number = 20): string {
  if (!isNumber(len)) {
    throw new Error("len must be a Number")
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
 * @remarks 生成的消息 ID 中体现有时间戳信息，并非真正意义上的 ID
 * 
 * @returns 21 位长度的字符串
 * 
 * @example
 * ```ts
 * import { genMessageId } from '@dinofe/xt-core/common'
 * genMessageId()
 * ```
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
 * `4.496794759834739e-9  ==> 0.000000004496794759834739`
 * 
 * `4.496794759834739e+9  ==> 4496794759.834739`
 * 
 * 若转换失败，则返回 `null`
 * 
 * @privateRemarks
 * 运算精度丢失方法中处理数字的时候，如果出现科学计数法，就会导致结果出错
 * 
 * @param num - 待转换值
 * @returns 转换结果
 * 
 * @example
 * ```ts
 * import { toNonExponential } from '@dinofe/xt-core/common'
 * toNonExponential(100)
 * ```
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
 * @param arg1 - 浮点数 1
 * @param arg2 - 浮点数 2
 * 
 * @returns 相乘结果
 * 
 * @example
 * ```ts
 * import { floatMultiply } from '@dinofe/xt-core/common'
 * floatMultiply(1.33, 2) // 2.66
 * ```
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
 * @privateRemarks TODO: 为 0 结果会怎样？
 * 
 * @param arg1 - 被除数
 * @param arg2 - 除数
 * @returns 相除结果
 * 
 * @example
 * ```ts
 * import { floatDivide } from '@dinofe/xt-core/common'
 * floatDivide(2.66, 2) // 1.33
 * ```
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
 * @param arg1 - 数字 1
 * @param arg2 - 数字 2
 * @returns Big
 * 
 * @example
 * ```ts
 * import { times } from '@dinofe/xt-core/common'
 * times(1.33, 2).toNumber() // 2.66
 * ```
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
 * @example
 * ```ts
 * import { multiply } from '@dinofe/xt-core/common'
 * multiply(1.33, 2).toNumber() // 2.66
 * ```
 * 
 * @public
 */
export const multiply = times

/**
 * 两浮点数相除
 * 
 * @remarks 修复了 js 除法精度丢失问题，基于 {@link https://www.npmjs.com/package/big.js | big.js} 实现
 * 
 * @param arg1 - 被除数
 * @param arg2 - 除数
 * @returns Big
 * 
 * @example
 * ```ts
 * import { div } from '@dinofe/xt-core/common'
 * div(2.66, 2).toNumber() // 1.33
 * ```
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
 * @example
 * ```ts
 * import { divide } from '@dinofe/xt-core/common'
 * divide(2.66, 2).toNumber() // 1.33
 * ```
 * 
 * @public
 */
export const divide = div

/**
 * 两数相加
 * 
 * @remarks 修复了 js 加法精度丢失问题，基于 {@link https://www.npmjs.com/package/big.js | big.js} 实现
 * 
 * @param arg1 - arg1 加数 1
 * @param arg2 - arg2 加数 2
 * @returns Big
 * 
 * @example
 * ```ts
 * import { plus } from '@dinofe/xt-core/common'
 * plus(0.1, 0.2) // 0.3
 * ```
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
 * @param arg1 - 减数 1
 * @param arg2 - 减数 2
 * @returns Big
 * 
 * @example
 * ```ts
 * import { minus } from '@dinofe/xt-core/common'
 * minus(0.3, 0.2) // 0.1
 * ```
 * 
 * @public
 */
export function minus (arg1: string | number | TBig, arg2: string | number | TBig): TBig {
  return new Big(arg1).minus(arg2)
}

/**
 * 获取url中参数值
 * 
 * @remarks 使用 `&` `=` 符号进行切割，不会进行 URL 反编码
 * 
 * @param str - url链接
 * @param a - 要获取参数的key
 * @returns url链接中key对应的值
 * 
 * @example
 * ```ts
 * import { getQuery } from '@dinofe/xt-core/common'
 * getQuery('https://www.foo.com?a=aaa&b=bbb', a) // aaa
 * ```
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
 * 校验 token 格式是否正确
 * 
 * @remarks
 * 校验token是否是字符串，且不是 `'undefined'` `'null'` 这种容易保存错误的字符串
 * 
 * ::: warning 提示
 * 
 * 此方法不会真实校验 token 是否有效，并且不会对 token 格式个严格校验
 * 
 * :::
 *
 * 
 * @param token - token
 * @returns 是否有效token
 *
 * @example
 * ```ts
 * import { isValidToken } from '@dinofe/xt-core/common'
 * isValidToken('foo bar') // true
 * ```
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

/**
 * 判断传入的函数执行是否超时
 * 
 * @remarks
 * 会返回一个 Promise 实例对象，使用者需要自行 catch 异常；
 * 当 catch 到异常时表示未超时，错误原因为函数返回的 Promise reject 的错误；
 * 若进入到 then 表示函数执行完成或者函数返回的 Promise 已 resolve，开发者根据 `isTimeout` 标记判断是否超时
 * 
 * 该方法执行细节为：
 * 
 * 1. 若传入的函数fn返回值不是 Promise，则不论函数fn执行耗时有多久都不会超时
 * 
 * 2. 若传入的函数fn返回 Promise，根据 Promise 变为 resolved 时间是否超过 timeout 决定是否超时
 *    若未超时，则返回 `Promise.resolve({ isTimeOut: false, result: result })`，result 为 Promise resolve 的结果
 *    若已超时，则返回 `Promise.resolve({ isTimeOut: true, result: undefined })` Promise resolve 的结果将被忽略
 *    若 reject，则返回 `Promise.reject(err)` err 为 reject 的错误原因
 * 
 * @param fn - 传入的函数
 * @param timeout - 超时时间
 * @param context - fn函数的执行上下文
 * @param args  - fn函数的执行参数
 * @returns 返回带有执行结果的Promise对象, 包含属性isTimeOut：超时标志, 属性result：执行结果
 *
 * @example 传入普通函数
 * ```ts
 * import { runWithTimeout } from '@dinofe/xt-core/common'
 * const fn = () => { return 'aaa' }
 * runWithTimeout(fn, 3 * 1000).then(res => {
 *  console.log(res) // 打印：{ isTimeOut: false, result: 'aaa' }
 * }).catch(e => {
 *  console.log(e)
 * })
 * ```
 * 
 * @example 传入 async 函数
 * ```ts
 * import { runWithTimeout } from '@dinofe/xt-core/common'
 * const fn = async () => {
 *  // 这里可以发送HTTP请求，返回请求结果
 *  return 'bbb' 
 * }
 * runWithTimeout(fn, 3 * 1000).then(res => {
 *  console.log(res) // 打印：{ isTimeOut: false, result: 'bbb' }
 * }).catch(e => {
 *  console.log(e)
 * })
 * ```
 * 
 * @example 传入 Promise 函数
 * ```ts
 * import { runWithTimeout } from '@dinofe/xt-core/common'
 * const fn = () => {
 *  // 这里可以发送HTTP请求，返回请求结果
 *  return Promise.resolve('ccc')
 * }
 * runWithTimeout(fn, 3 * 1000).then(res => {
 *  console.log(res) // 打印：{ isTimeOut: false, result: 'ccc' }
 * }).catch(e => {
 *  console.log(e)
 * })
 * ```
 * 
 * @example 给函数fn绑定执行上下文
 * ```ts
 * import { runWithTimeout } from '@dinofe/xt-core/common'
 * const fn = () => {
 *  // 这里可以发送HTTP请求，返回请求结果
 *  return Promise.resolve('ddd' + this.name)
 * }
 * runWithTimeout(fn, 3 * 1000, { name: 'foo' }).then(res => {
 *  console.log(res) // 打印：{ isTimeOut: false, result: 'dddfoo' }
 * }).catch(e => {
 *  console.log(e)
 * })
 * ```
 * 
 * @example 给函数fn传递参数
 * ```ts
 * import { runWithTimeout } from '@dinofe/xt-core/common'
 * const fn = (name, word) => {
 *  // 这里可以发送HTTP请求，返回请求结果
 *  return Promise.resolve('eee' + name + word)
 * }
 * runWithTimeout(fn, 3 * 1000, null, 'bar', 'hello').then(res => {
 *  console.log(res) // 打印：{ isTimeOut: false, result: 'eeebarhello' }
 * }).catch(e => {
 *  console.log(e)
 * })
 * ```
 * 
 * @public
 */

export function runWithTimeout <T = any> (fn: Function, timeout: number, context?: any, ...args: any[]): Promise<{ isTimeOut: boolean, result: T | undefined }> {
  if (!isFunction(fn)) {
    throw new Error("fn must be a Function")
  }
  if (!isNumber(timeout)) {
    throw new Error("timeout must be a Number")
  }

  return new Promise((resolve, reject) => {
    let isTimeOut = false // 超时标识
    const timer = setTimeout(() => {
      isTimeOut = true
      resolve({ isTimeOut, result: undefined })
    }, timeout)
    const result = fn.call(context, ...args)

    if (isPromise(result)) {
      result.then((value: T) => {
        isTimeOut = false
        clearTimeout(timer)
        resolve({ isTimeOut, result: value })
      }).catch((err: any) => {
        isTimeOut = false
        clearTimeout(timer)
        reject(err)
      })
    } else {
      isTimeOut = false
      clearTimeout(timer)
      resolve({ isTimeOut, result })
    }
  }) 
}

/**
 * 带延迟加载提示的异步任务处理方法
 *
 * @remarks
 * - 在设定的延迟时间内异步任务完成无加载提示；未完成时，触发加载提示；任务完成后，结束加载提示，且加载提示至少显示指定时长。
 *
 * - 返回的 Promise 与异步任务执行返回的 Promise 不同，但与其同时 Settled，自行对返回的 Promise 进行异常处理。
 *
 * @param asyncTask - 任意异步任务函数，返回一个 Promise。
 * @param options - 延迟加载相关的配置选项。
 * @param options.loadingDelay - 延迟加载提示的时长，单位为毫秒，默认值为 1000 毫秒。
 * @param options.minLoadingDuration - 加载提示至少显示的时长，单位为毫秒，默认值为 1000 毫秒。
 * @param options.onLoading - 当异步任务在延迟时间内未完成时，触发的加载提示函数。
 * @param options.onSettled - 当异步任务完成（无论成功或失败）时，触发的结束加载提示函数。
 * @returns 返回一个 Promise，该 Promise 会在异步任务完成（无论成功或失败）并等待加载提示结束才 Settled。
 *
 * @example 调用 API 请求
 * ```vue
 * <script setup lang="ts">
 * import { runWithDelayedLoading } from '@dinofe/xt-core/common'
 * import { useLoading } from "vue-loading-overlay"
 * const gloading = useLoading()
 *
 * function onSubmit(formData) {
 *  runWithDelayedLoading(async () => {
 *    return Api.save(formData)
 *  }, {
 *    onLoading: () => {
 *      // show loading
 *      gloading.show()
 *    },
 *    onSettled: () => {
 *      // close loading
 *      gloading.hide()
 *    },
 *    minLoadingDuration: 3000
 *  }).then(() => {
 *    // success 至少等 3s 才弹出提示
 *    window.alert("保存成功")
 *  }).catch((e) => {
 *    // error
 *    window.alert("保存失败")
 *  })
 * }
 * </script>
 * ```
 *
 * @example 立即开始 loading，异步任务结束立即结束 loading、立即处理异步任务结果
 * ```vue
 * <script setup lang="ts">
 * import { runWithDelayedLoading } from '@dinofe/xt-core/common'
 * import { useLoading } from "vue-loading-overlay"
 * const gloading = useLoading()
 *
 * function onSubmit(formData) {
 *  runWithDelayedLoading(async () => {
 *    return Api.save(formData)
 *  }, {
 *    onLoading: () => {
 *      // show loading
 *      gloading.show()
 *    },
 *    onSettled: () => {
 *      // close loading
 *      gloading.hide()
 *    },
 *    loadingDelay: 0,
 *    minLoadingDuration: 0
 *  }).then((res) => {
 *    if (res.code === 0) {
 *      window.alert("保存成功")
 *    } else {
 *      window.alert("保存失败")
 *    }
 *  }).catch((e) => {
 *    // error
 *    window.alert("保存失败")
 *  })
 * }
 * </script>
 * ```
 *
 * @example 在异步任务结束时立即预渲染页面，此时 loading 的关闭比异步任务结束要晚
 * ```vue
 * <script setup lang="ts">
 * import { runWithDelayedLoading } from '@dinofe/xt-core/common'
 * import { useLoading } from "vue-loading-overlay"
 * const gloading = useLoading()
 * const result = ref()
 *
 * function onLoadInfo(id) {
 *  runWithDelayedLoading(async () => {
 *    return Api.info(id).then((res) => {
 *      // success 接口返回成功后立即使用结果预渲染页面
 *      result.value = res
 *    }).catch((e) => {
 *      console.log(e)
 *    })
 *  }, {
 *    onLoading: () => {
 *      // show loading
 *      gloading.show()
 *    },
 *    onSettled: () => {
 *      // close loading 等异步逻辑完成时展示预渲染的页面
 *      gloading.hide()
 *      showDetail()
 *    },
 *  })
 * }
 *
 * function showDetail() {
 *   // your code...
 * }
 * </script>
 * ```
 *
 * @public
 */
export async function runWithDelayedLoading<T = any>(asyncTask: () => Promise<T>, {
  loadingDelay = 1000,
  minLoadingDuration = 1000,
  onLoading,
  onSettled,
}: IRunWithDelayedLoadingOptions = {}): Promise<T> {
  let loading = false // 是否展示loading中
  let settled = false // 异步任务是否完成
  // let resSettled = false // 返回的Promise是否已Settled
  // let taskRes: T | Error | null = null // 异步任务返回的结果
  // let taskStartTime: number | null = null // 异步任务开始时间
  let loadingStartTime: number | null = null // 展示loading的开始时间
  // let loadingDelayTimeout = false // 是否超时时间

  let resolve: ((d: Awaited<T> | T) => void ) | null = null
  let reject: ((e: Error) => void) | null = null

  // taskStartTime = Date.now()
  delay(loadingDelay).then(async () => {
    if (!settled) {
      // loadingDelayTimeout = true
      loading = true
      loadingStartTime = Date.now()
      onLoading?.()
      await runLoading()
    } else {
      // 忽略，返回的Promise已被处理
    }
  })
  const task = asyncTask().then((data) => {
    if (!loading) {
      resolve!(data)
      // resSettled = true
    } else {
      // taskRes = data
    }
    return data
  }, (e) => {
    if (!loading) {
      reject!(e)
      // resSettled = true
    } else {
      // taskRes = e
    }
    return Promise.reject(e)
  }).finally(() => {
    settled = true
  })

  async function runLoading() {
    if (settled) return
    try {
      const res = await task
      if (loadingStartTime !== null) {
        const elapsedTime = Date.now() - loadingStartTime
        if (elapsedTime < minLoadingDuration) {
          await delay(minLoadingDuration - elapsedTime)
        }
      }
      loading = false
      onSettled?.();
      resolve!(res);
      // resSettled = true
    } catch (e) {
      if (loadingStartTime !== null) {
        const elapsedTime = Date.now() - loadingStartTime
        if (elapsedTime < minLoadingDuration) {
          await delay(minLoadingDuration - elapsedTime)
        }
      }
      loading = false
      onSettled?.();
      reject!(e as Error);
      // resSettled = true
    }
  }

  return new Promise((r, j) => {
    resolve = r
    reject = j
  })
}

/**
 * 带延迟加载提示的异步任务处理方法
 *
 * @remarks
 * - 在设定的延迟时间内异步任务完成无加载提示；未完成时，触发加载提示；任务完成后，结束加载提示，且加载提示至少显示指定时长。
 *
 * - 返回的 Promise 与异步任务执行返回的 Promise 相同，与其同时 Settled，自行对返回的 Promise 进行异常处理。
 *
 * @param asyncTask - 任意异步任务函数，返回一个 Promise。
 * @param options - 延迟加载相关的配置选项。
 * @param options.loadingDelay - 延迟加载提示的时长，单位为毫秒，默认值为 1000 毫秒。
 * @param options.minLoadingDuration - 加载提示至少显示的时长，单位为毫秒，默认值为 1000 毫秒。
 * @param options.onLoading - 当异步任务在延迟时间内未完成时，触发的加载提示函数。
 * @param options.onSettled - 当异步任务完成（无论成功或失败）时，触发的结束加载提示函数。
 * @returns 返回一个 Promise，该 Promise 会在异步任务完成（无论成功或失败）立即 Settled，不会等到加载提示结束。
 *
 * @privateRemarks
 * TODO: 待讨论是否保留这个方法
 *
 * @beta
 */
export async function runWithDelayedLoadingInstant<T = any>(asyncTask: () => Promise<T>, {
  loadingDelay = 1000,
  minLoadingDuration = 1000,
  onLoading,
  onSettled,
}: IRunWithDelayedLoadingOptions = {}) {
  let loading = false // 是否展示loading中
  let settled = false // 异步任务是否完成
  // let taskStartTime: number | null = null // 异步任务开始时间
  let loadingStartTime: number | null = null // 展示loading的开始时间
  // let loadingDelayTimeout = false // 是否超时时间

  // taskStartTime = Date.now()
  delay(loadingDelay).then(() => {
    if (!settled) {
      // loadingDelayTimeout = true
      loading = true
      loadingStartTime = Date.now()
      onLoading?.()
      runLoading()
    }
  })
  const task = asyncTask().finally(() => {
    settled = true
  })

  async function runLoading() {
    if (settled) return
    task.finally(async () => {
      if (loadingStartTime !== null) {
        const elapsedTime = Date.now() - loadingStartTime
        if (elapsedTime < minLoadingDuration) {
          await delay(minLoadingDuration - elapsedTime)
        }
      }
      loading = false
      onSettled?.()
    })
  }

  return task
}
