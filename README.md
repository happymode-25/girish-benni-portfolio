# Girish Benni — portfolio

A static, single-page portfolio for software, security labs, AI experiments,
open-source work, and writing. Built with HTML, CSS and vanilla JavaScript. No
framework, no bundler, no database, no external requests.

The design is deliberately editorial: near-black paper, off-white serif type, a
restrained acid-green accent, fine rules and asymmetric layouts. It is not a
dashboard and it does not use stock illustrations or invented metrics.

> **Current state:** the structure, design and interactions are finished. The
> project, lab, AI and writing entries are still **placeholders** and are labelled
> as such. Replace them with real work before publishing. See
> [docs/CHECKLIST.md](docs/CHECKLIST.md).

---

## Quick start

The published site is just files. You can open `index.html` directly.

For a local server with the dev checklist:

```bash
npm run dev
# http://localhost:5173
# http://localhost:5173/?dev=1
```

Node 20+ is only needed for the optional preview/build tooling. The website
itself has no runtime dependencies.

## Edit your content

Everything you normally change lives in **one object** at the top of
[`script.js`](script.js) — `SITE_CONFIG`:

- `meta` — title, description, public base URL
- `identity` — name, headline, intro, location, profile image
- `about` — intro, lede, paragraphs, "Currently" list
- `socials` — GitHub, LinkedIn, YouTube, X, Instagram (empty = hidden)
- `contact` — email and extra methods (empty = hidden)
- `features` — author/book switches, GitHub live mode, placeholder badges
- `projects` — project cards with category filters
- `security` — cybersecurity lab entries
- `ai` — AI project entries
- `github` — curated repositories (or live API)
- `writing` — articles and notes
- `author` — optional author/book configuration

Images accept:

```js
'assets/images/my-shot.png'          // local file
'drive:1AbCdEfGhIjKlMnOpQrStUv'      // Google Drive file id
'https://1drv.ms/i/s!AbCdEf...'      // OneDrive share link
```

Full field-by-field guidance: [docs/CUSTOMIZE.md](docs/CUSTOMIZE.md).

## Optional media storage (Google Drive / OneDrive)

`studio.html` is a local-only upload tool. It connects to Google Drive or
OneDrive with OAuth, uploads images, and gives you a direct URL you can paste
into `SITE_CONFIG`. Credentials and refresh tokens stay on your machine and are
excluded from git and from the published build.

```bash
cp storage.config.example.json storage.config.json   # fill in your own app
npm run studio                                        # http://127.0.0.1:8787/studio.html
```

Setup, security and troubleshooting: [docs/STORAGE.md](docs/STORAGE.md).

## Build for publishing

The source works as-is. The build step copies only public files into `dist/`,
injects canonical/social URLs, and writes `CNAME`, `sitemap.xml` and
`robots.txt`.

```bash
npm run build -- --base-url https://your-domain.com
npm run check
```

With a custom domain:

```bash
npm run build -- --base-url https://girishbenni.com --cname girishbenni.com
```

Publishing to GitHub Pages, Cloudflare Pages or Netlify:
[docs/SETUP.md](docs/SETUP.md).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Local preview at `localhost:5173` (add `?dev=1`) |
| `npm run studio` | Local Drive/OneDrive upload tool at `127.0.0.1:8787` |
| `npm run build` | Build a publishable copy into `dist/` |
| `npm run check` | Link, syntax, config, placeholder and leak check |

## Project layout

```
index.html                  page structure and static metadata
style.css                   design system, layout, responsive and motion styles
script.js                   SITE_CONFIG + rendering logic
404.html                    styled not-found page
studio.html                 local-only storage uploader (never published)
assets/
  images/og.png             social preview image
  icons/favicon.svg
scripts/build.mjs           publishable build
scripts/check.mjs           pre-publication checks
tools/dev-server.mjs        zero-dependency preview server
tools/storage-server.mjs    local OAuth + upload server
docs/                       setup, customization, storage, privacy, checklist
storage.config.example.json OAuth credential template
```

## What the site does by default

- Shows placeholder badges on content that is not real yet.
- Hides empty social links rather than rendering dead icons.
- Hides the email button until `contact.email` is set; there is no form.
- Keeps author identity and book promotion **off**, with no author data in the
  deployed files while off.
- Uses `mailto:` only. No data is collected, sent or stored by the site.
- Uses system fonts, so it works offline and on slow connections.
- Respects `prefers-reduced-motion`.
- Supports keyboard navigation, skip links, visible focus and mobile menus.
- Uses a dynamic copyright year.

## Honest limitations

- The build and check scripts are optional conveniences; the site is still
  static files.
- The storage studio cannot be tested end-to-end without your own OAuth client
  credentials. Its flow was verified against a local mock of the Drive API,
  not against Google's or Microsoft's live services.
- GitHub live mode is rate-limited without a token. The curated list is the
  default and the fallback.
- No analytics, cookies, contact form, comments or server-side code are
  included. If you add them later, update [docs/PRIVACY.md](docs/PRIVACY.md).

## Documentation

- [Setup and publishing](docs/SETUP.md)
- [Customization guide](docs/CUSTOMIZE.md)
- [Pre-publication checklist](docs/CHECKLIST.md)
- [Drive / OneDrive storage](docs/STORAGE.md)
- [GitHub section and live API](docs/GITHUB.md)
- [Privacy and author data](docs/PRIVACY.md)
- [Author data example](docs/author-data.example.js)
