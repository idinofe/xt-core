<template>
  <div id="app">
    <LoginWithEncrypt></LoginWithEncrypt>
    <UploadFile></UploadFile>
    <ValidateIndexedDBOpenable></ValidateIndexedDBOpenable>
  </div>
</template>

<script>
/* eslint-disable import/no-duplicates, no-unused-vars */
import { genOAuthUrl, WxScope } from '@dinofe/xt-core'
import { isString } from '@dinofe/xt-core/common'
import DStorage from '@dinofe/xt-core/storage/index'
// FIXME: 这个引入写法会报错：找不到模块
// import Storage from '@dinofe/xt-core/storage'
import UploadFile from './components/UploadFile.vue'
import LoginWithEncrypt from './components/LoginWithEncrypt.vue'
import ValidateIndexedDBOpenable from './components/ValidateIndexedDBOpenable.vue'

export default {
  name: 'App',
  components: {
    UploadFile,
    LoginWithEncrypt,
    ValidateIndexedDBOpenable
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
