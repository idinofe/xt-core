const assert = require('assert').strict
const { genRedirectUrl, genOAuthUrl } = require('../dist/cjs/')

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

assert.deepEqual(genRedirectUrl(options), 'https%3A%2F%2Fwww.baidu.com%2Ftest%2F')
assert.deepEqual(genRedirectUrl(options), encodeURIComponent('https://www.baidu.com/test/'))

// domain
assert.deepEqual(genRedirectUrl({
  ...options,
  domain: 'www.bing.com'
}), encodeURIComponent('https://www.bing.com/test/'))
assert.deepEqual(genRedirectUrl({
  ...options,
  domain: 'www.bing.com/'
}), encodeURIComponent('https://www.bing.com/test/'))
assert.deepEqual(genRedirectUrl({
  ...options,
  domain: 'www.bing.com:443'
}), encodeURIComponent('https://www.bing.com:443/test/'))
assert.deepEqual(genRedirectUrl({
  ...options,
  domain: 'www.bing.com:443/'
}), encodeURIComponent('https://www.bing.com:443/test/'))

// indexDoc
assert.deepEqual(genRedirectUrl({
  ...options,
  indexDoc: 'demo'
}), encodeURIComponent('https://www.baidu.com/demo/'))
assert.deepEqual(genRedirectUrl({
  ...options,
  indexDoc: ''
}), encodeURIComponent('https://www.baidu.com/'))
assert.deepEqual(genRedirectUrl({
  ...options,
  indexDoc: '/path/to/index/doc/'
}), encodeURIComponent('https://www.baidu.com/path/to/index/doc/'))
assert.deepEqual(genRedirectUrl({
  ...options,
  indexDoc: '/path/to/index/doc///'
}), encodeURIComponent('https://www.baidu.com/path/to/index/doc/'))

// https
assert.deepEqual(genRedirectUrl({
  ...options,
  https: false
}), encodeURIComponent('http://www.baidu.com/test/'))
assert.deepEqual(genRedirectUrl({
  ...options,
  https: 0
}), encodeURIComponent('http://www.baidu.com/test/'))
assert.deepEqual(genRedirectUrl({
  ...options,
  https: null
}), encodeURIComponent('http://www.baidu.com/test/'))
assert.deepEqual(genRedirectUrl({
  ...options,
  https: undefined
}), encodeURIComponent('https://www.baidu.com/test/'))

// appendHtml
assert.deepEqual(genRedirectUrl({
  ...options,
  appendHtml: true
}), encodeURIComponent('https://www.baidu.com/test/index.html'))
assert.deepEqual(genRedirectUrl({
  ...options,
  appendHtml: 1
}), encodeURIComponent('https://www.baidu.com/test/index.html'))
assert.deepEqual(genRedirectUrl({
  ...options,
  indexDoc: '/demo/',
  appendHtml: true
}), encodeURIComponent('https://www.baidu.com/demo/index.html'))


// genOAuthUrl

assert.deepEqual(genOAuthUrl(wechatOptions),'https://open.weixin.qq.com/connect/oauth2/authorize?appid=123456&redirect_url=https%3A%2F%2Fwww.baidu.com%2Ftest%2F&response_type=scope&scope=snsapi_base&state=0&component_appid=1123456#wechat_redirect')

// redirect_url
assert.deepEqual(genOAuthUrl({
  ...wechatOptions,
  redirect_url: ''
}), 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=123456&redirect_url=&response_type=scope&scope=snsapi_base&state=0&component_appid=1123456#wechat_redirect')

// wx_scope
assert.deepEqual(genOAuthUrl({
  ...wechatOptions,
  wx_scope: 'snsapi_info'
}), 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=123456&redirect_url=https%3A%2F%2Fwww.baidu.com%2Ftest%2F&response_type=scope&scope=snsapi_info&state=0&component_appid=1123456#wechat_redirect')

// state
assert.deepEqual(genOAuthUrl({
  ...wechatOptions,
  state: '1'
}), 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=123456&redirect_url=https%3A%2F%2Fwww.baidu.com%2Ftest%2F&response_type=scope&scope=snsapi_base&state=1&component_appid=1123456#wechat_redirect')

// hash
assert.deepEqual(genOAuthUrl({
  ...wechatOptions,
  hash: '#wechat_redirecttt'
}), 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=123456&redirect_url=https%3A%2F%2Fwww.baidu.com%2Ftest%2F&response_type=scope&scope=snsapi_base&state=0&component_appid=1123456#wechat_redirecttt')
