<template>
  <div class="validate-storage-avaiable">
    <div class="card">
      <div class="line-1">
        <p>是否支持localStorage：{{ isLocalStorageAvaiable }}</p>
        <button @click="handleCheckLocalClick">检测</button>
      </div>
      <div class="line-2">
        <p>是否支持sessionStorage：{{ isSessionStorageAvaiable }}</p>
        <button @click="handleCheckSessionClick">检测</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { validateStorageAvailable, StorageType } from '@dinofe/xt-core/web'
import { delay } from '@dinofe/xt-core/common';

const isLocalStorageAvaiable = ref<string | boolean>('检测中')
const isSessionStorageAvaiable = ref<string | boolean>('检测中')

const handleCheckLocalClick = async () => {
  isLocalStorageAvaiable.value = '检测中'
  await delay(1000)
  isLocalStorageAvaiable.value = validateStorageAvailable(StorageType.localStorage)
}

const handleCheckSessionClick = async () => {
  isSessionStorageAvaiable.value = '检测中'
  await delay(1000)
  isSessionStorageAvaiable.value = validateStorageAvailable(StorageType.sessionStorage)
}

onMounted(() => {
  handleCheckLocalClick()
  handleCheckSessionClick()
})
</script>

<style scoped></style>
