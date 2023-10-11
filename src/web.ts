/**
 * 适用于浏览器环境的相关库
 */

import { isBlobUrlLike, isFunction, isUrlLike, randomNumber } from "./common"
import { IImageSize, SObject } from "./type"

/**
 * 复制失败提示信息
 * 
 * @public
 */
export const COPY_FAIL_MESSAGE = '当前环境不支持复制'

/**
 * 存储空间占用大小
 * 
 * @public
 */
export interface IStorageSize {
  /**
   * 字节大小
   */
  sizeBytes: number
  /**
   * 以KB为单位的字符串表示
   */
  sizeKB: string
  /**
   * 以MB为单位的字符串表示
   */
  sizeMB: string
  /**
   * 以GB为单位的字符串表示
   */
  sizeGB: string
  /**
   * 以字节为单位的字符串描述
   */
  sizeInBytes: string
  /**
   * 以KB为单位的字符串表示（带单位）
   */
  sizeInKB: string
  /**
   * 以MB为单位的字符串表示（带单位）
   */
  sizeInMB: string
  /**
   * 以GB为单位的字符串表示（带单位）
   */
  sizeInGB: string
}

/**
 * 存储类型
 * 
 * @see {@link https://developer.mozilla.org/zh-CN/docs/Web/API/Storage | Storage}
 * 
 * @public
 */
export const enum StorageType {
  /**
   * localStorage 存储
   */
  localStorage = 'localStorage',
  /**
   * sessionStorage 存储
   */
  sessionStorage = 'sessionStorage',
}

/**
 * MIME 类型
 * 
 * @remarks 常用{@link https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Basics_of_HTTP/MIME_types | MIME 类型} 枚举的部分，完整 MIME 类型请参考{@link https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types | 常见 MIME 类型列表}
 * 
 * @public
 */
export const enum MIME_TYPE {
  JPG = 'image/jpeg',
  PNG = 'image/png',
  GIF = 'image/gif',
}

/**
 * 创建 DOM 元素
 * 
 * @param tag - 要创建元素类型的字符串
 * @param style - 样式对象
 * @returns 生成一个{@link https://developer.mozilla.org/zh-CN/docs/Web/API/Element | 元素 Element}
 * 
 * @eaxmple
 * ```ts
 * import { createElement } from '@dinofe/xt-core/web'
 * const div = createElement('div', { background: 'red' })
 * ```
 * 
 * @internal
 */
function createElement(tag: string, style: SObject<string>) {
  const el = document.createElement(tag)
  const keys = Object.keys(style)
  keys.forEach((key) => {
    el.style[(key as unknown as number)] = style[(key as keyof SObject<string>)]
    Object.defineProperty(el.style, key, {
      value: style[(key as any)]
    })
  })
  return el
}

/**
 * 复制文本到剪贴板
 * 
 * @param text - 要复制的字符串
 * @returns 返回一个Promise对象，成功会resolve，失败会reject
 * 
 * @example
 * ```ts
 * import { copyToClipboard } from '@dinofe/xt-core/web'
 * copyToClipboard('hello').then(() => {
 *  console.log('支付成功')
 * }).catch(e => {
 *  console.log(e.message)
 * })
 * ```
 * 
 * @public
 */
 export function copyToClipboard (text: string): Promise<void> {
   return new Promise((resolve, reject) => {
     const textArea = createElement('textarea', {
       position: 'fixed',
       top: '0',
       left: '0',
       width: '2em',
       height: '2em',
       padding: '0',
       border: 'none',
       outline: 'none',
       boxShadow: 'none',
       background: 'transparent'
     }) as HTMLTextAreaElement
     textArea.value = text
     document.body.appendChild(textArea)
     textArea.select()
     try {
       const successful = document.execCommand('copy')
       if (successful) {
         resolve()
       } else {
         reject(COPY_FAIL_MESSAGE)
       }
     } catch (err) {
       reject(new Error(COPY_FAIL_MESSAGE))
     }
     document.body.removeChild(textArea)
   })
}

/**
 * 文件对象转为 URL 链接
 * 
 * @remarks 使用 {@link https://developer.mozilla.org/zh-CN/docs/Web/API/URL/createObjectURL_static | URL.createObjectURL}
 * 
 * @param blob - {@link https://developer.mozilla.org/zh-CN/docs/Web/API/Blob | Blob} 或 {@link https://developer.mozilla.org/zh-CN/docs/Web/API/File | File} 文件对象
 * @returns 结果对象 `{ url: string, revoke: Function }`
 * 
 * @example
 * ```ts
 * import { convertBlobToUrl } from '@dinofe/xt-core/web'
 * const file = e.target.files[0] // input元素的change事件的
 * const { url } = convertBlobToUrl(file)
 * console.log(url)
 * ```
 * 
 * @see {@link https://developer.mozilla.org/zh-CN/docs/Web/API/URL/createObjectURL_static | createObjectURL}
 * 
 * @public
 */
