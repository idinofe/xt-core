import { getFreePort } from './port'
import { createApp, startServer } from './service'

async function run() {
  const port = await getFreePort()
  const app = createApp()
  const server = startServer(port, app)
  console.log(`server listenning at http://127.0.0.1:${port}`)
  return server
}

run()
