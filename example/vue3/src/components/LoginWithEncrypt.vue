<template>
  <div class="card">
    <p>createHttp</p>
    <button @click="handleLoginClick">开始登录</button>
    <button @click="handleLoginClick2">开始登录</button>
    <button @click="handleLoginClick3">开始登录{{loading3 ? "loading..." : ""}}</button>
  </div>
  <div class="card">
    <p>createBaseHttp</p>
    <button @click="handleBaseLoginClick">开始登录</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { createHttp, createBaseHttp } from '@dinofe/xt-core/http'
import { runWithDelayedLoading } from "@dinofe/xt-core/common";

const loading3 = ref(false)

const log = (...args: any[]) => console.log(`[LoginWithEncrypt]`, ...args)

const http = createHttp({
  baseURL: '/api-hbccb',
  useEncrypt: true,
  useSign: true,
  appKey: '3a2e424c56754e90a8948b74f163f0cb',
  encryptVersion: '2' as any,
  commonParams: () => ({
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

const baseHttp = createBaseHttp({
  encrypt: true,
  commonParams: {
    appId: '3130042001040',
    merNo: '130042001040',
    deviceId: 'hbjh_h5',
  }
}, {
  baseURL: '/api-hbccb',
  appKey: '3a2e424c56754e90a8948b74f163f0cb',
  onFail: (msg) => {
    log(msg)
  },
  onInvalidToken: (res) => {
    log('Token已失效', res.code, res.msg)
  }
})

const handleLoginClick = (e: MouseEvent) => {
  http.post('/user/bankQuickLogin', { openid: '1652454242' })
    .then(res => {
      log(res)
      if (res.success) {
        log('登录成功')
        log(res.code)
      } else {
        log('登录失败', res.msg)
      }
    })
}

const handleLoginClick2 = (e: MouseEvent) => {
  http.post('/user/bankQuickLogin', {}, { data: { openid: '1652454242' } })
    .then(res => {
      log(res)
      if (res.success) {
        log('登录成功')
        log(res.code)
      } else {
        log('登录失败', res.msg)
      }
    })
}

const handleLoginClick3 = async (e: MouseEvent) => {
  runWithDelayedLoading(() => http.post('/user/bankQuickLogin', {}, { data: { openid: '1652454242' } }), {
    onLoading() {
      loading3.value = true
    },
    onSettled() {
      loading3.value = false
    },
    loadingDelay: 0,
    minLoadingDuration: 3000
  }).then((res) => {
    // FIXME: 不会等到3s延时后再执行？
    log(res)
    if (res.success) {
      log('登录成功')
      log(res.code)
    } else {
      log('登录失败', res.msg)
    }
  })
}

const handleBaseLoginClick = (e: MouseEvent) => {
  baseHttp.post('/user/bankQuickLogin', { openid: '1652454243' })
    .then(res => {
      log(res)
      if(res.success) {
        log('登录成功')
        log(res.code)
      } else {
        log('登录失败', res.msg)
      }
    })
}
</script>

<style scoped></style>
