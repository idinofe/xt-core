import { getFreePort } from './port'
import Koa from 'koa'

export function createApp (port = getFreePort(), data: any) {
  // const Koa = require('koa')
  const app = new Koa()

  app.use(async ctx => {
    console.log(ctx.URL)
    ctx.body = data ? JSON.stringify(data) : 'Hello World'
  })

  return app
}
