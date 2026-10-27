#!/usr/bin/env node
/**
 * Portfolio Storage Studio — a local-only uploader for Google Drive or OneDrive.
 *
 *   npm run studio        → http://127.0.0.1:8787/studio.html
 *
 * Why a local server?
 *   Uploading to Drive or OneDrive needs OAuth. Doing that in the browser would
 *   mean shipping a client secret in public JavaScript. This tool keeps the
 *   secret and the refresh token on your machine, bound to 127.0.0.1.
 *
 * Requirements:
 *   • Node 20+ (built-in fetch)
 *   • storage.config.json with OAuth credentials — see storage.config.example.json
 *   • Google: OAuth client of type "TVs and Limited Input devices"
 *   • Microsoft: a public/native app registration with device code flow enabled
 *
 * The portfolio itself never talks to this server. It only uses the URLs this
 * tool gives you (or `drive:<id>` values, which script.js expands).
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HOST = '127.0.0.1';
const MAX_UPLOAD = 100 * 1024 * 1024; // 100 MB
const MAX_JSON = 1024 * 1024;

const args = process.argv.slice(2);
const configArg = args.indexOf('--config');
const CONFIG_PATH = path.resolve(
  configArg !== -1 ? args[configArg + 1] : path.join(ROOT, 'storage.config.json')
);
const TOKEN_PATH = path.join(path.dirname(CONFIG_PATH), '.storage-token.json');

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
  '.md': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff2': 'font/woff2',
};

const BLOCKED_FILES = [/storage\.config\.json$/i, /\.storage-token\.json$/i, /^\.env/i, /^author-data\.js$/i];

const SECRET_KEYS = new Set(['clientSecret', 'client_secret', 'refresh_token', 'access_token']);

/* ----- Config & tokens ---------------------------------------------------- */
function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    return {
      provider: 'google',
      port: 8787,
      google: { clientId: process.env.GOOGLE_CLIENT_ID || '', clientSecret: process.env.GOOGLE_CLIENT_SECRET || '', folderId: '' },
      onedrive: { clientId: process.env.ONEDRIVE_CLIENT_ID || '', tenant: process.env.ONEDRIVE_TENANT || 'common', folder: 'portfolio' },
      missing: true,
    };
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    parsed.google = parsed.google || {};
    parsed.onedrive = parsed.onedrive || {};
    parsed.google.clientId = process.env.GOOGLE_CLIENT_ID || parsed.google.clientId || '';
    parsed.google.clientSecret = process.env.GOOGLE_CLIENT_SECRET || parsed.google.clientSecret || '';
    parsed.onedrive.clientId = process.env.ONEDRIVE_CLIENT_ID || parsed.onedrive.clientId || '';
    parsed.port = Number(process.env.PORT || parsed.port || 8787);
    parsed.provider = parsed.provider || 'google';
    return parsed;
  } catch (err) {
    console.error(`\n  Could not read ${path.basename(CONFIG_PATH)}: ${err.message}\n`);
    process.exit(1);
  }
}

const config = loadConfig();

function loadTokens() {
  try {
    return JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function saveTokens(tokens) {
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2), { mode: 0o600 });
}

let tokens = loadTokens();

/* ----- Small helpers ------------------------------------------------------ */
const now = () => Date.now();

function assert(condition, message) {
  if (!condition) {
    const error = new Error(message);
    error.status = 400;
    throw error;
  }
}

