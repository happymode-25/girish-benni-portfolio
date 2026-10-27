#!/usr/bin/env node
/**
 * Zero-dependency static preview server.
 *
 *   node tools/dev-server.mjs            → http://localhost:5173
 *   node tools/dev-server.mjs --port 8080
 *   node tools/dev-server.mjs --dir dist --port 5174
 *
 * This is only for local preview. The published site is plain files.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const args = process.argv.slice(2);
const portArg = args.indexOf('--port');
const PORT = Number(portArg !== -1 ? args[portArg + 1] : process.env.PORT || 5173);
const dirArg = args.indexOf('--dir');
const SERVE_ROOT = dirArg !== -1 ? path.resolve(ROOT, args[dirArg + 1] || '.') : ROOT;

if (SERVE_ROOT !== ROOT && !SERVE_ROOT.startsWith(ROOT + path.sep)) {
  console.error('--dir must point to a directory inside this project.');
  process.exit(1);
}

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
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff2': 'font/woff2',
};

const BLOCKED = [/storage\.config\.json$/i, /\.storage-token\.json$/i, /^\.env/i];

const server = http.createServer((req, res) => {
  let pathname;
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    pathname = decodeURIComponent(url.pathname);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Bad request');
    return;
  }
  if (pathname.endsWith('/')) pathname += 'index.html';

  const filePath = path.resolve(SERVE_ROOT, '.' + pathname);

  // Never step outside the served directory or serve local secrets.
  if (
    (filePath !== SERVE_ROOT && !filePath.startsWith(SERVE_ROOT + path.sep)) ||
    BLOCKED.some((rx) => rx.test(path.basename(filePath)))
  ) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      const notFound = path.join(SERVE_ROOT, '404.html');
      fs.readFile(notFound, (readErr, data) => {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(readErr ? 'Not found' : data);
      });
      return;
    }

    res.writeHead(200, {
      'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  Portfolio preview\n  http://localhost:${PORT}\n`);
  console.log(`  Serving: ${path.relative(ROOT, SERVE_ROOT) || '.'}`);
  console.log(`  Dev checklist: http://localhost:${PORT}/?dev=1`);
  console.log('  Stop with Ctrl+C\n');
});
