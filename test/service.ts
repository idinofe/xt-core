import Koa from 'koa'
import Router from 'koa-router'
import { koaBody } from 'koa-body'
// import fs from 'fs'
import http from 'http'
import path from 'path'
import { decrypt, encrypt } from 'decrypt-core'
import { isDef, isString } from '../src/common'
import { RETURN_CODE_FAIL, RETURN_CODE_SUCCESS } from '../src'

const appKey1 = '3fccc522c79b4bd0848e6a86fec365a7'

export function createApp () {
  const app = new Koa();
  const router = new Router();

  // 返回状态码 200
  router.get('/number/200', (ctx) => {
    ctx.status = 200;
  });

  router.post('/number/200', (ctx) => {
    ctx.status = 200;
    ctx.body = {};
  });

  // 返回状态码 404
  router.get('/number/404', (ctx) => {
    ctx.status = 404;
  });

  router.post('/number/404', (ctx) => {
    ctx.status = 404;
  });

  // 返回状态码 500
  router.get('/number/500', (ctx) => {
    ctx.status = 500;
  });

  // 返回 number 数据
  router.post('/number/success', (ctx) => {
    ctx.status = 200;
    ctx.body = {
      data: 123,
      returnCode: 'SUCCESS',
      returnDes: '',
    };
  });

  // 返回 json 数据
  router.post('/json/success', (ctx) => {
    ctx.status = 200;
    ctx.body = {
      data: {
        foo: 'bar'
      },
      returnCode: 'SUCCESS',
      returnDes: '',
    }
  })

  router.post('/json/fail', (ctx) => {
    ctx.status = 200;
    ctx.body = {
      data: null,
      returnCode: 'FAIL',
      returnDes: '参数校验未通过',
    };
  });

  router.post('/json/fail/ERR001', (ctx) => {
    ctx.status = 200;
    ctx.body = {
      data: null,
      returnCode: 'ERR001',
      returnDes: '业务处理失败',
    };
  });

  router.post('/json/fail/INVALID_TOKEN', (ctx) => {
    ctx.status = 200;
    ctx.body = {
      data: null,
      returnCode: 'INVALID_TOKEN',
      returnDes: '登录信息已失效',
    }
  })

  // 文件上传
  router.post('/file/upload/success', async (ctx) => {
    if (!ctx.request.files) {
      ctx.body = {
        data: 'no path',
        returnCode: 'SUCCESS',
        returnDes: '',
      }
    } else {
      // const file = ctx.request.files.file; // 获取上传的文件
      // const reader = fs.createReadStream(file.filepath);
      const fileExtension = '.txt';
      const _path = `uploads/${Date.now()}${fileExtension}`; // 保存文件的相对路径
      const filePath = path.resolve(__dirname, _path)
      // 不真实写入文件
      // const stream = fs.createWriteStream(filePath);
      // reader.pipe(stream);
      console.log(filePath);
  
      ctx.body = {
        data: filePath,
        returnCode: 'SUCCESS',
        returnDes: '',
      };
    }
  });

  // 加解密v1
  router.post('/encrypt/v1/success/json/', async (ctx) => {
    let dd, data, ed
    try {
      // encryptVersion = 1
      // FIXME: V1 协议 body 是一个字符串，但是包含引号，
      // axios 在 Content-Type = applicaion/json 时
      // 对 dada 进行了 JSON.stringify(string) 导致
      // 是否在服务端去掉引号？还是客户端去掉引号？
      let body = ctx.request.body
      if (isDef(body) && isString(body)) {
        body = body.replaceAll('"', '')
      }
      console.log('start decrypt', body, appKey1)
      dd = decrypt(body, appKey1)
      console.log('decrypted ', dd)
      data = { foo: 'bar' }
      console.log('start encrypt', data, appKey1)
      ed = encrypt(data, appKey1) as any
      console.log('encrypted ', ed)
    } catch (e) {
      console.log(e)
    }

    ctx.set('content-type', 'application/json')

    if (!dd) {
      ctx.set('returnCode', RETURN_CODE_FAIL)
      ctx.set('returnDes', '解密失败')
      return
    }

    if (!dd.id) {
      ctx.set('returnCode', RETURN_CODE_FAIL)
      ctx.set('returnDes', '解密失败')
      return
    }
    ctx.set('returnCode', RETURN_CODE_SUCCESS)
    ctx.set('returnDes', '')
    ctx.body = ed
  })

  // 加解密v2
  router.post('/encrypt/v2/success/json/', async (ctx) => {
    let dd, data, ed
    try {
      // encryptVersion = 2
      console.log('start decrypt', ctx.request.body.body, appKey1)
      dd = decrypt(ctx.request.body.body, appKey1)
      console.log('decrypted ', dd)
      data = { foo: 'bar' }
      console.log('start encrypt', data, appKey1)
      ed = encrypt(data, appKey1) as any
      console.log('encrypted ', ed)
    } catch (e) {
      console.log(e)
    }

    if (!dd) {
      ctx.body = {
        data: null,
        returnCode: 'FAIL',
        returnDes: '解密失败',
      }
      return
    }

    if (!dd.id) {
      ctx.body = {
        data: null,
        returnCode: 'FAIL',
        returnDes: '参数错误',
      }
      return
    }

    ctx.body = {
      body: ed,
      returnCode: 'SUCCESS',
      returnDes: '',
    }
  })

  app.use(koaBody({ multipart: true, onError: (err, ctx) => {
    console.log('onError', err)
    ctx.request.body = (err as any).body // 非 JSON 字符串解析失败，直接使用原始值
  } }))
    .use(router.routes())
    .use(router.allowedMethods())

  return app
}

export function startServer(port: number, app: any) {
  return new Promise((resolve) => {
    const server = http.createServer(app.callback())
    server.listen(port, '::', () => {
      resolve(server)
    })
  })
}
