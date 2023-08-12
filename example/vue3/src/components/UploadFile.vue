<template>
  <div class="upload-file">
    <div class="card">
      <p>createUploadHttp</p>
      <label for="file">选择文件</label>
      <input id="file" type="file" accept="image/png, image/jpeg" @change="handleFileChange">
    </div>
  </div>
</template>

<script lang="ts">
import { createHttp, createUploadHttp } from '@dinofe/xt-core/http'
import token from '@/utils/token'

const appParams = {
  appId: '3130042001040',
  merNo: '130042001040',
  deviceId: 'hbjh_h5'
}

const appKey = '3a2e424c56754e90a8948b74f163f0cb'

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
const uploadHttp = createUploadHttp(appParams, {
  appKey: appKey,
  getToken: () => {
    return token.get() as any
  },
  baseURL: '/api-hbccb'
})

export default {
  setup () {},
  methods: {
    /**
     * 文件change
     * @param e {Event}
     */
    async handleFileChange (e: Event) {
      if (!(e as any).target.files[0]) {
        return
      }
      if (!token.get()) {
        console.log('未登录，开始自动登录...')
        await this.login('15856151')
      } else {
        console.log('已登录，开始上传文件...')
      }

      const file = (e.target as any).files[0]

      uploadHttp.upload('/file/upload/stream/sign', { file }, { onUploadProgress: this.onUploadProgress })
        .then(res => {
          if (res.success) {
            console.log('上传成功')
            console.log('core', res.data)
            const { body: { imgUrl = '' } = {} } = (res.data || {}) as any
            console.log('上传结果：', imgUrl)
          } else {
            console.log(res.msg)
          }
        })
        .then(() => {
          const fileEl = document.querySelector('#file') as HTMLInputElement
          if (fileEl) {
            console.log(fileEl.value)
            fileEl.value = ''
          }
        })
    },
    login (openid: string): Promise<any> {
      return http.post<any, any>('/user/bankQuickLogin', { openid })
      .then(res => {
          console.log('login', res)
          if (res.success) {
            console.log('登录成功')
            return Promise.resolve(res.data.body)
          } else {
            return Promise.reject(res.msg)
          }
        })
        .then(body => {
          return Promise.resolve(body.token)
        })
        .then(t => {
          token.set(t)
          return t
        })
        .catch(msg => {
          console.log(msg)
        })
    },
    onUploadProgress (e: ProgressEvent) {
      console.log(e, e.loaded, e.total)
    }
  },
  mounted () {
    // this.login('15856151').then(_token => {
    //   console.log(_token)
    //   token.set(_token)
    //   console.log('token ', token.get())
    // })
  }
}
</script>

<style scoped>
.card {
  border: 1px solid #efefef;
  border-radius: 5px;
  padding: 8px;
}
.card:not(:last-child) {
  margin-bottom: 16px;
}
</style>
