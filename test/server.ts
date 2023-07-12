
import http from 'http'

const processPost = (request: any, response: any, callback: any) => {
  let queryData = ''
  if (typeof callback !== 'function') return null

  request.on('data', function(data: any) {
    queryData += data
  })

  request.on('end', function() {
    request.post = JSON.parse(queryData)
    callback()
  })
}

const sendResponse = (res: any, statusCode: any, body: any) => {
  res.writeHead(statusCode)
  res.write(body)
  res.end()
}

const send200 = (res: any, body?: any) => {
  sendResponse(res, 200, body || '<h1>OK</h1>')
}

export default (port: number, mockData = {}) => {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const url = req.url as string
      if (url === '/ok') {
        send200(res)
        return
      }

      if (url.startsWith('/echo')) {
        const echo = url.slice(8)
        sendResponse(res, 200, JSON.stringify({ echo }))
        return
      }

      if (url.startsWith('/number')) {
        console.log('/number')
        const n = url.slice(8, 11)
        sendResponse(res, n, JSON.stringify(mockData))
        return
      }

      if (url.startsWith('/sleep')) {
        const wait = Number(url.split('/').pop())
        setTimeout(() => {
          send200(res)
        }, wait)
        return
      }

      if (url === '/post') {
        processPost(req, res, function() {
          sendResponse(res, 200, JSON.stringify({ got: (req as any).post }))
        })
      }
    })
    server.listen(port, '::', () => resolve(server))
  })
}
