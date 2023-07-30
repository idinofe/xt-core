<template>
  <div class="upload-file">
    <label for="file">选择文件</label>
    <input id="file" type="file" accept="image/png, image/jpeg" @change="handleFileChange">
  </div>
</template>

<script>
import { createUploadHttp } from '@dinofe/xt-core'
import token from '../utils/token'

const appParams = {
  appId: '3130042001040',
  merNo: '130042001040',
  deviceId: 'hbjh_h5'
}

const appKey = '123'

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
    handleFileChange (e) {
      console.log(e.target.files)
      if (!e.target.files[0]) {
        return
      }
      const file = e.target.files[0]
      console.log(file)
      uploadHttp.upload('/api-hbccb/file/upload/stream/sign', { file }, { onUploadProgress: this.onUploadProgress })
        .then(res => {
          console.log(res)
          if (res.success) {
            alert('上传成功')
            console.log(res.data)
          } else {
            alert(res.msg)
          }
        }).catch(e => {
          console.error(e)
        })
    },
    onUploadProgress (e) {
      console.log(e)
    }
  }
}
</script>

<style>
</style>
