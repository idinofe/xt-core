/**
 * 适用于浏览器环境的相关库
 */

import { isBlobUrlLike, isUrlLike } from "./common"
import { IImageSize, SObject } from "./type"

/**
 * 复制失败提示信息
 * 
 * @internal
 */
export const COPY_FAIL_MESSAGE = '当前环境不支持复制'

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
 * @returns 结果对象 `{{ url: string, revoke: Function }}`
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
    url,
    revoke
  }
}

/**
 * 加载图片为 {@link https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLImageElement | Image} 对象
 * 
 * @param url - 图片地址，完整地址、相对地址、 Blob 地址或 base64 字符串
 * @param isBase64 [isBase64 = false] - url 是否 base64 字符串
 * @param baseUrl [baseUrl = ''] - 图片基础路径
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
export function loadImage (url: string, isBase64: boolean = false, baseUrl: string = ''): Promise<HTMLImageElement> {
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
 * @param isBase64 [isBase64 = false] - 是否 base64 字符串
 * @param baseUrl [baseUrl = ''] - 图片基础路径
 * @returns Promise 包装的图片尺寸对象
 * 
 * @internal
 */
function _getImageSize(data: string, isBase64: boolean, baseUrl: string): Promise<IImageSize>
function _getImageSize(data: HTMLImageElement): Promise<IImageSize>
function _getImageSize(data: File): Promise<IImageSize>
function _getImageSize(data: string | HTMLImageElement | File, isBase64: boolean = false, baseUrl: string = ''): Promise<IImageSize> {
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
 * @param data - base64 字符串（可以包含`'data:image/jpegbas64,'`会被忽略）
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
  const base64Data = data.replace(/^data:[a-z]+\/[a-z]+base64,/, '')

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