async function request(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!response.ok) {
    const message =
      data?.error_description ||
      data?.error?.message ||
      (typeof data?.error === 'string' ? data.error : '') ||
      `${response.status} ${response.statusText}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return data;
}

function formBody(params) {
  return new URLSearchParams(params).toString();
}

function base64url(value) {
  return Buffer.from(value, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function cleanFilename(name) {
  const base = path.basename(String(name || 'upload'));
  const safe = base
    .normalize('NFKD')
    .replace(/[^\w.\- ]+/g, '_')
    .replace(/\s+/g, '-')
    .replace(/_{2,}/g, '_')
    .slice(-90);
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '').replace(/-/g, '');
  return `${stamp}-${safe || 'upload'}`;
}

/* ----- Google Drive ------------------------------------------------------- */
const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/drive.file openid email';

function googleConfigured() {
  return Boolean(config.google && config.google.clientId && config.google.clientSecret);
}

async function googleAuthStart() {
  assert(googleConfigured(), 'Google Drive is not configured. Add clientId and clientSecret to storage.config.json.');
  const data = await request('https://oauth2.googleapis.com/device/code', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: formBody({ client_id: config.google.clientId, scope: GOOGLE_SCOPE }),
  });
  return {
    provider: 'google',
    deviceCode: data.device_code,
    userCode: data.user_code,
    verificationUrl: data.verification_url || 'https://www.google.com/device',
    interval: data.interval || 5,
    expiresIn: data.expires_in || 1800,
  };
}

async function googleAuthPoll(deviceCode) {
  try {
    const data = await request('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: formBody({
        client_id: config.google.clientId,
        client_secret: config.google.clientSecret,
        device_code: deviceCode,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      }),
    });

    let account = '';
    try {
      const info = await request('https://openidconnect.googleapis.com/v1/userinfo', {
        headers: { authorization: `Bearer ${data.access_token}` },
      });
      account = info.email || '';
    } catch {
      account = '';
    }

    tokens.google = {
      refresh_token: data.refresh_token || tokens.google?.refresh_token || '',
      access_token: data.access_token,
      expires_at: now() + (data.expires_in || 3600) * 1000,
      account,
      connected_at: new Date().toISOString(),
    };
    saveTokens(tokens);
    return { status: 'complete', account };
  } catch (err) {
    const message = String(err.message || '');
    if (/authorization_pending/i.test(message)) return { status: 'pending' };
    if (/slow_down/i.test(message)) return { status: 'slow_down' };
    if (/expired_token|invalid_grant/i.test(message)) {
      const error = new Error('The sign-in code expired. Start again.');
      error.status = 400;
      throw error;
    }
    throw err;
  }
}

async function googleAccessToken() {
  assert(googleConfigured(), 'Google Drive is not configured.');
  const stored = tokens.google;
  assert(stored && stored.refresh_token, 'Google Drive is not connected yet.');
  if (stored.access_token && stored.expires_at && stored.expires_at > now() + 60_000) {
    return stored.access_token;
  }
  const data = await request('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: formBody({
      client_id: config.google.clientId,
      client_secret: config.google.clientSecret,
      refresh_token: stored.refresh_token,
      grant_type: 'refresh_token',
    }),
  });
  stored.access_token = data.access_token;
  stored.expires_at = now() + (data.expires_in || 3600) * 1000;
  if (data.refresh_token) stored.refresh_token = data.refresh_token;
  tokens.google = stored;
  saveTokens(tokens);
  return data.access_token;
}

async function googleUpload(buffer, filename, mime) {
  const access = await googleAccessToken();
  const metadata = { name: filename };
  if (config.google.folderId) metadata.parents = [config.google.folderId];

  const boundary = 'portfolio' + crypto.randomBytes(12).toString('hex');
  const head = Buffer.from(
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
      JSON.stringify(metadata) +
      `\r\n--${boundary}\r\nContent-Type: ${mime}\r\n\r\n`
  );
  const tail = Buffer.from(`\r\n--${boundary}--`);
  const body = Buffer.concat([head, buffer, tail]);

  const file = await request(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&fields=id,name,mimeType,size,webViewLink,webContentLink',
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${access}`,
        'content-type': `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );

  let isPublic = false;
  try {
    await request(`https://www.googleapis.com/drive/v3/files/${file.id}/permissions?supportsAllDrives=true`, {
      method: 'POST',
      headers: { authorization: `Bearer ${access}`, 'content-type': 'application/json' },
      body: JSON.stringify({ role: 'reader', type: 'anyone' }),
    });
    isPublic = true;
  } catch (err) {
    console.warn('[storage] Could not make the Drive file public:', err.message);
  }

  return {
    id: file.id,
    name: file.name,
    size: Number(file.size || buffer.length),
    mime: file.mimeType || mime,
    public: isPublic,
    webUrl: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
    directUrl: `https://lh3.googleusercontent.com/d/${file.id}=w2400`,
    downloadUrl: `https://drive.google.com/uc?export=download&id=${file.id}`,
    configValue: `drive:${file.id}`,
  };
}

async function googleList() {
  const access = await googleAccessToken();
  const fields = 'files(id,name,mimeType,size,createdTime,webViewLink,thumbnailLink)';
  const data = await request(
    `https://www.googleapis.com/drive/v3/files?pageSize=30&orderBy=createdTime%20desc&q=trashed%3Dfalse&fields=${encodeURIComponent(fields)}`,
    { headers: { authorization: `Bearer ${access}` } }
  );
  return (data.files || []).map((file) => ({
    id: file.id,
    name: file.name,
    mime: file.mimeType,
    size: Number(file.size || 0),
    created: file.createdTime,
    thumbnail: file.thumbnailLink || '',
    webUrl: file.webViewLink || '',
    directUrl: file.mimeType?.startsWith('image/') ? `https://lh3.googleusercontent.com/d/${file.id}=w1200` : '',
    downloadUrl: `https://drive.google.com/uc?export=download&id=${file.id}`,
  }));
}

