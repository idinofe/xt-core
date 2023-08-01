<script setup lang="ts">
import { onMounted } from 'vue'
import { genOAuthUrl, WxScope } from '@dinofe/xt-core'
import { createHttp } from '@dinofe/xt-core/http'
import { isString } from '@dinofe/xt-core/common'
import DStorage from '@dinofe/xt-core/storage/index'
// import Storage from '@dinofe/xt-core/storage'
import HelloWorld from './components/HelloWorld.vue'
import TheWelcome from './components/TheWelcome.vue'
import UploadFile from './components/UploadFile.vue'
import LoginWithEncrypt from './components/LoginWithEncrypt.vue'

const http = createHttp({
  baseURL: '/api-hbccb',
  // useEncrypt: false,
  // commonParams: () => Promise.resolve({
  //   appId: '3130042001040',
  //   merNoNo: '130042001040',
  //   deviceId: 'hbjh_h5',
  // })
})

onMounted(() => {
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

  http.post('/user/bankQuickLogin', {
    openid: '123',
    headimgurl: '',
    nickname: '',
  }).then(res => {
    if (res.success) {
      console.log('登录成功')
    } else {
      console.log(res.msg)
    }
  }).catch(e => {
    console.log(e)
  })
})

</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />
    </div>
    <UploadFile></UploadFile>
    <LoginWithEncrypt></LoginWithEncrypt>
  </header>

  <main>
    <TheWelcome />
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
