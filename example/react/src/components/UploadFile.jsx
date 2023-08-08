// import { useEffect } from 'react'
import { createUploadHttp, createHttp } from '@dinofe/xt-core/http'
import token from '../utils/token'
// import { createHttp } from '@dinofe/xt-core'

const log = (...args) => console.log(`[UploadFile]`, ...args)

const http = createHttp({
  baseURL: '/api-hbccb',
  useEncrypt: false,
  useSign: false,
  commonParams: () => {
    return {
      appId: '',
      merNoNo: '',
      deviceId: '',
      authorization: token.get(),
    }
  }
})

const uploadHttp = createUploadHttp({
  appId: '',
  merNo: '',
  deviceId: '',
}, {
  baseURL: '',
  appKey: ''
})

/**
 * 上传进度变更
 * @param {MouseEvent} e 
 */
function onUploadProgress (e) {
  console.log(e)
}

function login (openid) {
  return http.post('', { openid })
    .then(res => {
      if (res.success) {
        log('登录成功')
        return Promise.resolve(res.data.body)
      } else {
        log('登录失败', res.code, res.msg)
        return Promise.reject(res.msg)
      }
    })
    .then(body => {
      return Promise.resolve(body.token)
    })
    .then(t => {
      token.set(t)
      return Promise.resolve()
    })
    .catch(msg => {
      log(msg)
    })
}

function upload (file) {
  return uploadHttp.upload('', { file }, { onUploadProgress })
      .then(res => {
        log(res)
        if (res.success) {
          log('上传成功')
        } else {
          log('上传失败', res.code, res.msg)
        }
      })
      .finally(() => {
        const fileEl = document.querySelector('#file')
        log(fileEl.value)
        fileEl.value = ''
      })
}

function UploadFile () {
  /**
   * 文件change
   * @param {InputEvent} e 
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) {
      return
    }
    if (!token.get()) {
      log('未登录，开始自动登录...')
      login('13531141').then(() => {
        log('开始上传')
        upload(file)
      })
    } else {
      log('已登录，直接上传...')
      upload(file)
    }
  }
  return (
    <>
      <label htmlFor="file">请选择文件</label>
      <input type="file" id="file" onChange={handleFileChange} />
    </>
  )
}

export default UploadFile
