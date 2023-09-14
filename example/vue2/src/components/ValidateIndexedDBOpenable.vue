<template>
  <div class="validate-indexedDB-openable">
    <div class="card">
      <p>是否支持indexedDB: {{ isIndexedDBSupport }}</p>
      <button @click="handleCheckClick">检测</button>
    </div>
  </div>
</template>

<script>
import { validateIndexedDBOpenable } from '@dinofe/xt-core/web'
import { delay } from '@dinofe/xt-core/common'

export default {
  name: 'ValidateIndexedDBOpenable',
  data () {
    return {
      isIndexedDBSupport: '检测中'
    }
  },
  methods: {
    handleCheckClick () {
      this.check()
    },
    async check () {
      this.isIndexedDBSupport = '检测中'
      await delay(1000)
      validateIndexedDBOpenable().then(isSupport => {
        this.isIndexedDBSupport = isSupport
      })
    }
  },
  mounted () {
    this.check()
  }
}
</script>
