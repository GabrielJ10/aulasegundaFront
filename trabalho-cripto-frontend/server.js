const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5500;
const INDEX_PATH = path.join(__dirname, 'index.html');

require('dotenv').config();

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

const server = http.createServer((req, res) => {
  const requestPath = req.url.split('?')[0];

  if (requestPath !== '/' && requestPath !== '/index.html') {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Nao encontrado');
    return;
  }

  fs.readFile(INDEX_PATH, (error, content) => {
      let html = content.toString();
      html = html.replace('__BACKEND_URL__', BACKEND_URL);
    
    if (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  });
});

server.listen(PORT, () => {
  console.log(`Frontend rodando na porta ${PORT}`);
});
