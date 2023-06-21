/**
 * 适用于浏览器环境的相关库
 * 主要功能：
 * 1、复制文本到剪贴板
 */

import { isBlobUrlLike, isUrlLike } from "./common"

export const COPY_FAIL_MESSAGE = '当前环境不支持复制'

type SObject = {
  [k: string]: string
}

interface IImageSize {
  width: number
  height: number
}

function createElement(tag: string, style: SObject) {
  const el = document.createElement(tag)
  const keys = Object.keys(style)
  keys.forEach((key) => {
    el.style[(key as unknown as number)] = style[(key as keyof SObject)]
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
// function _getImageSize(data: File): Promise<IImageSize>
// TODO: 若使用函数重载的话，这里如何使用 typeof 区分 HTMLImageElement/File/string
function _getImageSize(data: string | HTMLImageElement, isBase64: boolean = false, baseUrl: string = ''): Promise<IImageSize> {
  if (typeof data === 'string') {
    return new Promise((resolve, reject) => {
      loadImage(data, isBase64, baseUrl).then((image) => {
        resolve({
          width: image.width,
          height: image.height,
        })
      }).catch(reject)
    })
  } else {
    return Promise.resolve({
      width: data.width,
      height: data.height,
    })
  }
}

export const getImageSize = _getImageSize
