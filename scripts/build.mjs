#!/usr/bin/env node
/**
 * Build the publishable site into dist/ (or --out).
 *
 *   node scripts/build.mjs --base-url https://example.com
 *   node scripts/build.mjs --base-url https://user.github.io/repo --cname example.com
 *   node scripts/build.mjs --out ../portfolio-build --author
 *
 * What this does:
 *   • copies only public files (never studio.html, tools/, docs/, secrets)
 *   • injects canonical + absolute social-preview URLs into index.html
 *   • writes meta.baseUrl into the copied script.js
 *   • writes CNAME, sitemap.xml and robots.txt for the target host
 *   • excludes author-data.js unless the author features are enabled
 *
 * The site itself still works without this step. This is for publishing.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_OUT = path.join(ROOT, 'dist');

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Build the portfolio for publishing.

  node scripts/build.mjs [options]

Options:
  --base-url <url>   Public origin, e.g. https://example.com
                     or https://user.github.io/repo (no trailing slash needed)
  --cname <domain>   Write a CNAME file and, if --base-url is omitted,
                     use https://<domain> as the base URL
  --out <dir>        Output directory (default: dist/)
  --author           Include author-data.js even if the feature flags are off
  --no-author        Never include author-data.js
  --allow-empty      Build even when --base-url is missing (preview only)
  --help             Show this message
`);
  process.exit(0);
}

function valueOf(flag) {
  const index = args.indexOf(flag);
  if (index === -1) return '';
  const value = args[index + 1];
  if (!value || value.startsWith('--')) {
    fatal(`${flag} needs a value.`);
  }
  return value;
}

function fatal(message) {
  console.error(`\n  ✖ ${message}\n`);
  process.exit(1);
}

function warn(message) {
  console.warn(`  ! ${message}`);
}

function normalizeBase(raw) {
  if (!raw) return '';
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    fatal(`--base-url is not a valid URL: ${raw}`);
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    fatal('--base-url must start with http:// or https://');
  }
  if (parsed.search || parsed.hash) {
    fatal('--base-url must not contain a query string or hash.');
  }
  return parsed.toString().replace(/\/+$/, '');
}

function normalizeCname(raw) {
  const value = raw.trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase();
  if (!/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/i.test(value)) {
    fatal(`--cname does not look like a bare domain: ${raw}`);
  }
  return value;
}

function upsertHeadTag(html, pattern, tag) {
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace(/<\/head>/i, `  ${tag}\n</head>`);
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ----- Arguments ---------------------------------------------------------- */

const cnameArg = valueOf('--cname');
const cname = cnameArg ? normalizeCname(cnameArg) : '';

let baseUrl = normalizeBase(valueOf('--base-url'));
if (!baseUrl && cname) baseUrl = `https://${cname}`;
if (!baseUrl && !args.includes('--allow-empty')) {
  fatal(
    'No public URL. Pass --base-url https://your-site (or --cname your-domain).\n' +
      '    Use --allow-empty only for a local preview build.'
  );
}

const outArg = valueOf('--out');
const OUT = outArg ? path.resolve(ROOT, outArg) : DEFAULT_OUT;

if (OUT === ROOT) fatal('--out cannot be the project root.');
if (ROOT.startsWith(OUT + path.sep)) fatal('--out cannot contain the project.');
const outRel = path.relative(ROOT, OUT);
if (outRel && !outRel.startsWith('..') && !path.basename(OUT).startsWith('dist')) {
  fatal('An --out directory inside the project must start with "dist" (for example dist-preview).');
}

if (cname && baseUrl) {
  let host = '';
  try {
    host = new URL(baseUrl).host;
  } catch {
    host = '';
  }
  if (host && host !== cname && host !== `www.${cname}`) {
    warn(`--base-url host (${host}) does not match --cname (${cname}).`);
  }
}

/* ----- Author data gate --------------------------------------------------- */

const scriptSource = fs.readFileSync(path.join(ROOT, 'script.js'), 'utf8');
const flagsOn =
  /showAuthorIdentity\s*:\s*true/.test(scriptSource) ||
  /showBookPromotion\s*:\s*true/.test(scriptSource);

let includeAuthor;
if (args.includes('--no-author')) includeAuthor = false;
else if (args.includes('--author')) includeAuthor = true;
else includeAuthor = flagsOn;

if (args.includes('--no-author') && flagsOn) {
  warn('--no-author was passed while an author feature is enabled. The deployed section will be empty.');
}

const authorFile = path.join(ROOT, 'author-data.js');
if (includeAuthor && !fs.existsSync(authorFile)) {
  warn('Author features are enabled but author-data.js is missing. The section will stay empty.');
}
if (!includeAuthor && fs.existsSync(authorFile)) {
  warn('author-data.js exists but author features are off — it will NOT be copied.');
}

