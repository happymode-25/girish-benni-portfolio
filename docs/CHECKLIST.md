# Pre-publication checklist

Work through this before the first publish and again after any substantial
change. It is deliberately repetitive: the failures that matter are usually the
boring ones.

---

## 1. Content is true

- [ ] Every project, lab, AI experiment and article is real, or still marked
      `placeholder: true`.
- [ ] No invented statistics, user counts, revenue, performance numbers or
      "trusted by" claims.
- [ ] No invented certifications, awards, employers, job titles or years of
      experience.
- [ ] No skills list, proficiency bars or certificate cards are shown.
- [ ] Links point to pages that exist and that you are happy for an employer or
      stranger to open.
- [ ] Descriptions say what **you** did and what the outcome was; they do not
      take credit for a team's work.
- [ ] Dates, if shown, are accurate.
- [ ] Security write-ups describe only systems you own or had written permission
      to test.
- [ ] No live credentials, tokens, private IPs, personal data or third-party
      vulnerabilities appear in screenshots, logs or text.
- [ ] Screenshots are yours, or you have permission and credit them.
- [ ] The ethics notice in the security section is present and accurate.

Search the source for leftovers:

```bash
npm run check
```

The check reports placeholder counts and linkless GitHub entries. It cannot judge
whether the prose is true — that part is yours.

---

## 2. Identity, contact and links

- [ ] `identity.name`, `headline` and `intro` are final.
- [ ] `about` paragraphs describe you, not a generic developer.
- [ ] `location` is either correct or intentionally blank.
- [ ] `socials.github` and `socials.linkedin` point to your profiles.
- [ ] YouTube / X / Instagram are either correct or empty (not dead placeholders).
- [ ] `contact.email` is an address you actually monitor.
- [ ] Clicking the email opens a mail app; "Copy address" copies the right value.
- [ ] `meta.title` and `meta.description` read well on their own.
- [ ] `meta.baseUrl` is the final public URL (or the build supplies it).

---

## 3. Author identity and books are private until enabled

- [ ] Both `showAuthorIdentity` and `showBookPromotion` are `false` **unless** you
      intend to publish that identity.
- [ ] With both off, there is no author section, no "Books" nav item and no
      request for `author-data.js`.
- [ ] `author-data.js` does not exist, or is excluded from the build.
- [ ] If the author section is enabled, the pen name, bio, book titles, covers,
      purchase links and publisher links are all real and correct.
- [ ] The author section looks intentional on mobile, not like a bolted-on store.
- [ ] If you turned the feature off again, rebuild — do not just flip the flag in
      a deployed copy that still contains `author-data.js`.

Verify the built output:

```bash
npm run build -- --base-url https://your-site
node scripts/check.mjs
```

The check fails if `author-data.js` is in `dist/` while both author flags are off.

---

## 4. Build and leak check

- [ ] `npm run check` reports 0 errors.
- [ ] `npm run build -- --base-url ...` completes.
- [ ] `dist/` contains `index.html`, `style.css`, `script.js`, `404.html`,
      `assets/`, `.nojekyll`, `robots.txt`, `sitemap.xml`.
- [ ] `dist/` does **not** contain `studio.html`, `tools/`, `scripts/`, `docs/`,
      `package.json`, `storage.config.json`, `.storage-token.json`, `.env`, or
      `author-data.js` while author features are off.
- [ ] No `C:\Users\...` paths, OAuth secrets or refresh tokens appear in the
      built files.
- [ ] `dist/index.html` has a canonical link and an absolute `og:image`.
- [ ] `dist/robots.txt` points at the correct sitemap URL.
- [ ] `dist/CNAME` exists only if you are using a custom domain on GitHub Pages.
- [ ] `.nojekyll` is present when deploying to GitHub Pages.

Preview the build itself, not only the source:

```bash
node tools/dev-server.mjs --dir dist --port 5174
```

---

## 5. Functionality

- [ ] Page loads with no console errors.
- [ ] Project filters work; counts match the cards; empty state does not flash
      incorrectly.
- [ ] Alternate project alignment stays correct after filtering.
- [ ] All in-page nav links scroll to the right section.
- [ ] Active section highlighting follows the page as you scroll.
- [ ] Mobile menu opens, closes, traps focus sensibly, and returns focus to the
      toggle.
