const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5500;
const INDEX_PATH = path.join(__dirname, 'index.html');

const server = http.createServer((req, res) => {
  const requestPath = req.url.split('?')[0];

  if (requestPath !== '/' && requestPath !== '/index.html') {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Nao encontrado');
    return;
  }

  fs.readFile(INDEX_PATH, (error, content) => {
    if (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Erro ao carregar index.html');
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`Frontend rodando na porta ${PORT}`);
});
