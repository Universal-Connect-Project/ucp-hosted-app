const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();

const baseProps = {
  changeOrigin: true,
  logger: console,
}

// Forward requests to internal services
app.use('/institution-service', createProxyMiddleware({ target: 'http://localhost:8088', ...baseProps }));
app.use('/authentication-service', createProxyMiddleware({ target: 'http://localhost:8089', ...baseProps }));
app.use('/performance-service', createProxyMiddleware({ target: 'http://localhost:8090', ...baseProps }));

app.use('/', express.static('apps/ucp-ui/dist'));

// Handle SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'apps/ucp-ui/dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
