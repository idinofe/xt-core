<template>
  <div class="get-storage-size">
    <div class="card">
      <div class="line-1">
        <p>localStorage占用空间大小：</p>
        <p>{{ localSize }}</p>
        <button @click="handleLocalClick">获取</button>
      </div>
      <div class="line-2">
        <p>sessionStorage占用空间大小：</p>
        <p>{{ sessionSize }}</p>
        <button @click="handleSessionClick">获取</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { delay } from '@dinofe/xt-core/common'
import { StroageType, getStorageSize } from '@dinofe/xt-core/web'
import type { IStorageSize } from '@dinofe/xt-core/web'
import { ref, onMounted } from 'vue'

const localSize = ref<string | IStorageSize>('获取中')
const sessionSize = ref<string | IStorageSize>('获取中')

const handleLocalClick = async () => {
  localSize.value = '获取中'
  await delay(1000)
  localSize.value = getStorageSize(StroageType.localStorage)
}

const handleSessionClick = async () => {
  sessionSize.value = '获取中'
  await delay(1000)
  sessionSize.value = getStorageSize(StroageType.sessionStorage)
}

onMounted(() => {
  handleLocalClick()
  handleSessionClick()
})
</script>

<style scoped></style>
