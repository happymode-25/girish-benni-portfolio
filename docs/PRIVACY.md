# Privacy and author data

This page explains what the portfolio does with data, what it deliberately does
not do, and how the optional author identity stays out of the deployed source
while it is disabled.

This is an engineering description, not legal advice. If you add analytics,
payments, a form or a newsletter, you must update this document and probably add
a real privacy policy.

---

## 1. What the site does by default

The published site is static HTML, CSS and JavaScript. It has:

- **no analytics** and no tracking pixels;
- **no cookies** and no `localStorage` identity tracking;
- **no contact form**, no database and no server-side code;
- **no third-party fonts**, CSS frameworks or scripts;
- **no advertising**;
- **no account system**.

The only data the site stores in the browser is none that identifies a visitor.
There is no consent banner because there is nothing to consent to by default.

### Hosting logs

Your host (GitHub Pages, Cloudflare Pages, Netlify, etc.) may keep standard
access logs containing IP addresses, user agents, requested paths and timestamps.
That is outside the site's control. Check the host's privacy documentation.

### Email

If `contact.email` is set, the address is present in the page source and in the
`mailto:` link. That is how email links work. It can be collected by scrapers.
If that matters to you, use an address created for the site, or remove the email
and list only a contact page elsewhere. The "Copy address" button uses the
clipboard locally; nothing is sent anywhere.

---

## 2. Third-party requests

By default the page makes no third-party requests. Two opt-in features can change
that:

| Feature | Request | What the third party sees |
| --- | --- | --- |
| `features.githubLive: true` | `api.github.com` | Visitor IP, user agent, requested username |
| Google Drive image (`drive:` or Drive URL) | `lh3.googleusercontent.com` | Visitor IP, user agent, file id |
| OneDrive image | `api.onedrive.com` / Microsoft | Visitor IP, user agent, share URL |

Social links are ordinary links; no request is made until the visitor clicks one.
No fonts or images are pulled from a CDN by default.

If you want zero third-party requests, keep GitHub live mode off and host images
locally in `assets/images/`.

---

## 3. Author identity and book promotion

This is the part that needs care.

### Default state

```js
features: {
  showAuthorIdentity: false,
  showBookPromotion: false,
}
```

While both are false:

- no author section is created;
- no "Books" navigation item is added;
- `initAuthor()` returns before creating a script tag;
- no request is made for `author-data.js`;
- `author-data.js` is gitignored and excluded from the build;
- no pen name, bio, book title or purchase link exists in `index.html`,
  `style.css` or `script.js`.

This is stronger than hiding a section with CSS. If the data is not in the
deployed files, it cannot be found by viewing source, searching the JS bundle or
fetching `author-data.js`.

### Enabled state

To publish the author identity:

1. Copy [`author-data.example.js`](author-data.example.js) to `author-data.js`
   in the project root.
2. Fill in only real information.
3. Set `showAuthorIdentity: true` and/or `showBookPromotion: true`.
4. Build with `--author` (or let the build include it automatically when a flag
   is true):

   ```bash
   npm run build -- --base-url https://your-site --author
   ```

5. Confirm `dist/author-data.js` exists and contains the intended data.
6. Upload `dist/`, not the project root.

The section is inserted before Contact, and a Books nav item is added only when
the section actually renders.

### Turning it off again

1. Set both flags to `false`.
2. Delete or move `author-data.js`.
3. Rebuild. The build excludes it, and `npm run check` fails if it finds
   `author-data.js` in `dist/` while the flags are off.
4. Redeploy `dist/`.

**Git history is not rewritten by deleting a file.** If `author-data.js` was ever
committed, the data remains in the repository history and possibly in forks,
caches or search indexes. If that is unacceptable, treat the pen name as already
public, or rewrite history carefully before the repository is public. Deleting
the file in a later commit is not enough.

### What is still visible when enabled

- The pen name and bio appear in the page.
- Book titles, descriptions and links appear in the page.
- The data file is publicly fetchable at `/author-data.js`.
- Search engines and archives may index it.

There is no way to publish a book promotion while keeping the author identity
secret from the public source. Decide which one you want.

### If you use a pen name

- Keep the legal name out of `author-data.js`, image filenames, EXIF metadata and
  purchase URLs.
- Do not reuse a personal email that contains your legal name.
- Strip EXIF from cover images before upload.
- Check that the book's store page does not expose more than you intend.

---

## 4. Local storage studio

The studio (`studio.html` + `tools/storage-server.mjs`) is a local tool. It is
never part of the published build.

It stores:

- `storage.config.json` — OAuth client ID/secret, folder settings (gitignored);
- `.storage-token.json` — access and refresh tokens (gitignored, mode `600`).

These files stay on your machine. The browser page does not receive the client
secret or refresh token. The server binds to `127.0.0.1` and rejects unexpected
`Host` headers to reduce DNS-rebinding risk.

Deleting a file in the studio deletes it at the provider (Google Drive moves it
to trash; OneDrive deletes it). Signing out removes the stored token for that
provider. To fully revoke access, also remove the app's access in your Google or
Microsoft account security settings.

More: [STORAGE.md](STORAGE.md).

---

## 5. If you add third-party services later

Any of these changes the privacy story:

- analytics (Google Analytics, Plausible, Umami, etc.);
- a hosted contact form (Formspree, Netlify Forms, etc.);
- a newsletter provider;
- embedded YouTube/Vimeo videos;
- comments;
- advertising;
- error tracking or session replay;
- a chatbot.

Before adding one:

- decide what data it collects and why;
- update this document;
- add a consent mechanism if required in your jurisdiction;
- prefer privacy-friendly, cookie-free options;
- do not put API secrets in client-side JavaScript.

The site currently has no consent banner because it sets no non-essential
cookies. Adding analytics may change that.

---

## 6. Verifying the off state

Use the build, not the source tree, because that is what visitors receive.

```bash
npm run build -- --base-url https://your-site
npm run check
```

Then confirm:

```bash
# Should fail / return nothing:
ls dist/author-data.js

# Should show no author-specific strings:
grep -ri "penName\|showAuthorIdentity" dist/
```

`script.js` will still contain the feature flag and the `dataFile` name — that is
configuration, not private data. What matters is that `author-data.js` and the
actual pen name/bio/book details are absent.

If the flags are on, reverse the check: `dist/author-data.js` must exist, and the
live page must show the section before Contact.

---

## 7. Data summary

| Data | Where it lives | Published? |
| --- | --- | --- |
| Site content (identity, projects, writing) | `script.js` | Yes |
| Contact email | `script.js` / page source | Yes, if set |
| Author pen name, bio, books | `author-data.js` | Only when enabled and built in |
| OAuth client secret | `storage.config.json` | Never |
| OAuth refresh/access tokens | `.storage-token.json` | Never |
| Visitor analytics | — | None |
| Cookies | — | None |
| Contact form submissions | — | No form exists |
