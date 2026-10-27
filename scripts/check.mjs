#!/usr/bin/env node
/**
 * Pre-publication and integrity check.
 *
 *   node scripts/check.mjs
 *   node scripts/check.mjs --strict   # warnings fail too
 *
 * It reads the real SITE_CONFIG out of script.js (the config block is plain
 * data), so it reports the actual placeholders left in the site instead of
 * guessing from comments.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STRICT = process.argv.includes('--strict');

const errors = [];
const warnings = [];
const passes = [];

const error = (message) => errors.push(message);
const warn = (message) => warnings.push(message);
const pass = (message) => passes.push(message);

const read = (relative) => fs.readFileSync(path.join(ROOT, relative), 'utf8');
const exists = (relative) => fs.existsSync(path.join(ROOT, relative));

const distExists = exists('dist');
let builtBaseUrl = '';
if (distExists) {
  try {
    const match = read('dist/script.js').match(/baseUrl:\s*["']([^"']+)["']/);
    if (match && /^https?:\/\//i.test(match[1])) builtBaseUrl = match[1].replace(/\/+$/, '');
  } catch {
    /* an incomplete dist is reported below */
  }
}

function walk(dir, output = []) {
  if (!fs.existsSync(dir)) return output;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, output);
    else output.push(full);
  }
  return output;
}

/* ----- Required files ----------------------------------------------------- */

const required = [
  'index.html',
  'style.css',
  'script.js',
  '404.html',
  'assets/icons/favicon.svg',
  'assets/images/og.png',
  'README.md',
  'docs/SETUP.md',
  'docs/CUSTOMIZE.md',
  'docs/CHECKLIST.md',
  'docs/STORAGE.md',
  'docs/GITHUB.md',
  'docs/PRIVACY.md',
  'storage.config.example.json',
  'tools/storage-server.mjs',
  'studio.html',
];

const missing = required.filter((file) => !exists(file));
if (missing.length) error(`Missing required file(s): ${missing.join(', ')}`);
else pass('All required project files are present.');

if (!exists('.nojekyll')) warn('No .nojekyll file — GitHub Pages may run Jekyll over the output.');
if (!exists('CNAME.example')) warn('No CNAME.example — custom-domain instructions may be missing.');

/* ----- JavaScript syntax -------------------------------------------------- */

const jsFiles = walk(ROOT).filter(
  (file) =>
    /\.(?:js|mjs)$/.test(file) &&
    !file.includes(`${path.sep}dist${path.sep}`) &&
    !file.includes(`${path.sep}.git${path.sep}`)
);

let syntaxFailures = 0;
for (const file of jsFiles) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    syntaxFailures += 1;
    const relative = path.relative(ROOT, file);
    error(`Syntax error in ${relative}: ${(result.stderr || '').trim().split('\n').slice(0, 3).join(' ')}`);
  }
}
if (!syntaxFailures) pass(`JavaScript syntax is valid (${jsFiles.length} file${jsFiles.length === 1 ? '' : 's'}).`);

/* ----- Load SITE_CONFIG --------------------------------------------------- */

let config = null;
try {
  const source = read('script.js');
  const start = source.indexOf('const SITE_CONFIG =');
  const end = source.indexOf('\n};', start);
  if (start === -1 || end === -1) throw new Error('Could not find the SITE_CONFIG block.');
  const block = source.slice(start, end + 3).replace('const SITE_CONFIG =', 'SITE_CONFIG =');
  config = vm.runInNewContext(`${block}\nSITE_CONFIG;`, Object.create(null), { timeout: 2000 });
} catch (err) {
  error(`Could not read SITE_CONFIG: ${err.message}`);
}

if (config) pass('SITE_CONFIG parsed from script.js.');

/* ----- HTML --------------------------------------------------------------- */

const htmlFiles = ['index.html', '404.html'].filter(exists);
const htmlById = Object.fromEntries(htmlFiles.map((file) => [file, read(file)]));
const index = htmlById['index.html'] || '';

