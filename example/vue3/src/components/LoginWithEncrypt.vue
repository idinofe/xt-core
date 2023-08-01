<template>
  <div>
    <button @click="handleLoginClick">开始登录</button>
  </div>
</template>

<script setup lang="ts">
import { createHttp } from '@dinofe/xt-core/http'

const log = (...args: any[]) => console.log(`[LoginWithEncrypt]`, ...args)

const http = createHttp({
  baseURL: '/api-hbccb',
  useEncrypt: true,
  useSign: true,
  appKey: '3a2e424c56754e90a8948b74f163f0cb',
  encryptVersion: '2' as any,
  commonParams: () => Promise.resolve({
    appId: '3130042001040',
    deviceId: 'hbjh_h5',
    merNoNo: '130042001040',
  }),
  onFail: (msg) => {
    log(msg)
  },
  onInvalidToken: (res) =>{
    log('Token已失效', res.code, res.msg)
  },
})

const handleLoginClick = (e: MouseEvent) => {
  http.post('/user/bankQuickLogin', { openid: '1652454242' })
    .then(res => {
      log(res)
      if (res.success) {
        log(res.msg)
      } else {
        log('登录失败', res.msg)
      }
    })
}
</script>

<style></style>
