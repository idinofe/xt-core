const Koa = require('koa');
const Router = require('koa-router');
const { koaBody } = require('koa-body');
const fs = require('fs');
const path = require('path');

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
  const file = ctx.request.files.file; // 获取上传的文件
  const reader = fs.createReadStream(file.filepath);
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
});

app.use(koaBody({ multipart: true }))
   .use(router.routes())
   .use(router.allowedMethods())

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
