const { genRedirectUrl } = require('@dinofe/xt-core')
const { floatDivide } = require('@dinofe/xt-core/common')

const url = genRedirectUrl({
  appId: 'string',
  merNo: 'string',
  deviceId: 'string',
  indexDoc: 'string',
  domain: 'string',
  basic: 'string',
  basicImgUrl: 'string',
})

const f1 = floatDivide(377, 100)

console.log(url, f1)
