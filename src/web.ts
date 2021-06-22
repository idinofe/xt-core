/**
 * 适用于浏览器环境的相关库
 * 主要功能：
 * 1、复制文本到剪贴板
 */

export const COPY_FAIL_MESSAGE = '当前环境不支持复制'

type SObject = {
  [k: string]: string
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
