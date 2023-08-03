<template>
  <div class="upload-file">
    <label for="file">选择文件</label>
    <input id="file" type="file" accept="image/png, image/jpeg" @change="handleFileChange">
  </div>
</template>

<script lang="ts">
import { onMounted } from 'vue'
import { createHttp, createBaseHttp, createUploadHttp } from '@dinofe/xt-core/http'
import token from '@/utils/token'

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
const uploadHttp = createUploadHttp(appParams, {
  appKey: appKey, getToken: () => {
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
    },
    login (openid: string): Promise<any> {
      // FIXME: createHttp需要兼容：不管是否开启加密，
      // post方法都不需要body一节点，createHttp方法内
      // 部进行判断，否则加密与不加密方法进行post请求时
      // 传递的参数结构不一致
      return http.post<any, any>('/user/bankQuickLogin', {
        body: { openid }
      })
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
    onUploadProgress (e: ProgressEvent) {
      console.log(e, e.loaded, e.total)
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

<style></style>
