import { genRedirectUrl, genOAuthUrl } from "./wechat" 

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

describe('genRedirectUrl', () => {
  it('normal', () => {
    expect(genRedirectUrl(options)).toEqual('https%3A%2F%2Fwww.baidu.com%2Ftest%2F')
    expect(genRedirectUrl(options), encodeURIComponent('https://www.baidu.com/test/'))
  })

  it('domain', () => {
    expect(genRedirectUrl({
      ...options,
      domain: 'www.bing.com'
    })).toEqual(encodeURIComponent('https://www.bing.com/test/'))

    expect(genRedirectUrl({
      ...options,
      domain: 'www.bing.com/'
    })).toEqual(encodeURIComponent('https://www.bing.com/test/'))

    expect(genRedirectUrl({
      ...options,
      domain: 'www.bing.com:443'
    })).toEqual(encodeURIComponent('https://www.bing.com:443/test/'))

    expect(genRedirectUrl({
      ...options,
      domain: 'www.bing.com:443/'
    })).toEqual(encodeURIComponent('https://www.bing.com:443/test/'))
  })

  it('indexDoc', () => {
    expect(genRedirectUrl({
      ...options,
      indexDoc: 'demo'
    })).toEqual(encodeURIComponent('https://www.baidu.com/demo/'))

    expect(genRedirectUrl({
      ...options,
      indexDoc: ''
    })).toEqual(encodeURIComponent('https://www.baidu.com/'))

    expect(genRedirectUrl({
      ...options,
      indexDoc: '/path/to/index/doc/'
    })).toEqual(encodeURIComponent('https://www.baidu.com/path/to/index/doc/'))

    expect(genRedirectUrl({
      ...options,
      indexDoc: '/path/to/index/doc///'
    })).toEqual(encodeURIComponent('https://www.baidu.com/path/to/index/doc/'))
  })

  it('https', () => {
    expect(genRedirectUrl({
      ...options,
      https: false
    })).toEqual(encodeURIComponent('http://www.baidu.com/test/'))

    expect(genRedirectUrl({
      ...options,
      https: 0 as any
    })).toEqual(encodeURIComponent('http://www.baidu.com/test/'))

    expect(genRedirectUrl({
      ...options,
      https: null as any
    })).toEqual(encodeURIComponent('http://www.baidu.com/test/'))

    expect(genRedirectUrl({
      ...options,
      https: undefined
    })).toEqual(encodeURIComponent('https://www.baidu.com/test/'))
  })

  it('appendHtml', () => {
    expect(genRedirectUrl({
      ...options,
      appendHtml: true
    })).toEqual(encodeURIComponent('https://www.baidu.com/test/index.html'))

    expect(genRedirectUrl({
      ...options,
      appendHtml: 1 as any
    })).toEqual(encodeURIComponent('https://www.baidu.com/test/index.html'))

    expect(genRedirectUrl({
      ...options,
      indexDoc: '/demo/',
      appendHtml: true
    })).toEqual(encodeURIComponent('https://www.baidu.com/demo/index.html'))
  })
})

describe('genOAuthUrl', () => {
  it('normal', () => {
    expect(genOAuthUrl(wechatOptions as any)).toEqual('https://open.weixin.qq.com/connect/oauth2/authorize?appid=123456&redirect_url=https%3A%2F%2Fwww.baidu.com%2Ftest%2F&response_type=scope&scope=snsapi_base&state=0&component_appid=1123456#wechat_redirect')
  })

  it('redirect_url', () => {
    expect(genOAuthUrl({
      ...wechatOptions,
      redirect_url: ''
    } as any)).toEqual('https://open.weixin.qq.com/connect/oauth2/authorize?appid=123456&redirect_url=&response_type=scope&scope=snsapi_base&state=0&component_appid=1123456#wechat_redirect')
  })

  it('wx_scope', () => {
    expect(genOAuthUrl({
      ...wechatOptions,
      wx_scope: 'snsapi_info'
    } as any)).toEqual('https://open.weixin.qq.com/connect/oauth2/authorize?appid=123456&redirect_url=https%3A%2F%2Fwww.baidu.com%2Ftest%2F&response_type=scope&scope=snsapi_info&state=0&component_appid=1123456#wechat_redirect')
  })

  it('state', () => {
    expect(genOAuthUrl({
      ...wechatOptions,
      state: '1'
    } as any)).toEqual('https://open.weixin.qq.com/connect/oauth2/authorize?appid=123456&redirect_url=https%3A%2F%2Fwww.baidu.com%2Ftest%2F&response_type=scope&scope=snsapi_base&state=1&component_appid=1123456#wechat_redirect')
  })

  it('hash', () => {
    expect(genOAuthUrl({
      ...wechatOptions,
      hash: '#wechat_redirecttt'
    } as any)).toEqual('https://open.weixin.qq.com/connect/oauth2/authorize?appid=123456&redirect_url=https%3A%2F%2Fwww.baidu.com%2Ftest%2F&response_type=scope&scope=snsapi_base&state=0&component_appid=1123456#wechat_redirecttt')
  })
})
