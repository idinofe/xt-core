<template>
  <div class="upload-file">
    <label for="file">选择文件</label>
    <input id="file" type="file" accept="image/png, image/jpeg" @change="handleFileChange">
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import axios from 'axios'
import { create } from 'apisauce'
import { createUploadHttp, createBaseHttp, createHttp } from '@dinofe/xt-core/http'
// import { createUploadHttp, createBaseHttp, createHttp } from '../../../../dist/cjs/http'
import token from '../utils/token'

const appParams = {
  appId: '3130042001040',
  merNo: '130042001040',
  deviceId: 'hbjh_h5'
}

const appConfig = {
  basicImageUrl: 'https://yfzx.whty.com.cn/dev-c2b/'
}

const appKey = '123'

const baseHttp = createBaseHttp({
  encrypt: false,
  commonParams: {
    appId: appParams.appId,
    merNoNo: appParams.merNo,
    authorization: token.get()
  }
}, { baseURL: '/api-hbccb' })

const http = createHttp({
  baseURL: '/api-hbccb',
  useEncrypt: false,
  useSign: false,
  commonParams: () => Promise.resolve({
    appId: appParams.appId,
    merNoNo: appParams.merNo,
    authorization: token.get()
  })
})
const uploadHttp = createUploadHttp(appParams, { appKey: appKey, getToken: () => token.get() })

export default {
  data () {
    return {}
  },
  methods: {
    /**
     * 文件change
     * @param {HTMLInputElement} e Event
     */
    async handleFileChange (e) {
      console.log(e.target.files)
      if (!e.target.files[0]) {
        return
      }
      const file = e.target.files[0]
      console.log(file)

      if (!token.get()) {
        console.log('未登录，开始自动登录...')
        await this.login()
      }

      uploadHttp.upload('/api-hbccb/file/upload/stream/sign', { file }, { onUploadProgress: this.onUploadProgress })
        .then(res => {
          console.log(res)
          if (res.success) {
            console.log('上传成功')
            console.log('core', res.data)
            const { body: { imgUrl } = {} } = res.data || {}
            console.log('上传结果：', imgUrl)
          } else {
            console.log(res.msg)
          }
        }).catch(e => {
          console.error(e)
        })

      // 测试 axios 上传
      // const fd = new FormData()
      // fd.append('file', file)
      // axios.post('/api-hbccb/file/upload/stream/sign', fd)
      //   .then(res => {
      //     console.log('axios', res)
      //   }).catch(e => {
      //     console.log('axios', e)
      //   })

      // 测试apisauce上传
      // const ashttp = create({
      //   baseURL: ''
      // })
      // ashttp.post('/api-hbccb/file/upload/stream/sign', fd)
      //   .then(res => {
      //     console.log('ashttp', res)
      //   })
    },
    login (openid) {
      return http.post('/user/bankQuickLogin', { openid })
        .then(res => {
          console.log('login', res)
          if (res.success) {
            return Promise.resolve(res.data.body)
          } else {
            return Promise.reject(res.msg)
          }
        })
        .then(body => {
          return Promise.resolve(body.token)
        })
        .catch(msg => {
          console.log(msg)
        })
    },
    onUploadProgress (e) {
      console.log(e)
    }
  },
  mounted () {
    this.login('15856151').then(_token => {
      console.log(_token)
      token.set(_token)
      console.log('token ', token.get())
    })
  }
}
</script>

<style>
</style>
