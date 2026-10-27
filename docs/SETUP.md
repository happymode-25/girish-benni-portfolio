# Setup and publishing

The portfolio is a static site. There is no database, build server or runtime
dependency. Node is only used for the optional preview/build/check tooling.

---

## 1. Preview locally

```bash
npm run dev
```

Open <http://localhost:5173>. Add `?dev=1` to see the pre-publication checklist.
The dev panel also appears automatically on `localhost`, `127.0.0.1` and
`file://`.

`npm run dev` runs `tools/dev-server.mjs`, a zero-dependency server. You can also
open `index.html` directly in a browser.

---

## 2. Decide the public URL

The build needs to know the final URL so canonical links, the sitemap and social
preview images are absolute. Use the origin plus any sub-path, **without a
trailing slash**.

| Hosting | `--base-url` |
| --- | --- |
| Custom domain | `https://girishbenni.com` |
| GitHub user site (`<user>.github.io`) | `https://<user>.github.io` |
| GitHub project site | `https://<user>.github.io/<repo>` |
| Cloudflare Pages / Netlify | `https://your-project.pages.dev` / `https://your-site.netlify.app` |
| Local preview only | `--allow-empty` (no canonical or sitemap) |

A custom domain is optional. The GitHub Pages URL works for free.

---

## 3. Build

```bash
npm run build -- --base-url https://your-site.example
npm run check
```

Output goes to `dist/`. The build:

- copies only public files (`index.html`, `style.css`, `script.js`, `404.html`,
  `assets/`, `.nojekyll`);
- injects a canonical link, `og:url`, and absolute `og:image` / `twitter:image`;
- writes the public base URL into `script.js` so runtime metadata matches;
- generates `robots.txt` and `sitemap.xml`;
- writes `CNAME` when `--cname` is passed;
- **never** copies `studio.html`, `tools/`, `scripts/`, `docs/`, `package.json`,
  OAuth config, tokens, or `author-data.js` unless the author features are on.

With a custom domain:

```bash
npm run build -- --base-url https://girishbenni.com --cname girishbenni.com
```

Preview the built copy:

```bash
node tools/dev-server.mjs --dir dist --port 5174
# http://localhost:5174
```

> Deploy `dist/`, not the project root. Deploying the root would also expose the
> local studio, setup docs and any secret files you created.

---

## 4. Option A — GitHub Pages (free, recommended)

### Create the repository

Use a dedicated repository for the portfolio, for example
`girish-benni-portfolio`.

- **Project site:** `https://<user>.github.io/girish-benni-portfolio`
- **User site:** name the repository `<user>.github.io` → `https://<user>.github.io`

The included workflow at `.github/workflows/pages.yml` builds and deploys `dist/`
on every push to `main`. It derives the default project-site URL automatically.

### Enable Pages

1. Push the portfolio folder to the repository's `main` branch.
2. In the repository: **Settings → Pages → Build and deployment**.
3. Set **Source** to **GitHub Actions**.
4. Push a change (or run the workflow manually from **Actions**).
5. Wait for the deploy job, then open the URL shown in **Settings → Pages**.

No paid plan is needed for a public repository. A private repository can publish
Pages on paid GitHub plans; a public repository is free.

### Custom domain later

1. Add the domain in **Settings → Pages → Custom domain** and save.
2. Add DNS records at your registrar.

For an apex domain such as `girishbenni.com`:

| Type | Name | Value |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |
| CNAME | `www` | `<user>.github.io` |

For a `www` or subdomain host only, a single CNAME to `<user>.github.io` is
enough. After DNS resolves, tick **Enforce HTTPS**.

3. In the repository, set two **Actions variables** (Settings → Secrets and
   variables → Actions → Variables):

   - `SITE_BASE_URL` = `https://girishbenni.com`
   - `SITE_CNAME` = `girishbenni.com`

The workflow then builds with the custom URL and writes the `CNAME` file. Without
these variables it uses the default GitHub Pages URL.

> If you use Cloudflare DNS, set the records to **DNS only** (grey cloud) until
> GitHub has issued the certificate. Proxying can interfere with the HTTP
> challenge. You can re-enable the proxy afterwards if you understand the
> caching implications.

### Alternative: deploy from a branch

If you prefer not to use Actions:

```bash
npm run build -- --base-url https://<user>.github.io/<repo>
```

Copy the **contents** of `dist/` to a `gh-pages` branch (or to the repository
root and choose **Deploy from a branch**). Keep `.nojekyll` in the published
files. Rebuild and re-copy after every content change.

---

## 5. Option B — Cloudflare Pages

1. Push the project to GitHub/GitLab.
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
3. Build command:

   ```bash
   node scripts/build.mjs --base-url https://your-project.pages.dev
   ```

4. Build output directory: `dist`
5. Node version: 20 or newer.
6. Add the custom domain in **Custom domains** when you have one, then rebuild
   with the final `--base-url` (or use an environment variable in the command).

Cloudflare Pages does not need the `CNAME` file. Set the domain in the dashboard.

## 6. Option C — Netlify

1. **Add new site → Import an existing project**.
2. Build command:

   ```bash
   node scripts/build.mjs --base-url https://your-site.netlify.app
   ```

3. Publish directory: `dist`
4. Add the domain under **Domain management**, then rebuild with the final URL.

## 7. Option D — any static host or USB stick

Run the build, then upload the **contents of `dist/`** to the host. The site needs
no server-side features. Relative paths mean it also works from a subfolder, as
long as `--base-url` matches that subfolder.

---

## 8. After publishing

- Open the live URL on desktop and mobile.
- Check the browser console for errors.
- Test every link, filter, menu and the copy-email button.
- Paste the URL into a social preview debugger (for example, LinkedIn Post
  Inspector or the Facebook Sharing Debugger) to confirm the preview image.
- Submit `https://your-domain/sitemap.xml` in Google Search Console if you want
  indexing.
- Re-run `npm run check` and `npm run build -- --base-url ...` after changes.

Full pre-publication list: [CHECKLIST.md](CHECKLIST.md).