- [ ] Escape closes the mobile menu.
- [ ] Copy-email button works and gives feedback.
- [ ] External links open in a new tab and use `rel="noopener noreferrer"`.
- [ ] Empty social/contact/repo fields are hidden, not rendered as dead links.
- [ ] Footer year is current.
- [ ] 404 page loads and its "Back to the portfolio" link works on the deployed
      host.

---

## 6. Responsive layout

Test at approximately:

- [ ] 1440 px desktop
- [ ] 1024 px small laptop
- [ ] 768 px tablet
- [ ] 390 px phone
- [ ] 320 px narrow phone

At each width:

- [ ] No horizontal scrollbar.
- [ ] No text clipped by a card or button.
- [ ] Long project titles and tags wrap.
- [ ] Writing covers and AI images keep their aspect ratio.
- [ ] Nav/menu does not overlap the hero.
- [ ] Buttons are large enough to tap.
- [ ] The page is readable at 200% browser zoom.

---

## 7. Accessibility

- [ ] Tab through the entire page: every interactive element is reachable.
- [ ] Focus is always visible; focus never disappears into the background.
- [ ] Skip link appears on first Tab and jumps to `<main>`.
- [ ] Headings descend in a sensible order; there is one `h1`.
- [ ] Every image has meaningful alt text, or empty alt if decorative.
- [ ] Placeholder badges and statuses are not conveyed by colour alone.
- [ ] Text contrast is comfortable, including `--faint` metadata.
- [ ] `prefers-reduced-motion: reduce` removes reveal/scroll animation.
- [ ] With JavaScript disabled, the core text is still readable and nav links
      still jump to sections. (Dynamic project cards require JS.)
- [ ] The mobile menu is operable with a keyboard only.
- [ ] No autoplaying audio or video.

---

## 8. Metadata and sharing

- [ ] `<title>` and meta description are correct in `dist/index.html`.
- [ ] Canonical URL matches the deployed URL exactly (including project subpath).
- [ ] `og:image` is absolute and returns 200 when opened directly.
- [ ] `og:image` is at least 1200×630 and not distorted.
- [ ] Paste the URL into a social preview debugger; the title, description and
      image are correct.
- [ ] `favicon.svg` is visible in the browser tab.
- [ ] `sitemap.xml` is valid XML and lists the live URL.
- [ ] `robots.txt` does not block the site.
- [ ] The 404 page sends a real 404 status on the host (GitHub Pages does this).

---

## 9. Privacy and data

- [ ] No analytics, tracking pixels or third-party embeds were added without
      updating the privacy note.
- [ ] No cookies are set.
- [ ] No contact form collects data.
- [ ] `storage.config.json` and `.storage-token.json` are not committed.
- [ ] `.gitignore` still excludes local secrets, tokens, `author-data.js` and
      `dist/`.
- [ ] The local studio is never deployed.
- [ ] If you embed Google Drive or OneDrive images, you understand that visitors'
      browsers request them from those providers.

More: [PRIVACY.md](PRIVACY.md).

---

## 10. Hosting and domain

- [ ] The host is serving `dist/`, not the project root.
- [ ] HTTPS is enabled and the certificate is valid.
- [ ] `www` and apex resolve consistently (or one redirects to the other).
- [ ] If using a custom domain, DNS records match the host's instructions.
- [ ] `--base-url` uses the final domain, not a temporary host.
- [ ] After changing the URL, rebuild and re-check canonical/OG tags.
- [ ] The GitHub Actions workflow (if used) completed successfully.
- [ ] The site works with a hard refresh and in a private window.

Setup details: [SETUP.md](SETUP.md).

---

## 11. Final pass

- [ ] Open the live site on a real phone, not only a resized browser.
- [ ] Send yourself the link in a message and open it from there.
- [ ] Read the whole page once, slowly, for typos and claims you no longer want.
- [ ] Remove or replace every placeholder badge.
- [ ] Remove the dev panel from production (`features.devMode` false).
- [ ] Confirm the email address is current.
- [ ] Tag the published commit or note the date.
- [ ] Keep a copy of the source outside the deployed environment.

---

## Quick command sequence

```bash
# 1. check the source
npm run check

# 2. build for the real URL
npm run build -- --base-url https://your-domain.com

# 3. check the build, including leak checks
npm run check

# 4. preview the built output
node tools/dev-server.mjs --dir dist --port 5174

# 5. deploy dist/ (or push and let GitHub Actions deploy it)
```

If you use a custom domain on GitHub Pages, add `--cname your-domain.com` to the
build command, or set the `SITE_CNAME` Actions variable.
