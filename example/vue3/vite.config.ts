import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api-hbccb': {
        target: 'https://yfzx.whty.com.cn/dev-c2b/hbccb-interface',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-hbccb/, ''),
      },
    }
  }
})
