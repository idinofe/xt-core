<template>
  <div class="get-storage-size">
    <div class="card">
      <div class="line-1">
        <p>localStorage占用空间大小：</p>
        <p>{{ localSize }}</p>
        <button @click='handleLocalClick'>获取</button>
      </div>
      <div class="line-2">
        <p>sessionStorage占用空间大小：</p>
        <p>{{ sessionSize }}</p>
        <button @click='handleSessionClick'>获取</button>
      </div>
    </div>
  </div>
</template>

<script>
import { delay } from '@dinofe/xt-core/common'
import { getStorageSize, StorageType } from '@dinofe/xt-core/web'

export default {
  name: 'GetStorageSize',
  data () {
    return {
      localSize: '获取中',
      sessionSize: '获取中'
    }
  },
  methods: {
    async handleLocalClick () {
      this.localSize = '获取中'
      await delay(1000)
      this.localSize = getStorageSize(StorageType.localStorage)
    },
    async handleSessionClick () {
      this.sessionSize = '获取中'
      await delay(1000)
      this.sessionSize = getStorageSize(StorageType.sessionStorage)
    }
  },
  mounted () {
    this.handleLocalClick()
    this.handleSessionClick()
  }
}
</script>

<style scoped></style>