async function googleDelete(id) {
  const access = await googleAccessToken();
  await request(`https://www.googleapis.com/drive/v3/files/${id}?supportsAllDrives=true`, {
    method: 'DELETE',
    headers: { authorization: `Bearer ${access}` },
  });
}

/* ----- OneDrive ----------------------------------------------------------- */
const ONEDRIVE_SCOPE = 'Files.ReadWrite offline_access';

function onedriveConfigured() {
  return Boolean(config.onedrive && config.onedrive.clientId);
}

function tenant() {
  return encodeURIComponent(config.onedrive.tenant || 'common');
}

async function onedriveAuthStart() {
  assert(onedriveConfigured(), 'OneDrive is not configured. Add clientId to storage.config.json.');
  const data = await request(`https://login.microsoftonline.com/${tenant()}/oauth2/v2.0/devicecode`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: formBody({ client_id: config.onedrive.clientId, scope: ONEDRIVE_SCOPE }),
  });
  return {
    provider: 'onedrive',
    deviceCode: data.device_code,
    userCode: data.user_code,
    verificationUrl: data.verification_uri,
    message: data.message,
    interval: data.interval || 5,
    expiresIn: data.expires_in || 900,
  };
}

async function onedriveAuthPoll(deviceCode) {
  try {
    const data = await request(`https://login.microsoftonline.com/${tenant()}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: formBody({
        client_id: config.onedrive.clientId,
        device_code: deviceCode,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      }),
    });

    let account = '';
    try {
      const me = await request('https://graph.microsoft.com/v1.0/me?$select=displayName,userPrincipalName', {
        headers: { authorization: `Bearer ${data.access_token}` },
      });
      account = me.userPrincipalName || me.displayName || '';
    } catch {
      account = '';
    }

    tokens.onedrive = {
      refresh_token: data.refresh_token || tokens.onedrive?.refresh_token || '',
      access_token: data.access_token,
      expires_at: now() + (data.expires_in || 3600) * 1000,
      account,
      connected_at: new Date().toISOString(),
    };
    saveTokens(tokens);
    return { status: 'complete', account };
  } catch (err) {
    const message = String(err.message || '');
    if (/authorization_pending/i.test(message)) return { status: 'pending' };
    if (/slow_down/i.test(message)) return { status: 'slow_down' };
    if (/expired_token|invalid_grant|code_expired/i.test(message)) {
      const error = new Error('The sign-in code expired. Start again.');
      error.status = 400;
      throw error;
    }
    throw err;
  }
}

async function onedriveAccessToken() {
  assert(onedriveConfigured(), 'OneDrive is not configured.');
  const stored = tokens.onedrive;
  assert(stored && stored.refresh_token, 'OneDrive is not connected yet.');
  if (stored.access_token && stored.expires_at && stored.expires_at > now() + 60_000) {
    return stored.access_token;
  }
  const data = await request(`https://login.microsoftonline.com/${tenant()}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: formBody({
      client_id: config.onedrive.clientId,
      refresh_token: stored.refresh_token,
      grant_type: 'refresh_token',
      scope: ONEDRIVE_SCOPE,
    }),
  });
  stored.access_token = data.access_token;
  stored.expires_at = now() + (data.expires_in || 3600) * 1000;
  if (data.refresh_token) stored.refresh_token = data.refresh_token;
  tokens.onedrive = stored;
  saveTokens(tokens);
  return data.access_token;
}

function onedriveFolderPath(filename) {
  const folder = String(config.onedrive.folder || '').replace(/^\/+|\/+$/g, '');
  const encoded = filename.split('/').map(encodeURIComponent).join('/');
  return folder ? `${folder}/${encoded}` : encoded;
}

