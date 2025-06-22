/**
 * 这是公共的类型定义，不包含方法实现
 */

/**
 * AppConfig
 * 
 * @public
 */
export type AppConfig = {
  /**
   * 渠道编号
   * 
   * @public
   */
  appId: string
  /**
   * 商户编号
   * 
   * @public
   */
  merNo: string
  /**
   * 设备编号
   * 
   * @public
   */
  deviceId: string
  /**
   * 部署根路径
   * 
   * @public
   */
  indexDoc: string
  /**
   * 域名
   * 
   * @public
   */
  domain: string
  /**
   * 服务名称
   * 
   * @example `'xxx-interface'`
   * 
   * @public
   */
  basic: string
  /**
   * 图片基础路径
   * 
   * @public
   */
  basicImgUrl: string
  /**
   * 渠道秘钥
   * 
   * @public
   */
  appKey: string
}

/**
 * SObject
 * 
 * @public
 */
export type SObject<D = string> = {
  [k: string]: D
}

/**
 * IImageSize
 * 
 * @public
 */
export interface IImageSize {
  width: number
  height: number
}

/**
 * IRunWithDelayedLoading
 *
 * @public
 */
export interface IRunWithDelayedLoadingOptions {
  loadingDelay?: number
  minLoadingDuration?: number
  onLoading?: () => void
  onSettled?: () => void
}

