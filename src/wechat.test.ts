import { genRedirectUrl, genOAuthUrl, decodeOAuthUrl } from './wechat'

const options = {
  appId: '12345678',
  merNo: '112345678',
  deviceId: 'test',
  indexDoc: 'test',
  domain: 'www.baidu.com',
  basic: 'api.baidu.com',
  basicImgUrl: 'img.baidu.com',
  https: true
}

const wechatOptions = {
  wx_appid: '123456',
  wx_component_appid: '1123456',
  wx_scope: 'snsapi_base',
  redirect_url: genRedirectUrl(options),
  state: '0'
}

describe('decodeOAuthUrl', () => {
  it('normal', () => {
    expect(decodeOAuthUrl(
      'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx520c15f417810387&redirect_uri=https%3A%2F%2Fchong.qq.com%2Fphp%2Findex.php%3Fd%3D%26c%3DwxAdapter%26m%3DmobileDeal%26showwxpaytitle%3D1%26vb2ctag%3D4_2030_5_1194_60&response_type=code&scope=snsapi_base&state=123#wechat_redirect'
      )).toEqual({
        valid: true,
        data: {
          wx_appid: 'wx520c15f417810387',
          redirect_url: 'https://chong.qq.com/php/index.php?d=&c=wxAdapter&m=mobileDeal&showwxpaytitle=1&vb2ctag=4_2030_5_1194_60',
          response_type: 'code',
          wx_scope: 'snsapi_base',
          state: '123',
          hash: '#wechat_redirect'
        }
      })

    expect(decodeOAuthUrl(
      'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx807d86fb6b3d4fd2&redirect_uri=http%3A%2F%2Fdevelopers.weixin.qq.com&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect'
    )).toEqual({
      valid: true,
      data: {
        wx_appid: 'wx807d86fb6b3d4fd2',
        redirect_url: 'http://developers.weixin.qq.com',
        response_type: 'code',
        wx_scope: 'snsapi_userinfo',
        state: 'STATE',
        hash: '#wechat_redirect'
      }
    })
  })

  it('invalid url', () => {
    const invalidUrls = [
      123,
      'aagagda',
      {},
      null,
      undefined,
      true,
      'https://www.baidu.com/',
      'http://www.baidu.com/',
      'https://open.weixin.qq.com/connect/oauth2/authorize/adadada/adada'
    ]
    invalidUrls.forEach((url) => {
      expect(decodeOAuthUrl(url as any)).toEqual({
        valid: false,
        data: null
      })
    })
  })
})