export function convertBlobToUrl (blob: Blob | File) {
  const url = URL.createObjectURL(blob)
  function revoke() {
    url && URL.revokeObjectURL(url)
  }
  return {
    /**
     * 文件url地址
     * 
     * @public
     */
    url,
    /**
     * 释放缓存的方法
     * 
     * @see {@link https://developer.mozilla.org/zh-CN/docs/Web/API/URL/revokeObjectURL_static | URL.revokeObjectURL()}
     * 
     * @public
     */
    revoke
  }
}

/**
 * 加载图片为 {@link https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLImageElement | Image} 对象
 * 
 * @param url - 图片地址，完整地址、相对地址、 Blob 地址或 base64 字符串
 * @param isBase64 - url 是否 base64 字符串
 * @param baseUrl - 图片基础路径
 * @returns Promise 包装的图片 Image 对象
 * 
 * @example url
 * ```ts
 * import { loadImage } from '@dinofe/xt-core/web'
 * loadImage('http://www.example.com/xxx.jpg')
 *  .then(image => { console.log(image) })
 *  .cath(e => { console.log(e.message) })
 * ```
 * 
 * @example base64
 * ```ts
 * import { loadImage } from '@dinofe/xt-core/web'
 * const base64Str = '....'
 * loadImage(base64Str, true)
 *  .then(image => { console.log(image) })
 *  .catch(e => { console.log(e.message) })
 * ```
 * 
 * @public
 */
export function loadImage (
  url: string,
  /**
   * @defaultValue `false`
   */
  isBase64: boolean = false,
  /**
   * @defaultValue `''`
   */
  baseUrl: string = ''
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    let tempUrl = isBase64 ? url : (isUrlLike(url) || isBlobUrlLike(url)) ? url : baseUrl + url
    const image = new Image()
    image.src = tempUrl
    image.crossOrigin = 'anonymous'
    image.onload = () => { resolve(image) }
    image.onerror = (e) => { reject(e) }
  })
}

/**
 * 获取图片尺寸
 * 
 * @param data - 图片地址或 Image 对象
 * @param isBase64 - 是否 base64 字符串
 * @param baseUrl - 图片基础路径
 * @returns Promise 包装的图片尺寸对象
 * 
 * @internal
 */
function _getImageSize(data: string, isBase64: boolean, baseUrl: string): Promise<IImageSize>
function _getImageSize(data: HTMLImageElement): Promise<IImageSize>
function _getImageSize(data: File): Promise<IImageSize>
function _getImageSize(
  data: string | HTMLImageElement | File,
  /**
   * @defaultValue `false`
   */
  isBase64: boolean = false,
  /**
   * @defaultValue `''`
   */
  baseUrl: string = ''
): Promise<IImageSize> {
  if (typeof data === 'string') {
    return new Promise((resolve, reject) => {
      if (data.indexOf('data:image') !== 0) {
        reject(new Error('invalid data: not start with data:image'))
      } else {
        loadImage(data, isBase64, baseUrl).then((image) => {
          resolve({
            width: image.width,
            height: image.height,
          })
        }).catch(reject)
      }
    })
  } else if (data instanceof HTMLImageElement) {
    return Promise.resolve({
      width: data.width,
      height: data.height,
    })
  } else {
    return new Promise((resolve, reject) => {
      const { url, revoke } = convertBlobToUrl(data)
      loadImage(url, false, '').then((image) => {
        const width = image.width
        const height = image.height
        resolve({
          width,
          height,
        })
      }).catch(reject)
        .finally(() => {
          revoke()
        })
    })
  }
}

/**
 * 获取图片尺寸
 * 
 * @example url
 * ```ts
 * import { getImageSize } from '@dinofe/xt-core/web'
 * getImageSize('http://www.example.com/xxx.jpg')
 *  .then((size) => { console.log(`width = ${size.width} height = ${size.height}`) })
 *  .catch(e => { console.log(e.message) })
 * ```
 * 
 * @example base64
 * ```ts
 * import { getImageSize } from '@dinofe/xt-core/web'
 * const base64Str = '....'
 * getImageSize(base64Str, true)
 *  .then((size) => { console.log(`width = ${size.width} height = ${size.height}`) })
 *  .catch(e => { console.log(e.message) })
 * ```
 * 
 * @public
 */
export const getImageSize = _getImageSize

