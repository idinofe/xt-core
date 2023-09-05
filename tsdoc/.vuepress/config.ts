import { defineConfig } from 'vuepress/config'

export default defineConfig({
  base: '/xt-core/',
  title: '@dinofe/xt-core',
  description: '提取的一些常用工具方法，包括：Axios 二次封装、基础方法等',
  theme: 'antdocs',
  themeConfig: {
    repo: 'idinofe/xt-core',
    repoLabel: '查看源码',
    editLinks: true,
    editLinkText: '帮助我们改善此页面！',
    lastUpdated: '上次更新',
    docsDir: 'tsdoc',
    smoothScroll: true,
    nav: [
      {
        text: '指南',
        link: '/guide/'
      },
      {
        text: 'API',
        link: '/api/xt-core'
      },
      {
        text: 'GitHub',
        link: 'https://github.com/idinofe/xt-core'
      }
    ],
    sidebar: 'auto',
  },
  plugins: [
    ['vuepress-plugin-seo1', {
      hostname: 'idinofe.github.io',
      autoDescription: true,
    }]
  ]
})
