import { useEffect } from 'react'
import { genOAuthUrl, WxScope } from '@dinofe/xt-core'
import { isString } from '@dinofe/xt-core/common'
import DStorage from '@dinofe/xt-core/storage/index'
// FIXME: 这个引入写法会报错：找不到模块
// import Storage from '@dinofe/xt-core/storage'
import LoginWithEncrypt from './components/LoginWithEncrypt'
import UploadFile from './components/UploadFile'

import './App.css';

// 测试接口代理功能 https://create-react-app.dev/docs/proxying-api-requests-in-development/
fetch('/api-hbccb/user/bankQuickLogin', { method: 'POST', body: JSON.stringify({
  "authorization": "undefined",
  "deviceId": "hbjh_h5",
  "merNoNo": "130042001040",
  "appId": "3130042001040",
  "msgId": "1691490053678",
  "body": {
    "openid": "19411131"
  }
}), headers: { 'content-type': 'application/json' } }).then(res => res.json()).then(res => {
  console.log(res)
})

function App() {

  useEffect(() => {
    const url = genOAuthUrl({
      wx_appid: '1465416213',
      wx_scope: WxScope.snsapi_base,
      redirect_url: 'http://www.example.com/'
    })
    console.log(url)

    // exports 导出的方法能正常引入使用，但是没有类型提示
    console.log(isString(url))
    console.log(DStorage)
    // console.log(Storage)
  }, [])
  
  return (
    <div className="App">
      <LoginWithEncrypt></LoginWithEncrypt>
      <UploadFile></UploadFile>
    </div>
  );
}

export default App;