async function ensureOnedriveFolder(access) {
  const folder = String(config.onedrive.folder || '').replace(/^\/+|\/+$/g, '');
  if (!folder) return;
  const parts = folder.split('/').filter(Boolean);
  let parent = '/me/drive/special/approot';
  for (const part of parts) {
    const target = `${parent}:/${encodeURIComponent(part)}`;
    try {
      await request(`https://graph.microsoft.com/v1.0/me/drive/special/approot/children`, {
        method: 'POST',
        headers: { authorization: `Bearer ${access}`, 'content-type': 'application/json' },
        body: JSON.stringify({ name: part, folder: {}, '@microsoft.graph.conflictBehavior': 'fail' }),
      });
    } catch (err) {
      if (!/already exists|nameAlreadyExists|409/i.test(err.message)) {
        // The folder may exist but not be addressable; continue and let upload decide.
      }
    }
    parent = target;
  }
}

async function onedriveUpload(buffer, filename, mime) {
  const access = await onedriveAccessToken();
  await ensureOnedriveFolder(access);

  const filePath = onedriveFolderPath(filename);
  const uploadUrl = `https://graph.microsoft.com/v1.0/me/drive/special/approot:/${filePath}:/content`;
  let file;

  if (buffer.length <= 4 * 1024 * 1024) {
    file = await request(uploadUrl, {
      method: 'PUT',
      headers: { authorization: `Bearer ${access}`, 'content-type': mime },
      body: buffer,
    });
  } else {
    const session = await request(
      `https://graph.microsoft.com/v1.0/me/drive/special/approot:/${filePath}:/createUploadSession`,
      {
        method: 'POST',
        headers: { authorization: `Bearer ${access}`, 'content-type': 'application/json' },
        body: JSON.stringify({ item: { '@microsoft.graph.conflictBehavior': 'rename' } }),
      }
    );

    const chunkSize = 10 * 1024 * 1024;
    const total = buffer.length;
    let start = 0;
    let last = null;

    while (start < total) {
      const end = Math.min(start + chunkSize, total);
      const chunk = buffer.subarray(start, end);
      last = await request(session.uploadUrl, {
        method: 'PUT',
        headers: {
          'content-length': String(chunk.length),
          'content-range': `bytes ${start}-${end - 1}/${total}`,
        },
        body: chunk,
      });
      start = end;
    }
    file = last;
  }

  assert(file && file.id, 'OneDrive did not return a file id.');

  let webUrl = file.webUrl || '';
  let isPublic = false;
  try {
    const link = await request(`https://graph.microsoft.com/v1.0/me/drive/items/${file.id}/createLink`, {
      method: 'POST',
      headers: { authorization: `Bearer ${access}`, 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'view', scope: 'anonymous' }),
    });
    webUrl = link.link?.webUrl || webUrl;
    isPublic = true;
  } catch (err) {
    console.warn('[storage] Could not create an anonymous OneDrive link:', err.message);
  }

  return {
    id: file.id,
    name: file.name || filename,
    size: Number(file.size || buffer.length),
    mime: file.file?.mimeType || mime,
    public: isPublic,
    webUrl,
    directUrl: webUrl ? `https://api.onedrive.com/v1.0/shares/u!${base64url(webUrl)}/root/content` : '',
    downloadUrl: webUrl ? `${webUrl}${webUrl.includes('?') ? '&' : '?'}download=1` : '',
    configValue: webUrl || file.id,
  };
}

async function onedriveList() {
  const access = await onedriveAccessToken();
  const folder = String(config.onedrive.folder || '').replace(/^\/+|\/+$/g, '');
  const url = folder
    ? `https://graph.microsoft.com/v1.0/me/drive/special/approot:/${encodeURIComponent(folder)}:/children?$top=30&$orderby=lastModifiedDateTime%20desc`
    : 'https://graph.microsoft.com/v1.0/me/drive/special/approot/children?$top=30&$orderby=lastModifiedDateTime%20desc';

  const data = await request(url, { headers: { authorization: `Bearer ${access}` } });
  return (data.value || [])
    .filter((item) => item.file)
    .map((item) => ({
      id: item.id,
      name: item.name,
      mime: item.file?.mimeType || '',
      size: Number(item.size || 0),
      created: item.lastModifiedDateTime,
      thumbnail: '',
      webUrl: item.webUrl || '',
      directUrl: '',
      downloadUrl: item['@microsoft.graph.downloadUrl'] || '',
    }));
}

async function onedriveDelete(id) {
  const access = await onedriveAccessToken();
  await request(`https://graph.microsoft.com/v1.0/me/drive/items/${id}`, {
    method: 'DELETE',
    headers: { authorization: `Bearer ${access}` },
  });
}