/**
 * {@link https://developer.mozilla.org/zh-CN/docs/Glossary/Base64 | Base64} 字符串转为 {@link https://developer.mozilla.org/zh-CN/docs/Web/API/Blob | Blob}
 * 
 * @param data - base64 字符串（可以包含`'data:image/jpeg;bas64,'`会被忽略）
 * @param mimeType - MIME 类型
 * @param sliceSize - 切片大小
 * @returns Blob 对象
 * 
 * @example 默认用法
 * ```ts
 * import { base64ToBlob, MIME_TYPE } from '@dinofe/xt-core/web'
 * const base64Str = '...'
 * const blob = base64ToBlob(base64Str, MIME_TYPE.JPG)
 * ```
 * 
 * @example 修改配置
 * ```ts
 * import { base64ToBlob, MIME_TYPE } from '@dinofe/xt-core/web'
 * const base64Str = '...'
 * const blob = base64ToBlob(base64Str, MIME_TYPE.PNG, 1024)
 * ```
 * 
 * @see {@link https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript | creating-a-blob-from-a-base64-string-in-javascript}
 * 
 * @public
 */
export function base64ToBlob (data: string, mimeType = MIME_TYPE.JPG, sliceSize = 512): Blob {
  // 去除 base64 字符串中的数据类型标识部分（如：data:image/pngbase64,）
  const base64Data = data.replace(/^data:[a-z]+\/[a-z]+[;]+base64,/, '')

  // 将 base64 字符串转换为字节数组
  const byteCharacters = window.atob(base64Data)

  // 创建存储二进制数据的数组
  const byteArrays = []

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize)

    const byteNumbers = new Array(slice.length)
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)
    byteArrays.push(byteArray)
  }

  // 创建 Blob 对象
  const blob = new Blob(byteArrays, { type: mimeType })
  return blob
}

/**
 * 判断当前环境下 {@link https://developer.mozilla.org/zh-CN/docs/Web/API/IndexedDB_API | indexedDB} 是否可用
 * 
 * @remarks
 * 该方法的作用是提供一个可靠的判断 indexedDB 是否支持的实现，
 * 对一些边界情况进行处理，例如：iOS 中 safari 的 iframe 中使用 
 * {@link https://developer.mozilla.org/zh-CN/docs/Web/API/IDBFactory/open | window.indexedDB.open} 报错 `SecurityError`
 * 
 * ::: warning 提示
 * 
 * 1. 此方法不会对 indexedDB 不支持的场景做任何 polyfill，检测到不支持时需要自行考虑降级处理，例如：使用 {@link https://developer.mozilla.org/zh-CN/docs/Web/API/Window/localStorage | localStorage} 替代
 * 
 * 2. 此方法会删除名为 `xtcore-validate-indexeddb-793830e4-ce92-4b9d-8ff0-d2c9a597f3d6` 的 indexedDB 数据库，如果你的业务逻辑中有同名的数据库请换一个名字
 * 
 * :::
 * 
 * 方法实现参考：{@link https://github.com/firebase/firebase-js-sdk/blob/9c61afe3c03d30c15f648f81e3bd5ece073b58db/packages/util/src/environment.ts#L150}
 * 
 * @example
 * ```ts
 * import { validateIndexedDBOpenable } from '@dinofe/xt-core/web'
 * validateIndexedDBOpenable().then(isSupportIndexedDB => {
 *  // isSupportIndexedDB表示是否支持
 *  console.log(isSupportIndexedDB)
 * })
 * ```
 * 
 * @public
 */
