/**
 * Servidor estático opcional para desarrollo del frontend de forma aislada.
 * NOTA: no es necesario ejecutarlo normalmente; el backend Express ya sirve
 * el frontend en el mismo origen (http://localhost:4000). Úsalo solo si
 * quieres trabajar en el cliente por separado.
 *
 * Uso:  npm start   →  http://localhost:5500
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PUERTO = process.env.PORT_FRONTEND || 5500;
const RAIZ = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

const server = http.createServer((req, res) => {
  let ruta = decodeURIComponent(new URL(req.url, 'http://local').pathname);
  if (ruta === '/') ruta = '/index.html';

  const archivo = path.normalize(path.join(RAIZ, ruta));
  if (!archivo.startsWith(RAIZ)) {
    res.writeHead(403);
    return res.end('Prohibido');
  }

  fs.readFile(archivo, (err, contenido) => {
    if (err) {
      // SPA fallback
      fs.readFile(path.join(RAIZ, 'index.html'), (e2, html) => {
        if (e2) {
          res.writeHead(404);
          return res.end('No encontrado');
        }
        res.writeHead(200, { 'Content-Type': MIME['.html'] });
        res.end(html);
      });
      return;
    }
    const ext = path.extname(archivo).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(contenido);
  });
});

server.listen(PUERTO, () => {
  console.log(`Frontend estático en http://localhost:${PUERTO}`);
  console.log('Asegúrate de que el backend esté corriendo en http://localhost:4000');
});
