import { createHttp, createBaseHttp } from '@dinofe/xt-core'
import token from '../utils/token'

const appKey = '3a2e424c56754e90a8948b74f163f0cb'

const appParams = {
  appId: '3130042001040',
  merNo: '130042001040',
  deviceId: 'hbjh_h5'
}

const http = createHttp({
  baseURL: '/api-hbccb',
  useEncrypt: true,
  useSign: true,
  appKey: appKey,
  commonParams: () => (appParams)
})

const baseHttp = createBaseHttp({
  encrypt: true,
  appKey: appKey,
  commonParams: appParams,
  authorization: () => token.get()
}, {
  baseURL: '/api-hbccb',
  appKey: appKey,
})

const handleLoginClick = () => {
  http.post('/user/bankQuickLogin', { openid: '12315312' })
    .then(res => {
      if (res.success) {
        console.log('登录成功', res.data.body)
      } else {
        console.log('登录失败', res.data)
      }
    })
}

const handleLoginClick2 = () => {
  baseHttp.post('/user/bankQuickLogin', { openid: '12315312' })
    .then(res => {
      if (res.success) {
        console.log('登录成功')
      } else {
        console.log('登录失败', res.data)
      }
    })
}

function LoginWithEncrypt() {
  return (
    <>
      <div className="card">
        <p>createHttp</p>
        <button onClick={handleLoginClick}>开始登录</button>
      </div>
      <div className="card">
        <p>createBaseHttp</p>
        <button onClick={handleLoginClick2}>开始登录</button>
      </div>
    </>
  )
}

export default LoginWithEncrypt
