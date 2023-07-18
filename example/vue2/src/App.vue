<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
/* eslint-disable import/no-duplicates */
import { genOAuthUrl, WxScope } from '@dinofe/xt-core'
import { isString } from '@dinofe/xt-core/common'
import DStorage from '@dinofe/xt-core/storage/index'
import Storage from '@dinofe/xt-core/storage'
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',
  components: {
    HelloWorld
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
    console.log(Storage)
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