/* ----- Provider dispatch -------------------------------------------------- */
const providers = {
  google: {
    key: 'google',
    label: 'Google Drive',
    configured: googleConfigured,
    authStart: googleAuthStart,
    authPoll: googleAuthPoll,
    upload: googleUpload,
    list: googleList,
    remove: googleDelete,
  },
  onedrive: {
    key: 'onedrive',
    label: 'OneDrive',
    configured: onedriveConfigured,
    authStart: onedriveAuthStart,
    authPoll: onedriveAuthPoll,
    upload: onedriveUpload,
    list: onedriveList,
    remove: onedriveDelete,
  },
};

function pickProvider(requested) {
  const key = requested || config.provider || 'google';
  const provider = providers[key];
  assert(provider, `Unknown provider "${key}". Use google or onedrive.`);
  assert(provider.configured(), `${provider.label} credentials are missing.`);
  return provider;
}

/* ----- Multipart parser --------------------------------------------------- */
function parseMultipart(buffer, contentType) {
  const match = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType || '');
  if (!match) throw new Error('Missing multipart boundary');
  const boundary = Buffer.from(`--${match[1] || match[2]}`);

  const parts = [];
  let position = buffer.indexOf(boundary);

  while (position !== -1) {
    const after = position + boundary.length;
    if (buffer[after] === 45 && buffer[after + 1] === 45) break; // closing --
    const next = buffer.indexOf(boundary, after);
    if (next === -1) break;

    let part = buffer.subarray(after, next);
    if (part[0] === 13 && part[1] === 10) part = part.subarray(2);
    if (part.length >= 2 && part[part.length - 2] === 13 && part[part.length - 1] === 10) {
      part = part.subarray(0, part.length - 2);
    }

    const headerEnd = part.indexOf('\r\n\r\n');
    if (headerEnd !== -1) {
      const rawHeaders = part.subarray(0, headerEnd).toString('utf8');
      const content = part.subarray(headerEnd + 4);
      const nameMatch = /name="([^"]+)"/i.exec(rawHeaders);
      const fileMatch = /filename="([^"]*)"/i.exec(rawHeaders);
      const typeMatch = /content-type:\s*([^\r\n]+)/i.exec(rawHeaders);

      if (nameMatch) {
        parts.push({
          name: nameMatch[1],
          filename: fileMatch ? fileMatch[1] : null,
          type: typeMatch ? typeMatch[1].trim() : '',
          data: content,
        });
      }
    }
    position = next;
  }
  return parts;
}

/* ----- HTTP helpers ------------------------------------------------------- */
function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(Object.assign(new Error('Upload too large.'), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function json(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
  });
  res.end(body);
}

const ALLOWED_ORIGINS = new Set([`http://${HOST}:${config.port}`, `http://localhost:${config.port}`]);

// Binding to 127.0.0.1 is not enough on its own: a DNS name can resolve to
// loopback. Requiring the Host header to be the loopback origin blocks the
// rebinding trick without affecting normal local use.
function hostAllowed(req) {
  const host = String(req.headers.host || '').toLowerCase();
  return host === `${HOST}:${config.port}` || host === `localhost:${config.port}`;
}

function guard(req, res) {
  if (req.method === 'GET' || req.method === 'HEAD') return true;

  const origin = req.headers.origin;
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    json(res, 403, { error: 'Origin not allowed.' });
    return false;
  }
  // Forces a CORS preflight for cross-site requests, which this server never approves.
  if (req.headers['x-studio'] !== '1') {
    json(res, 403, { error: 'Missing X-Studio header.' });
    return false;
  }
  return true;
}

function filesResponse(provider, upload) {
  return {
    ok: true,
    provider,
    ...upload,
    markdown: upload.directUrl ? `![${upload.name}](${upload.directUrl})` : '',
    html: upload.directUrl ? `<img src="${upload.directUrl}" alt="${upload.name}" loading="lazy">` : '',
  };
}