/* ----- Clean output ------------------------------------------------------- */

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

function copyFile(relative) {
  const source = path.join(ROOT, relative);
  if (!fs.existsSync(source)) return false;
  const target = path.join(OUT, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  return true;
}

/* ----- Copy public files only --------------------------------------------- */

const publicFiles = ['index.html', 'style.css', 'script.js', '404.html', '.nojekyll'];
const copied = [];

for (const file of publicFiles) {
  if (copyFile(file)) copied.push(file);
}

if (fs.existsSync(path.join(ROOT, 'assets'))) {
  fs.cpSync(path.join(ROOT, 'assets'), path.join(OUT, 'assets'), { recursive: true });
  copied.push('assets/');
}

if (includeAuthor && fs.existsSync(authorFile)) {
  copyFile('author-data.js');
  copied.push('author-data.js');
}

// Never ship these, even if they appear at the top level later.
const FORBIDDEN = [
  'studio.html',
  'storage.config.json',
  'storage.config.example.json',
  '.storage-token.json',
  '.env',
  'CNAME.example',
  'package.json',
  'robots.txt',
];
for (const name of FORBIDDEN) {
  const target = path.join(OUT, name);
  if (fs.existsSync(target)) fs.rmSync(target, { force: true });
}

/* ----- Inject canonical and social-preview URLs --------------------------- */

let html = fs.readFileSync(path.join(OUT, 'index.html'), 'utf8');

if (baseUrl) {
  const ogMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]*)"/i);
  const ogPath = ogMatch ? ogMatch[1].trim() : 'assets/images/og.png';
  const absoluteOg = /^https?:\/\//i.test(ogPath)
    ? ogPath
    : `${baseUrl}/${ogPath.replace(/^\/+/, '')}`;

  html = upsertHeadTag(
    html,
    /<link\s+rel="canonical"[^>]*>/i,
    `<link rel="canonical" href="${baseUrl}/">`
  );
  html = upsertHeadTag(
    html,
    /<meta\s+property="og:image"[^>]*>/i,
    `<meta property="og:image" content="${absoluteOg}">`
  );
  html = upsertHeadTag(
    html,
    /<meta\s+property="og:url"[^>]*>/i,
    `<meta property="og:url" content="${baseUrl}/">`
  );
  html = upsertHeadTag(
    html,
    /<meta\s+name="twitter:image"[^>]*>/i,
    `<meta name="twitter:image" content="${absoluteOg}">`
  );
} else {
  warn('No base URL: canonical, sitemap and absolute social images were skipped.');
}

fs.writeFileSync(path.join(OUT, 'index.html'), html, 'utf8');

/* ----- Patch the runtime base URL ----------------------------------------- */

let runtimeScript = fs.readFileSync(path.join(OUT, 'script.js'), 'utf8');
if (baseUrl) {
  runtimeScript = runtimeScript.replace(
    /baseUrl:\s*'[^']*'/,
    `baseUrl: ${JSON.stringify(baseUrl)}`
  );
}
fs.writeFileSync(path.join(OUT, 'script.js'), runtimeScript, 'utf8');

/* ----- Generate host files ------------------------------------------------ */

if (cname) {
  fs.writeFileSync(path.join(OUT, 'CNAME'), `${cname}\n`, 'utf8');
  copied.push('CNAME');
}

if (baseUrl) {
  const lastmod = new Date(
    Math.max(
      fs.statSync(path.join(ROOT, 'index.html')).mtimeMs,
      fs.statSync(path.join(ROOT, 'style.css')).mtimeMs,
      fs.statSync(path.join(ROOT, 'script.js')).mtimeMs
    )
  )
    .toISOString()
    .slice(0, 10);

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${escapeXml(baseUrl)}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
  fs.writeFileSync(path.join(OUT, 'sitemap.xml'), sitemap, 'utf8');

  fs.writeFileSync(
    path.join(OUT, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`,
    'utf8'
  );

  copied.push('sitemap.xml', 'robots.txt');
}

/* ----- Summary ------------------------------------------------------------ */

const sizeOf = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).reduce((total, entry) => {
    const full = path.join(dir, entry.name);
    return total + (entry.isDirectory() ? sizeOf(full) : fs.statSync(full).size);
  }, 0);

const kb = Math.round(sizeOf(OUT) / 1024);

console.log(`
  Built ${baseUrl || '(preview — no base URL)'}
  → ${OUT}
  ${copied.length} entries · ${kb} KB${cname ? ` · CNAME ${cname}` : ''}${includeAuthor ? ' · author data included' : ''}

  Next: npm run check
`);
