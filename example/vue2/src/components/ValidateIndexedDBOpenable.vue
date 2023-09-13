<template>
  <div class="validate-indexedDB-openable">
    <p>是否支持indexedDB: {{ isIndexedDBSupport }}</p>
  </div>
</template>

<script>
import { validateIndexedDBOpenable } from '@dinofe/xt-core/web'

export default {
  name: 'ValidateIndexedDBOpenable',
  data () {
    return {
      isIndexedDBSupport: '检测中'
    }
  },
  mounted() {
    validateIndexedDBOpenable.then(isSupport => {
      this.isIndexedDBSupport = isSupport
    })
  }
}
</script>