if (index) {
  const ids = [...index.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  const duplicates = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
  if (duplicates.length) error(`Duplicate id attribute(s) in index.html: ${duplicates.join(', ')}`);
  else pass('All id attributes in index.html are unique.');

  const anchors = [...index.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);
  const brokenAnchors = [...new Set(anchors.filter((anchor) => !ids.includes(anchor)))];
  if (brokenAnchors.length) error(`Anchor link(s) without a target: ${brokenAnchors.join(', ')}`);
  else pass('Every in-page anchor has a matching id.');

  if (/<h1[\s>]/i.test(index)) {
    const h1Count = (index.match(/<h1[\s>]/gi) || []).length;
    if (h1Count > 1) warn(`index.html has ${h1Count} h1 elements; one is usually enough.`);
    else pass('index.html has a single h1.');
  } else {
    error('index.html has no h1.');
  }

  if (/<a\b[^>]*href="#"/i.test(index)) error('index.html contains an empty href="#" link.');
  if (!/<a\b[^>]*class="skip-link"/i.test(index)) error('Missing skip link.');
  if (!/<main\b[^>]*id="main"/i.test(index)) error('Missing <main id="main">.');
  if (!/<html\b[^>]*lang="/i.test(index)) error('The <html> element has no lang attribute.');
  if (!/<meta\s+name="viewport"/i.test(index)) error('Missing viewport meta tag.');

  const imgTags = [...index.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
  const missingAlt = imgTags.filter((tag) => !/\balt\s*=/.test(tag));
  if (missingAlt.length) warn(`${missingAlt.length} static image(s) have no alt attribute.`);

  // Internal href/src targets.
  const references = [...index.matchAll(/\b(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
  const broken = [];
  for (const reference of references) {
    if (/^(?:#|mailto:|tel:|data:|javascript:|https?:)/i.test(reference)) continue;
    const clean = reference.split(/[?#]/)[0];
    if (!clean) continue;
    const target = clean === './' ? 'index.html' : clean.replace(/^\.\//, '');
    if (!exists(target)) broken.push(reference);
  }
  if (broken.length) error(`Broken local reference(s) in index.html: ${[...new Set(broken)].join(', ')}`);
  else pass('All static local references in index.html resolve.');

  if (!/<title>[^<]+<\/title>/i.test(index)) error('index.html has no non-empty <title>.');
  if (!/<meta\s+name="description"\s+content="[^"]+"/i.test(index)) {
    error('index.html has no meta description.');
  }
  if (!/<meta\s+property="og:image"/i.test(index)) error('index.html has no og:image.');
  else pass('Core metadata (title, description, og:image) is present.');

  const externalAsset = /<(?:link|script)\b[^>]*(?:href|src)="https?:\/\//i.test(index);
  if (externalAsset) warn('index.html loads an external stylesheet or script (no external requests are required).');
}

// 404 local assets.
if (htmlById['404.html']) {
  const refs = [...htmlById['404.html'].matchAll(/\b(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
  const broken404 = refs.filter((reference) => {
    if (/^(?:#|mailto:|tel:|data:|javascript:|https?:)/i.test(reference)) return false;
    const clean = reference.split(/[?#]/)[0];
    return clean && !exists(clean.replace(/^\.\//, ''));
  });
  if (broken404.length) error(`Broken reference(s) in 404.html: ${[...new Set(broken404)].join(', ')}`);
}

/* ----- CSS ---------------------------------------------------------------- */

let css = '';
if (exists('style.css')) {
  css = read('style.css');

  const open = (css.replace(/\/\*[\s\S]*?\*\//g, '').match(/{/g) || []).length;
  const close = (css.replace(/\/\*[\s\S]*?\*\//g, '').match(/}/g) || []).length;
  if (open !== close) error(`style.css has unbalanced braces (${open} open, ${close} close).`);
  else pass('style.css braces are balanced.');

  if (/@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/i.test(css)) {
    pass('Reduced-motion styles are present.');
  } else {
    error('Missing prefers-reduced-motion support in style.css.');
  }

  if (/:focus-visible/i.test(css)) pass('Visible keyboard focus styles are present.');
  else error('Missing :focus-visible styles.');

  if (/@import\s+url\(\s*['"]?https?:/i.test(css) || /url\(\s*['"]?https?:/i.test(css)) {
    warn('style.css references an external URL; the design is meant to work without external requests.');
  }

  // Strip data: URLs first — they contain quotes, parentheses and parentheses
  // inside SVG fragments, which makes a naive url(...) scan produce false hits.
  const cssWithoutData = css.replace(/url\(\s*(["'])data:[\s\S]*?\1\s*\)/gi, '');
  const cssUrls = [...cssWithoutData.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)].map((match) => match[1]);
  const brokenCss = cssUrls.filter((url) => {
    if (/^(?:data:|https?:|#)/i.test(url)) return false;
    return !exists(url.split(/[?#]/)[0].replace(/^\.\//, ''));
  });
  if (brokenCss.length) error(`Broken CSS asset reference(s): ${[...new Set(brokenCss)].join(', ')}`);
}

/* ----- Images ------------------------------------------------------------- */

const ogPath = path.join(ROOT, 'assets/images/og.png');
if (fs.existsSync(ogPath)) {
  const signature = fs.readFileSync(ogPath).subarray(0, 8);
  if (!signature.equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    error('assets/images/og.png is not a valid PNG.');
  } else {
    pass('Social preview image is a valid PNG.');
  }
}

if (exists('assets/icons/favicon.svg')) {
  const svg = read('assets/icons/favicon.svg');
  if (!/<svg[\s>]/i.test(svg)) error('assets/icons/favicon.svg does not contain an <svg> root.');
  else pass('Favicon SVG is present.');
}

/* ----- Config ------------------------------------------------------------- */

function isHttpUrl(value) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value || '');
}

function isLocalAsset(value) {
  return typeof value === 'string' && value.trim() !== '' && !/^(?:https?:|data:|drive:)/i.test(value.trim());
}

function localAssetExists(value) {
  const clean = value
    .trim()
    .split(/[?#]/)[0]
    .replace(/^\.\//, '')
    .replace(/^\/+/, '');
  return Boolean(clean) && exists(clean);
}

function isLinkish(value) {
  return /^(?:https?:|mailto:)/i.test(value) || /^(?:\.{0,2}\/|#)/.test(value);
}

let placeholderTotal = 0;

if (config) {
  const { identity, meta, socials, contact, features } = config;

  if (!identity?.name || !identity?.headline) error('identity.name and identity.headline must be set.');
  else pass('Identity name and headline are set.');

  if (!meta?.title) error('meta.title is empty.');
  if (!meta?.description) error('meta.description is empty.');
  else if (meta.description.length > 170) warn(`meta.description is ${meta.description.length} characters; aim for under ~160.`);

  if (meta?.baseUrl) {
    if (!isHttpUrl(meta.baseUrl)) error(`meta.baseUrl is not a valid http(s) URL: ${meta.baseUrl}`);
    else if (/\/$/.test(meta.baseUrl)) warn('meta.baseUrl ends with a slash; the runtime strips it, but clean it up.');
    else pass('meta.baseUrl is set for canonical and social URLs.');
  } else if (builtBaseUrl) {
    pass(`Source meta.baseUrl is empty, but dist/ was built with ${builtBaseUrl}.`);
  } else {
    warn('meta.baseUrl is empty. Pass --base-url to the build before publishing.');
  }

  for (const [key, value] of Object.entries(socials || {})) {
    if (!value) continue;
    if (!isHttpUrl(value)) error(`socials.${key} is not a valid http(s) URL: ${value}`);
  }
  const socialCount = Object.values(socials || {}).filter(Boolean).length;
  if (socialCount === 0) warn('No social links are configured (socials.*).');
  else pass(`${socialCount} social link${socialCount === 1 ? '' : 's'} configured.`);

  if (!contact?.email) warn('contact.email is empty — the email call-to-action stays hidden.');
  else if (!isEmail(contact.email)) error(`contact.email is not a valid email address: ${contact.email}`);
  else pass('Contact email is valid.');

  if (!Array.isArray(config.projects) || !config.projects.length) {
    error('projects is empty.');
  } else {
    const titles = config.projects.map((project) => project.title);
    const duplicates = [...new Set(titles.filter((title, i) => titles.indexOf(title) !== i))];
    if (duplicates.length) error(`Duplicate project title(s): ${duplicates.join(', ')}`);
    const allowed = new Set(['development', 'ai', 'cybersecurity', 'open-source']);
    const badCategories = config.projects.filter((project) => !allowed.has(project.category));
    if (badCategories.length) {
      error(`Project category must be development | ai | cybersecurity | open-source: ${badCategories.map((p) => p.title).join(', ')}`);
    }
    if (config.projects.some((project) => !project.title || !project.description)) {
      error('Every project needs a title and description.');
    }
    pass(`${config.projects.length} project entries configured.`);
  }

  /* Link and local-image fields across all sections. */
  const linkChecks = [];
  const imageChecks = [['identity.profileImage', identity?.profileImage]];

  (config.projects || []).forEach((project, index) => {
    linkChecks.push([`projects[${index}].repo`, project.repo], [`projects[${index}].demo`, project.demo]);
    imageChecks.push([`projects[${index}].image`, project.image]);
  });
  (config.security?.entries || []).forEach((entry, index) => {
    linkChecks.push([`security.entries[${index}].writeUp`, entry.writeUp], [`security.entries[${index}].repo`, entry.repo]);
  });
  (config.ai?.entries || []).forEach((entry, index) => {
    linkChecks.push([`ai.entries[${index}].repo`, entry.repo], [`ai.entries[${index}].demo`, entry.demo]);
    imageChecks.push([`ai.entries[${index}].image`, entry.image]);
  });
  (config.writing?.entries || []).forEach((entry, index) => {
    linkChecks.push([`writing.entries[${index}].url`, entry.url]);
    imageChecks.push([`writing.entries[${index}].cover`, entry.cover]);
  });
  (config.github?.repos || []).forEach((repo, index) => {
    linkChecks.push([`github.repos[${index}].url`, repo.url]);
  });
  (config.contact?.methods || []).forEach((method, index) => {
    linkChecks.push([`contact.methods[${index}].url`, method.url]);
  });

  const badLinks = linkChecks.filter(([, value]) => value && !isLinkish(value));
  if (badLinks.length) {
    error(`Link field(s) will be ignored because they are not http(s) or relative: ${badLinks.map(([field]) => field).join(', ')}`);
  } else if (linkChecks.some(([, value]) => value)) {
    pass('Configured links use valid schemes.');
  }

  const badImages = imageChecks.filter(([, value]) => isLocalAsset(value) && !localAssetExists(value));
  if (badImages.length) {
    error(`Local image path(s) do not exist: ${badImages.map(([field, value]) => `${field} (${value})`).join(', ')}`);
  } else if (imageChecks.some(([, value]) => value)) {
    pass('Local image paths resolve.');
  }

  const malformedDrive = imageChecks.filter(
    ([, value]) => typeof value === 'string' && /^drive:/i.test(value.trim()) && !/^drive:[\w-]{10,}$/.test(value.trim())
  );
  if (malformedDrive.length) {
    warn(`Drive image value(s) may be malformed: ${malformedDrive.map(([field]) => field).join(', ')}`);
  }

  const placeholderGroups = [
    ['project', 'projects', config.projects || []],
    ['security entry', 'security entries', config.security?.entries || []],
    ['AI entry', 'AI entries', config.ai?.entries || []],
    ['writing entry', 'writing entries', config.writing?.entries || []],
  ];
  for (const [singular, plural, entries] of placeholderGroups) {
    const count = entries.filter((entry) => entry.placeholder).length;
    placeholderTotal += count;
    if (count) warn(`${count} ${count === 1 ? singular : plural} still marked placeholder.`);
  }

  if (placeholderTotal && !features?.showPlaceholderBadges) {
    warn('Placeholder content exists but showPlaceholderBadges is off; visitors cannot tell it apart from real work.');
  }

  const linklessRepos = (config.github?.repos || []).filter((repo) => !isHttpUrl(repo.url)).length;
  if (linklessRepos) warn(`${linklessRepos} GitHub entr${linklessRepos === 1 ? 'y has' : 'ies have'} no URL.`);

  if (features?.githubLive) {
    if (!config.github?.username) error('features.githubLive is on but github.username is empty.');
    else pass('Live GitHub mode is enabled with a username.');
  }

  if (features?.showAuthorIdentity || features?.showBookPromotion) {
    if (!exists('author-data.js')) error('Author features are on but author-data.js is missing.');
    else pass('Author features are on and author-data.js exists.');
  } else if (exists('author-data.js')) {
    warn('author-data.js exists locally but both author feature flags are off. Do not deploy the file.');
  }

  const authorFile = path.join(ROOT, 'author-data.js');
  if ((features?.showAuthorIdentity || features?.showBookPromotion) && fs.existsSync(authorFile)) {
    try {
      const sandbox = { window: {} };
      vm.runInNewContext(read('author-data.js'), sandbox, { timeout: 2000 });
      const author = sandbox.window.AUTHOR_DATA;
      if (!author || (!author.penName && !author.bio && !(author.books || []).length)) {
        error('author-data.js loaded but contains no penName, bio, or books.');
      } else {
        pass('author-data.js loads and has author content.');
      }
    } catch (err) {
      error(`author-data.js could not be parsed: ${err.message}`);
    }
  }
}

/* ----- Secrets and source leaks ------------------------------------------ */

const secretFiles = ['storage.config.json', '.storage-token.json', '.env'];
const presentSecrets = secretFiles.filter(exists);
if (presentSecrets.length) {
  warn(`Local secret file(s) present (expected, must stay out of git): ${presentSecrets.join(', ')}`);
}

const forbiddenInDist = [
  'studio.html',
  'storage.config.json',
  'storage.config.example.json',
  '.storage-token.json',
  '.env',
  'package.json',
  'author-data.js',
  'tools',
  'scripts',
  'docs',
];

if (distExists) {
  const distFiles = walk(path.join(ROOT, 'dist')).map((file) => path.relative(path.join(ROOT, 'dist'), file));
  const leakedPaths = distFiles.filter((file) =>
    forbiddenInDist.some((name) => file === name || file.startsWith(`${name}${path.sep}`) || file.startsWith(`${name}/`))
  );
  const authorOn = config?.features?.showAuthorIdentity || config?.features?.showBookPromotion;
  const leaked = leakedPaths.filter((file) => file !== 'author-data.js' || !authorOn);
  if (leaked.length) error(`Forbidden file(s) in dist/: ${leaked.join(', ')}`);
  else pass('dist/ contains no source, studio, docs, or secret files.');

  const secretPatterns = [
    /"clientSecret"\s*:\s*"[^"]+"/,
    /"client_secret"\s*:\s*"[^"]+"/,
    /"refresh_token"\s*:\s*"[^"]+"/,
    /C:\\\\Users\\\\/i,
    /storage-token/i,
  ];
  const contentLeaks = [];
  for (const file of walk(path.join(ROOT, 'dist'))) {
    if (!/\.(?:html|css|js|json|xml|txt|md|svg)$/i.test(file)) continue;
    const body = fs.readFileSync(file, 'utf8');
    if (secretPatterns.some((pattern) => pattern.test(body))) {
      contentLeaks.push(path.relative(path.join(ROOT, 'dist'), file));
    }
  }
  if (contentLeaks.length) error(`Possible secret or local-path leak in: ${contentLeaks.join(', ')}`);
  else pass('No secret values or local absolute paths found in dist/.');

  if (!exists('dist/index.html')) {
    error('dist/index.html is missing.');
  } else if (builtBaseUrl) {
    const distIndex = read('dist/index.html');
    const canonical = distIndex.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
    if (!canonical) {
      error('dist/index.html is missing the canonical link. Rebuild with --base-url.');
    } else if (canonical[1] !== `${builtBaseUrl}/`) {
      error(`Built canonical (${canonical[1]}) does not match the built base URL (${builtBaseUrl}/).`);
    } else {
      pass(`Built canonical matches the base URL (${canonical[1]}).`);
    }

    const builtOg = distIndex.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
    if (!builtOg || !/^https?:\/\//i.test(builtOg[1])) {
      error('Built index.html og:image is not absolute.');
    } else {
      pass('Built social preview image is absolute.');
    }

    if (!exists('dist/sitemap.xml')) error('dist/sitemap.xml is missing.');
    else pass('Built sitemap.xml is present.');
    if (!exists('dist/robots.txt')) error('dist/robots.txt is missing.');
  } else {
    warn('dist/ is a preview build without a base URL. Canonical, sitemap and absolute OG tags are missing.');
  }
} else {
  warn('No dist/ build yet. Run: npm run build -- --base-url https://your-site');
}

/* ----- Content smells ----------------------------------------------------- */

const sourceText = ['index.html', 'script.js', 'style.css']
  .filter(exists)
  .map((file) => read(file))
  .join('\n');

for (const smell of ['lorem ipsum', 'TODO:', 'TBD']) {
  if (sourceText.toLowerCase().includes(smell.toLowerCase())) {
    warn(`Source still contains "${smell}".`);
  }
}

/* ----- Report ------------------------------------------------------------- */

const line = '─'.repeat(64);
console.log(`\n  Portfolio check\n  ${line}`);

for (const message of passes) console.log(`  ✓ ${message}`);
for (const message of warnings) console.log(`  ! ${message}`);
for (const message of errors) console.log(`  ✖ ${message}`);

console.log(`  ${line}`);
if (placeholderTotal) {
  console.log(`  ${placeholderTotal} placeholder ${placeholderTotal === 1 ? 'entry' : 'entries'} still need real content.`);
}
console.log(
  `  ${passes.length} passed · ${warnings.length} warning${warnings.length === 1 ? '' : 's'} · ${errors.length} error${errors.length === 1 ? '' : 's'}`
);

const failed = errors.length > 0 || (STRICT && warnings.length > 0);
if (failed) {
  console.log(STRICT && !errors.length ? '\n  Strict mode: warnings count as failures.\n' : '\n  Fix the errors above before publishing.\n');
  process.exit(1);
}

console.log('\n  Nothing broken. Review the warnings before publishing.\n');
