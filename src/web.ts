/**
 * 适用于浏览器环境的相关库
 * 主要功能：
 * 1、复制文本到剪贴板
 * 2、获取图片尺寸大小
 * 3、base64 字符串转换为 Blob
 */

import { isBlobUrlLike, isUrlLike } from "./common"
import { IImageSize, SObject } from "./type"

export const COPY_FAIL_MESSAGE = '当前环境不支持复制'
export const enum MIME_TYPE {
  JPG = 'image/jpeg',
  PNG = 'image/png',
  GIF = 'image/gif',
}

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
 * @param text string
 * @returns Promise<void>
 */
 export const copyToClipboard = (text: string): Promise<void> => {
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
 * 文件对象转为 URL 链接（使用 URL.createObjectURL）
 * @param {Blob | File} blob 文件对象
 * @returns {{ url: string, revoke: Function }}
 */
export const convertBlobToUrl = (blob: Blob | File) => {
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
 * 加载图片为 Image 对象
 * @param {string} url 图片地址，完整地址、相对地址、 blob 地址或 base64 字符串
 * @param {boolean} [isBase64 = false]  url 是否 base64 字符串
 * @param {string} [baseUrl = ''] 图片基础路径
 * @returns {HTMLImageElement} 图片 Image 对象
 */
export const loadImage = (url: string, isBase64: boolean = false, baseUrl: string = ''): Promise<HTMLImageElement> => {
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
 * @param {string | HTMLImageElement} data 图片地址或 Image 对象
 * @param {boolean} [isBase64 = false] 是否 base64 字符串
 * @param {string} [baseUrl = ''] 图片基础路径
 * @returns {Promise<IImageSize>}
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

export const getImageSize = _getImageSize

/**
 * base64 字符串转为 Blob
 * referrence: https://developer.mozilla.org/zh-CN/docs/Glossary/Base64
 * referrence: https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
 * @param data {string} base64 字符串（可以包含`data:image/jpegbas64,`会被忽略）
 * @param mimeType {MIME_TYPE} MIME 类型
 * @param sliceSize {number} 切片大小
 * @returns {Blob}
 */
export const base64ToBlob = (data: string, mimeType = MIME_TYPE.JPG, sliceSize = 512): Blob => {
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
