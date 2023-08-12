export type AppConfig = {
  appId: string
  merNo: string
  deviceId: string
  indexDoc: string
  domain: string
  basic: string
  basicImgUrl: string
  appKey: string
}

export type SObject<D = string> = {
  [k: string]: D
}

export interface IImageSize {
  width: number
  height: number
}
