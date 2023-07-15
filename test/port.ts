import net from 'net'

export function getFreePort () {
  return new Promise(resolve => {
    const server = net.createServer()
    server.listen(() => {
      const port = (server.address() as any).port
      server.close(() => resolve(port))
    })
  })
}
