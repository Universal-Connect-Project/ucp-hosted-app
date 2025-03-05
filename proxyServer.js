const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();

// Forward requests to internal services
app.use('/institution-service', createProxyMiddleware({ target: 'http://localhost:8088', changeOrigin: true }));
app.use('/authentication-service', createProxyMiddleware({ target: 'http://localhost:8089', changeOrigin: true }));
app.use('/performance-service', createProxyMiddleware({ target: 'http://localhost:8090', changeOrigin: true }));

app.use('/', express.static('apps/ucp-ui/dist'));

// Handle SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'apps/ucp-ui/dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
