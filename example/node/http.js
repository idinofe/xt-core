const { createBaseHttp } = require('@dinofe/xt-core/http')

const baseHttp = createBaseHttp({
  encrypt: false,
  commonParams: {
    appId: '3130042001040',
    merNo: '130042001040',
    deviceId: 'hbjh_h5'
  }
}, {
  baseURL: 'https://yfzx.whty.com.cn/dev-c2b/hbccb-interface',
  appKey: '3a2e424c56754e90a8948b74f163f0cb', // 不加密时可以不配置秘钥
  onFail: (msg) => {
    log(msg)
  },
  onInvalidToken: (res) => {
    log('Token已失效', res.code, res.msg)
  }
})

baseHttp.post('/user/bankQuickLogin', { openid: '1652454242' }).then(res => {
  console.log(res)
})
