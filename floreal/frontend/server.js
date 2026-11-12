/**
 * Floreal Frontend UI Dev Server
 * Lightweight zero-dependency static server running on port 3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  // Parse URL — extract pathname only (ignore query string)
  const parsedUrl = url.parse(req.url);
  let pathname = decodeURIComponent(parsedUrl.pathname || '/');

  // Default to index.html
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }

  // Build file path using forward slashes then resolve
  let filePath = path.join(ROOT_DIR, pathname);

  // Clean URL support: if /collections requested (no extension), try /collections.html
  const ext = path.extname(filePath);
  if (!ext) {
    const htmlPath = filePath + '.html';
    if (fs.existsSync(htmlPath)) {
      filePath = htmlPath;
    }
  }

  // Security check: ensure path is within ROOT_DIR
  const resolvedPath = path.resolve(filePath);
  const resolvedRoot = path.resolve(ROOT_DIR);
  if (!resolvedPath.startsWith(resolvedRoot)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('403 Forbidden');
  }

  fs.stat(resolvedPath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(`
        <div style="font-family: sans-serif; text-align: center; padding: 60px;">
          <h2>404 - Page Not Found</h2>
          <p><a href="/">Go to Home</a></p>
        </div>
      `);
    }

    const fileExt = path.extname(resolvedPath).toLowerCase();
    const contentType = MIME_TYPES[fileExt] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(resolvedPath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n=================================================`);
  console.log(`🌸 Floreal Frontend UI Client`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`📡 Backend API Target: http://localhost:5000`);
  console.log(`=================================================\n`);
});
