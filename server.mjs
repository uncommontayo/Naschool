import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDirectory = path.dirname(fileURLToPath(import.meta.url));
const publicDirectory = path.join(rootDirectory, 'public');
const publicFiles = new Set(['index.html', 'privacy.html', 'styles.css', 'app.js', 'form-validation.js', 'supabase-signup.js', 'favicon.svg', 'og-image.svg']);
// The early-access game lives in public/play. Only these file types are served from it.
const playExtensions = new Set(['.html', '.css', '.js', '.woff2', '.txt']);
const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.woff2', 'font/woff2'],
  ['.txt', 'text/plain; charset=utf-8'],
]);

async function loadLocalEnvironment() {
  for (const filename of ['.env', '.env.local']) {
    let contents;
    try {
      contents = await readFile(path.join(rootDirectory, filename), 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') continue;
      throw error;
    }
    for (const line of contents.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][\w]*)\s*=\s*(.*?)\s*$/);
      if (!match || match[1].startsWith('#') || process.env[match[1]] !== undefined) continue;
      let value = match[2];
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
      process.env[match[1]] = value;
    }
  }
}

function sendJson(response, status, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(body),
  });
  response.end(body);
}

function safeStaticPath(requestUrl, directory) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(requestUrl, 'http://localhost').pathname);
  } catch {
    return null;
  }
  if (pathname === '/') pathname = '/index.html';
  if (pathname === '/play' || pathname === '/play/') pathname = '/play/index.html';
  const resolvedDirectory = path.resolve(directory);
  const filePath = path.resolve(resolvedDirectory, `.${pathname}`);
  const relativePath = path.relative(resolvedDirectory, filePath);
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) return null;
  if (publicFiles.has(relativePath)) return filePath;
  const parts = relativePath.split(path.sep);
  const inPlay = parts[0] === 'play' && (parts.length === 2 || (parts.length === 3 && parts[1] === 'fonts'));
  if (inPlay && playExtensions.has(path.extname(relativePath).toLowerCase()) && !parts.some((part) => part.startsWith('.'))) return filePath;
  return null;
}

async function serveStatic(request, response, directory) {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end('Method not allowed');
    return;
  }
  const filePath = safeStaticPath(request.url ?? '/', directory);
  if (!filePath) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }
  try {
    const info = await stat(filePath);
    if (!info.isFile()) throw new Error('Not a file');
    const body = await readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      'Content-Type': contentTypes.get(extension) ?? 'application/octet-stream',
      'Content-Length': body.byteLength,
      'Cache-Control': extension === '.html' ? 'no-cache' : 'public, max-age=3600',
    });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
}

export function createRequestHandler({ staticDirectory = publicDirectory, config = {} } = {}) {
  return async (request, response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    response.setHeader('Content-Security-Policy', "default-src 'self'; connect-src 'self' https://*.supabase.co; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'");

    const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
    if (pathname === '/api/config') {
      if (!['GET', 'HEAD'].includes(request.method)) {
        response.setHeader('Allow', 'GET, HEAD');
        sendJson(response, 405, { message: 'Method not allowed.' });
        return;
      }
      sendJson(response, 200, {
        url: config.url ?? null,
        publishableKey: config.publishableKey ?? null,
        development: config.development ?? true,
      });
      return;
    }
    await serveStatic(request, response, staticDirectory);
  };
}

export function createApp(options = {}) {
  return createServer(createRequestHandler(options));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await loadLocalEnvironment();
  const app = createApp({
    config: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      development: process.env.NODE_ENV !== 'production',
    },
  });
  const port = Number(process.env.PORT || 4173);
  app.listen(port, '0.0.0.0', () => {
    console.log(`Na School! is serving on http://localhost:${port}`);
    if (!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) console.warn('Signup is not connected: set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local.');
  });
}
