<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
    <UploadFile></UploadFile>
  </div>
</template>

<script>
/* eslint-disable import/no-duplicates */
import { genOAuthUrl, WxScope } from '@dinofe/xt-core'
import { createHttp } from '@dinofe/xt-core/http'
import { isString } from '@dinofe/xt-core/common'
import DStorage from '@dinofe/xt-core/storage/index'
// FIXME: 这个引入写法会报错：找不到模块
// import Storage from '@dinofe/xt-core/storage'
import HelloWorld from './components/HelloWorld.vue'
import UploadFile from './components/UploadFile.vue'

const http = createHttp({
  baseURL: '/api-hbccb'
  // useEncrypt: false,
  // commonParams: () => Promise.resolve({
  //   appId: '3130042001040',
  //   merNoNo: '130042001040',
  //   deviceId: 'hbjh_h5',
  // })
})

export default {
  name: 'App',
  components: {
    HelloWorld,
    UploadFile
  },
  mounted () {
    const url = genOAuthUrl({
      wx_appid: '1465416213',
      wx_scope: WxScope.snsapi_base,
      redirect_url: 'http://www.example.com/'
    })
    console.log(url)

    // exports 导出的方法能正常引入使用，但是没有类型提示
    console.log(isString(url))
    console.log(DStorage)
    // console.log(Storage)

    http.post('/user/bankQuickLogin', {
      openid: '123',
      headimgurl: '',
      nickname: ''
    }).then(res => {
      if (res.success) {
        console.log('登录成功')
      } else {
        console.log(res.msg)
      }
    }).catch(e => {
      console.log(e)
    })
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
