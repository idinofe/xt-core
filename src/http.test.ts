import { createHttp } from './http'
import { getFreePort } from '../test/port'
import createServer from '../test/server'

import axios from 'axios'

// TODO: 创建一个本地的接口服务，用于真实的接口逻辑测试
const MOCK1 = { returnCode: 'SUCCESS', returnDes: 'ok', data: { a: { b: [1, 2, 3] } } }
let port: any = null
let server: any = null
beforeAll(async () => {
  port = await getFreePort()
  server = await createServer(port, MOCK1)
  console.log('server created at port ', port)
})

afterAll(() => {
  return new Promise((resolve) => {
    (server as any).close(() => {
      resolve()
    })
  })
})

// 配置
describe('check config', () => {
  const baseURL = 'https://example.com'
  it('baseURL is correct', () => {
    const http = createHttp({
      baseURL
    })
    expect(http.getBaseURL()).toEqual(baseURL)
  })
  
  it('should have 3 internal responseTransform', () => {
    const http = createHttp({ baseURL })
    expect(http.responseTransforms.length).toEqual(3)
  })

  it('should have 2 internal responseTransform noFail=true', () => {
    const http = createHttp({ baseURL, noFail: true })
    expect(http.responseTransforms.length).toEqual(2)
  })

  it('should have 1 internal responseTransform noFail=true, noStatusTransform=true', () => {
    const http = createHttp({ baseURL, noFail: true, noStatusTransform: true })
    expect(http.responseTransforms.length).toEqual(1)
  })
})

//成功请求
describe('response success', () => {
  it('normal data with returnCode = SUCCESS', () => {
    const http = createHttp({ baseURL: `http://127.0.0.1:${port}` })
    // axios.post(`http://localhost:${port}`).then(res => {
    //   console.log('axios', res.config, res)
    // })
    http.get('/number/200').then(response => {
      console.log(response)
      expect(response.status).toEqual(200)
      expect(response.data).toStrictEqual(MOCK1)
    })
  })
})

// 业务处理失败

// 接口异常
