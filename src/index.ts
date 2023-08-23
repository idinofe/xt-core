/**
 * 一个基础库，包含：提取的一些常用工具方法，Axios二次封装、基础方法等
 * 
 * @remarks
 * 主要包括五大模块：
 * 
 * - common: 常用基础方法
 * 
 * - http: 基于 Axios 的网络请求封装
 * 
 * - url: Url 相关的方法
 * 
 * - web: 仅 Web 环境支持的方法
 * 
 * - wechat: 微信业务相关方法
 * 
 * @packageDocumentation
 */

export * from './wechat'
export * from './web'
export * from './http'
export * from './common'
export * from './url'

// 为了将type.ts中定义的类型导出
// https://api-extractor.com/pages/messages/ae-forgotten-export/
export * from './type'