export function validateIndexedDBOpenable(): Promise<boolean> {
  if (!window.indexedDB || !isFunction(window.indexedDB.open)) {
    return Promise.resolve(false)
  }
  return new Promise((resolve, reject) => {
    try {
      // let preExist: boolean = false;
      // 尽量保证数据库名称不重复
      const DB_CHECK_NAME = 'xtcore-validate-indexeddb-793830e4-ce92-4b9d-8ff0-d2c9a597f3d6';
      const request = window.indexedDB.open(DB_CHECK_NAME);
      request.onsuccess = () => {
        request.result.close();
        // 不管之前数据库是否存在都直接删除
        window.indexedDB.deleteDatabase(DB_CHECK_NAME);
        resolve(true);
      };
      request.onupgradeneeded = () => {
        // preExist = true;
      };

      request.onerror = () => {
        // reject(request.error?.message || '');
        // console.log(request.error);
        resolve(false);
      };
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * 判断 {@link https://developer.mozilla.org/zh-CN/docs/Web/API/Storage | Stroage} 存储是否可用
 * 
 * @remarks
 * 会真实调用 Stroage 的 API 进行存取数据操作，如果操作执行报错就认为当前环境 Storage 存储不可用
 * 
 * 同时支持 {@link https://developer.mozilla.org/zh-CN/docs/Web/API/Window/localStorage | localStroage}、{@link https://developer.mozilla.org/zh-CN/docs/Web/API/Window/sessionStorage | sessionStorage}
 * 
 * 实现方法参考自：{@link https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#localstorage_%E5%8A%9F%E8%83%BD%E6%A3%80%E6%B5%8B | Web_Storage_API}
 * 
 * @param type 存储类型
 * 
 * @returns Stroage 存储是否可用
 * 
 * @example 判断 localStorage 是否可用
 * ```ts
 * import { validateStorageAvailable } from '@dinofe/xt-core/web'
 * validateStorageAvailable('localStorage')
 * ```
 * 
 * @example 判断 sessionStorage 是否可用
 * ```ts
 * import { validateStorageAvailable } from '@dinofe/xt-core/web'
 * validateStorageAvailable('sessionStorage')
 * ```
 * 
 * @example 枚举参数可以引入
 * ```ts
 * import { StorageType, validateStorageAvailable } from '@dinofe/xt-core/web'
 * validateStorageAvailable(StorageType.localStorage)
 * ```
 * 
 * @public
 */
export function validateStorageAvailable(type: StorageType): boolean {
  if (![StorageType.localStorage, StorageType.sessionStorage].includes(type)) {
    throw new Error('the param type should be one of ["localStroage", "sessionStorage"]')
  }
  let storage;
  try {
    storage = window[type];
    let x = "__storage_test__" + randomNumber(5);
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return !!(
      e instanceof DOMException &&
      // everything except Firefox
      (e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === "QuotaExceededError" ||
        // Firefox
        e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage &&
      storage.length !== 0
    );
  }
}

/**
 * 获取 {@link https://developer.mozilla.org/zh-CN/docs/Web/API/Storage | Stroage} 存储占用空间的大小
 * 
 * @remarks 同时支持 {@link https://developer.mozilla.org/zh-CN/docs/Web/API/Window/localStorage | localStroage}、{@link https://developer.mozilla.org/zh-CN/docs/Web/API/Window/sessionStorage | sessionStorage}
 * 
 * @param type 存储类型
 * 
 * @see {@link https://developer.mozilla.org/zh-CN/docs/Web/API/Window/localStorage | localStroage}
 * @see {@link https://developer.mozilla.org/zh-CN/docs/Web/API/Window/sessionStorage | sessionStorage}
 * 
 * @returns Stroage 存储占用空间大小
 * 
 * @throws {@link https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/TypeError | TypeError}
 * 当传入的参数 type 不是 `StorageType.localStorage | StorageType.sessionStorage` 之一时会报错：`the param type should be one of ["localStorage", "sessionStorage"]`
 * 
 * @throws {@link https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Error | Error}
 * 当 `Storage` 不可用时会报错：`window.${type} is not available`
 * 
 * 使用时，最好先检查 `Storage` 是否可用，可以使用方法：{@link @dinofe/xt-core#validateStorageAvailable | validateStorageAvailable(type)}
 * 
 * @example 获取 localStorage 占用空间大小
 * ```ts
 * import { getStorageSize } from '@dinofe/xt-core/web'
 * const localSize = getStorageSize('localStorage')
 * ```
 * 
 * @example 获取 sessionStorage 占用空间大小
 * ```ts
 * import { getStorageSize } from '@dinofe/xt-core/web'
 * const sessionSize = getStorageSize('sessionStorage')
 * ```
 * 
 * @example 枚举参数可以引入
 * ```ts
 * import { StorageType, getStorageSize } from '@dinofe/xt-core/web'
 * const localSize = getStorageSize(StorageType.localStorage)
 * ```
 * 
 * @public
 */
export function getStorageSize(type: StorageType): IStorageSize {
  if (![StorageType.localStorage, StorageType.sessionStorage].includes(type)) {
    throw new TypeError('the param type should be one of ["localStorage", "sessionStorage"]')
  }

  if (!validateStorageAvailable(type)) {
    throw new Error(`window.${type} is not available`)
  }

  const storage = window[type]
  const keys = Object.keys(storage)
  let totalSize = 0

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = storage.getItem(key);
    const sizeInBytes = value === null ? 0 : new Blob([value]).size;
    totalSize += sizeInBytes;
  }

  const totalSizeInKB = (totalSize / 1024).toFixed(2);
  const totalSizeInMB = (totalSize / 1024 / 1024).toFixed(2);
  const totalSizeInGB = (totalSize / 1024 / 1024 / 1024).toFixed(2);

  return {
    sizeBytes: totalSize,
    sizeKB: totalSizeInKB,
    sizeMB: totalSizeInMB,
    sizeGB: totalSizeInGB,
    sizeInBytes: totalSize + 'B',
    sizeInKB: totalSizeInKB + 'KB',
    sizeInMB: totalSizeInMB + 'MB',
    sizeInGB: totalSizeInGB + 'GB',
  };
}