/* ----- Static files ------------------------------------------------------- */
function serveStatic(req, res, pathname) {
  if (pathname === '/') {
    res.writeHead(302, { location: '/studio.html' });
    res.end();
    return;
  }

  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    res.writeHead(400, { 'content-type': 'text/plain' });
    res.end('Bad request');
    return;
  }

  const filePath = path.resolve(ROOT, '.' + decoded);
  const insideRoot = filePath === ROOT || filePath.startsWith(ROOT + path.sep);
  if (!insideRoot || BLOCKED_FILES.some((rx) => rx.test(path.basename(filePath)))) {
    res.writeHead(403, { 'content-type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'content-type': 'text/plain' });
      res.end('Not found');
      return;
    }
    res.writeHead(200, {
      'content-type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'DENY',
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

/* ----- Routes ------------------------------------------------------------- */
const server = http.createServer(async (req, res) => {
  if (!hostAllowed(req)) {
    res.writeHead(403, { 'content-type': 'text/plain' });
    res.end('Forbidden host');
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || HOST}`);
  const pathname = url.pathname;

  if (!pathname.startsWith('/api/')) {
    serveStatic(req, res, pathname);
    return;
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(405);
    res.end();
    return;
  }

  if (!guard(req, res)) return;

  try {
    if (req.method === 'GET' && pathname === '/api/health') {
      const list = Object.entries(providers).map(([key, provider]) => ({
        key,
        label: provider.label,
        configured: provider.configured(),
        connected: Boolean(tokens[key] && tokens[key].refresh_token),
        account: tokens[key]?.account || '',
      }));
      json(res, 200, {
        ok: true,
        configFound: !config.missing,
        configPath: path.basename(CONFIG_PATH),
        selected: config.provider || 'google',
        providers: list,
        maxUploadMb: Math.round(MAX_UPLOAD / 1024 / 1024),
      });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/auth/start') {
      const body = await readBody(req, MAX_JSON);
      const payload = body.length ? JSON.parse(body.toString('utf8')) : {};
      const provider = pickProvider(payload.provider);
      const data = await provider.authStart();
      json(res, 200, { ok: true, ...data });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/auth/poll') {
      const body = await readBody(req, MAX_JSON);
      const payload = JSON.parse(body.toString('utf8'));
      const provider = pickProvider(payload.provider);
      assert(payload.deviceCode, 'Missing deviceCode.');
      const data = await provider.authPoll(payload.deviceCode);
      json(res, 200, { ok: true, provider: payload.provider, ...data });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/auth/signout') {
      const body = await readBody(req, MAX_JSON);
      const payload = body.length ? JSON.parse(body.toString('utf8')) : {};
      const key = payload.provider;
      assert(providers[key], 'Unknown provider.');
      delete tokens[key];
      saveTokens(tokens);
      json(res, 200, { ok: true });
      return;
    }

    if (req.method === 'GET' && pathname === '/api/files') {
      const provider = pickProvider(url.searchParams.get('provider'));
      const files = await provider.list();
      json(res, 200, { ok: true, files });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/upload') {
      const contentType = req.headers['content-type'] || '';
      assert(contentType.includes('multipart/form-data'), 'Expected multipart/form-data.');
      const body = await readBody(req, MAX_UPLOAD + 1024 * 1024);
      const parts = parseMultipart(body, contentType);
      const filePart = parts.find((part) => part.filename);
      assert(filePart, 'No file part found.');
      assert(filePart.data.length > 0, 'The file is empty.');
      assert(filePart.data.length <= MAX_UPLOAD, 'File is larger than 100 MB.');

      const requested =
        parts.find((part) => part.name === 'provider')?.data.toString('utf8').trim() ||
        url.searchParams.get('provider');
      const provider = pickProvider(requested);

      const filename = cleanFilename(filePart.filename);
      const mime = filePart.type || 'application/octet-stream';
      const upload = await provider.upload(filePart.data, filename, mime);
      json(res, 200, filesResponse(provider.key || requested, upload));
      return;
    }

    if (req.method === 'DELETE' && pathname.startsWith('/api/files/')) {
      const id = decodeURIComponent(pathname.slice('/api/files/'.length));
      const provider = pickProvider(url.searchParams.get('provider'));
      await provider.remove(id);
      json(res, 200, { ok: true });
      return;
    }

    json(res, 404, { error: 'Unknown endpoint.' });
  } catch (err) {
    const status = err.status || 500;
    if (status >= 500) console.error('[storage]', err);
    json(res, status, { error: err.message || 'Storage request failed.' });
  }
});

server.listen(config.port, HOST, () => {
  const configured = Object.entries(providers)
    .filter(([, provider]) => provider.configured())
    .map(([, provider]) => provider.label);

  console.log('\n  Portfolio Storage Studio');
  console.log(`  http://${HOST}:${config.port}/studio.html\n`);
  if (config.missing) {
    console.log('  No storage.config.json found. Copy storage.config.example.json first.');
  } else {
    console.log(`  Configured: ${configured.length ? configured.join(', ') : 'none yet'}`);
    console.log(`  Default provider: ${config.provider}`);
  }
  console.log('  Local only. Tokens stay in .storage-token.json (gitignored).');
  console.log('  Stop with Ctrl+C\n');
});
