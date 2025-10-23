const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    // proxy: 'https://yfzx.whty.com.cn/dev-c2b/hbccb-interface'
    proxy: {
      '/api-hbccb': {
        target: 'https://yfzx.whty.com.cn/dev-c2b/hbccb-interface',
        ws: true,
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/api-hbccb/': '/'
        },
        logLevel: 'debug'
      }
    }
  },
  configureWebpack: {
    devtool: 'source-map'
  }
})
