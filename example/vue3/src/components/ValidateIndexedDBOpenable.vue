<template>
  <div class="validate-indexedDB-openable">
    <div class="card">
      <p>是否支持indexedDB: {{ isIndexedDBSupport }}</p>
      <button @click="handleCheckClick">检测</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { validateIndexedDBOpenable } from '@dinofe/xt-core/web'
import { delay } from '@dinofe/xt-core/common'

const isIndexedDBSupport = ref<string | boolean>('检测中')

const check = async () => {
  isIndexedDBSupport.value = '检测中'
  await delay(1000)
  validateIndexedDBOpenable().then((isSupport: boolean) => {
    isIndexedDBSupport.value = isSupport
  })
}

const handleCheckClick = () => {
  check()
}

onMounted(() => {
  check()
})
</script>
