const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// const target = process.env.INSTITUTION_SERVICE_URL || 'http://localhost:8088'; // Use env var for target

// app.use('/institution-service', createProxyMiddleware({ 
//     target: target, 
//     changeOrigin: true,
//     pathRewrite: {
//       '^/institution-service': '' // Remove the /institution-service prefix when forwarding
//     }
// }));

// Forward requests to internal services
app.use('/institution-service', createProxyMiddleware({ target: 'http://localhost:8088', changeOrigin: true }));
app.use('/authentication-service', createProxyMiddleware({ target: 'http://localhost:8089', changeOrigin: true }));
// app.use('/api2', createProxyMiddleware({ target: 'http://localhost:4002', changeOrigin: true }));

// Serve frontend
app.use('/', express.static('apps/ucp-ui/dist'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
