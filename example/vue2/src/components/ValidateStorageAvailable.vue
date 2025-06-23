<template>
  <div class="validate-storage-avaiable">
    <div class="card">
      <div class="line-1">
        <p>是否支持localStorage：{{ isLocalStorageAvaiable }}</p>
        <button @click="handleCheckLocalClick">检测</button>
      </div>
      <div class="line-2">
        <p>是否支持localStorage：{{ isSessionStorageAvaiable }}</p>
        <button @click="handleCheckSessionClick">检测</button>
      </div>
    </div>
  </div>
</template>

<script>
import { validateStorageAvailable, StorageType } from '@dinofe/xt-core/web'
import { delay } from '@dinofe/xt-core/common'

export default {
  name: 'ValidateStorageAvailable',
  data () {
    return {
      isLocalStorageAvaiable: '检测中',
      isSessionStorageAvaiable: '检测中'
    }
  },
  methods: {
    async handleCheckLocalClick () {
      this.isLocalStorageAvaiable = '检测中'
      await delay(1000)
      this.isLocalStorageAvaiable = validateStorageAvailable(StorageType.localStorage)
    },
    async handleCheckSessionClick () {
      this.isSessionStorageAvaiable = '检测中'
      await delay(1000)
      this.isSessionStorageAvaiable = validateStorageAvailable(StorageType.sessionStorage)
    }
  },
  mounted () {
    this.handleCheckLocalClick()
    this.handleCheckSessionClick()
  }
}
</script>

<style scoped></style>
