const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api-hbccb',
    createProxyMiddleware({
      target: 'https://yfzx.whty.com.cn/dev-c2b/hbccb-interface',
      changeOrigin: true,
      pathRewrite: (path) => path.replace(/^\/api-hbccb/, ''),
      logLevel: 'debug',
    })
  );
};
