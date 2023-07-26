import { useEffect } from 'react'
import { genOAuthUrl, WxScope } from '@dinofe/xt-core'
import { isString } from '@dinofe/xt-core/common'
import DStorage from '@dinofe/xt-core/storage/index'
import Storage from '@dinofe/xt-core/storage'
import logo from './logo.svg';
import './App.css';

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
    console.log(Storage)
  }, [])
  
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
