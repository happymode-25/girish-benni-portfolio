# Customization guide

All content lives in the `SITE_CONFIG` object at the top of
[`../script.js`](../script.js). Everything below the divider line in that file is
rendering logic; you should not need to touch it for normal edits.

After each edit:

1. Reload the page (`npm run dev`, then <http://localhost:5173>).
2. Open `?dev=1` and review the checklist.
3. Run `npm run check` before publishing.

**Do not invent content to fill a field.** Empty fields hide themselves. If a
project is not finished, leave `placeholder: true` and say what state it is in.
That is more credible than a polished claim you cannot support.

---

## 1. Page metadata

```js
meta: {
  title: 'Girish Benni — portfolio',
  description: 'One clear sentence about the work on this site.',
  baseUrl: '', // filled by the build, or set manually before publishing
}
```

- `title` is used in the tab, Open Graph and Twitter tags.
- `description` should be roughly 120–160 characters.
- `baseUrl` is the public origin, such as `https://girishbenni.com` or
  `https://user.github.io/repo` — no trailing slash. `npm run build -- --base-url ...`
  sets it in the built copy. Leave it empty in the source.

Static fallback tags also exist in `index.html` so the page has metadata before
JavaScript runs. If you change the title or description permanently, update both
places (or let the build inject the absolute URLs).

---

## 2. Identity and hero

```js
identity: {
  name: 'Girish Benni',
  firstName: 'Girish',
  lastName: 'Benni',
  initials: 'GB',
  eyebrow: 'Portfolio — selected work and notes',
  headline: 'I build small, tested things — then write down what broke.',
  intro: 'Two or three sentences. Concrete beats impressive.',
  role: 'Developer · security learner · writer',
  location: '',              // blank shows "Not listed"
  focus: 'Software · security · AI',
  status: 'Portfolio in progress',
  profileImage: '',          // local path, Drive id, or OneDrive share URL
}
```

`profileImage` is optional; when empty the page shows a designed monogram card
instead of a stock photo.

---

## 3. About

```js
about: {
  intro: 'A short first-person line.',
  lede: 'The paragraph that explains what this site is.',
  paragraphs: [
    'A paragraph about how you work.',
    'A paragraph about what you are learning or building next.',
  ],
  note: 'A pull quote or principle.',
  currently: [
    'One thing you are actually doing now',
    'Another current thread',
  ],
}
```

- `currently` is optional. An empty array hides the list.
- Keep paragraphs factual. No years-of-experience claims, proficiency bars or
  invented certifications.

---

## 4. Social links

```js
socials: {
  github: 'https://github.com/your-handle',
  linkedin: 'https://www.linkedin.com/in/your-handle',
  youtube: '',
  twitter: '',
  instagram: '',
}
```

- Empty values are not rendered anywhere.
- Links must start with `https://` (or `http://`) to be accepted.
- The hero shows the first available links, and the contact section shows the
  full set.
- Set `github.username` as well if you want the GitHub section to build a profile
  URL automatically.

---

## 5. Contact

```js
contact: {
  email: 'you@example.com',
  intro: 'The quickest way to reach me is email.',
  note: 'Email is the best route. There is no form here.',
  methods: [
    // { label: 'Signal', url: 'https://signal.me/#p/+...' },
  ],
}
```

- If `email` is empty or invalid, the email block shows a neutral message and no
  `mailto:` button. In dev mode it explains what to add.
- There is intentionally no contact form. A static form needs a third-party
  service and creates a data-handling obligation. `mailto:` keeps the site honest.
- `methods` renders as extra links under the email. Leave it empty to hide.

---

## 6. Projects

```js
projects: [
  {
    title: 'Project name',
    description: 'The problem, what you built, and one decision you would defend.',
    category: 'development',       // development | ai | cybersecurity | open-source
    // categories: ['development', 'open-source'], // optional multi-category
    tags: ['HTML', 'CSS', 'JavaScript'],
    image: '',                     // optional; empty uses generated artwork
    imageAlt: '',                  // defaults to the title
    art: { type: 'grid' },         // grid | terminal | orbit | signal | stack | topo
    repo: '',                      // optional URL
    demo: '',                      // optional URL
    status: 'in progress',         // optional: draft | prototype | planned | live...
    placeholder: true,             // remove/false when the entry is real
  },
]
```

- Filters are generated from the categories that actually exist, with counts.
  `category` is the primary category. `categories` lets one project appear under
  more than one filter; the first one supplies the card label.
- `art.type` controls the generated visual when no image is set:
  - `grid` — technical plotting grid
  - `terminal` — command output; add `art.lines: ['$ command', '# note']`
  - `orbit` — orbital diagram
  - `signal` — bar signal
  - `stack` — layered cards
  - `topo` — contour lines
- `art.accent` accepts a CSS color or variable, for example `var(--cyan)`.
- If `repo` and `demo` are both empty, no dead link is rendered. Dev mode shows a
  "No link configured" note.
- `status` is free text, displayed with hyphens replaced by spaces.

A terminal artwork example:

```js
art: {
  type: 'terminal',
  lines: [
    '$ npm test',
    '# paste real output, not invented findings',
    '$ git log --oneline -3',
  ],
}
```

---

## 7. Cybersecurity entries

```js
security: {
  intro: 'What kind of work this section contains.',
  ethics: 'Testing is limited to systems I own or have written permission to test.',
  entries: [
    {
      title: 'Lab name',
      category: 'Web',           // free text: Networking, Web, Defensive...
      date: '',                  // optional; blank shows the entry number
      description: 'Target, scope, method, evidence, conclusion.',
      tags: ['Burp Suite', 'HTTP'],
      writeUp: '',               // optional URL
      repo: '',                  // optional URL
      placeholder: true,
    },
  ],
}
```

Keep the ethics notice unless you have a specific reason to remove it. Do not
publish targets you were not authorised to test, live credentials, personal data
from a compromised system, or exploit code aimed at third parties.

---

## 8. AI projects

```js
ai: {
  intro: 'What you test and why.',
  entries: [
    {
      title: 'Experiment name',
      description: 'What the model did, what it got wrong, what you changed.',
      tags: ['Python', 'evaluation'],
      image: '',                // optional image (local / Drive / OneDrive)
      imageAlt: '',
      repo: '',
      demo: '',
      status: 'prototype',
      accent: 'var(--cyan)',
      placeholder: true,
    },
  ],
}
```

No benchmark numbers are implied by the template. If you add a result, say how
you measured it and on what data.

---

## 9. GitHub section

```js
github: {
  username: 'your-handle',      // without @
  profileUrl: '',               // optional override
  intro: 'Repositories I am willing to put my name on.',
  live: false,                  // mirrors features.githubLive
  liveLimit: 6,
  liveIncludeForks: false,
  repos: [
    {
      name: 'repo-name',
      description: 'What it does and what state it is in.',
      topics: ['topic'],
      url: 'https://github.com/you/repo-name',
    },
  ],
}
```

- The curated list is the default and also the fallback if the API fails.
- Set both `features.githubLive: true` and `github.username` to fetch public
  repositories. Without a token the API allows about 60 requests per hour per IP;
  the section falls back silently if that limit is hit.
- `profileUrl` is optional when `username` is set; it is derived automatically.

More: [GITHUB.md](GITHUB.md).

---

## 10. Writing

```js
writing: {
  intro: 'Technical write-ups, lab notes, and essays.',
  entries: [
    {
      title: 'Article title',
      description: 'One or two lines on what it covers.',
      category: 'Development',  // free text
      date: '',                 // free text, for example "Mar 2026"
      url: '',                  // empty renders a static, non-link row
      cover: '',                // optional image
      coverAlt: '',             // defaults to "Cover for <title>"
      status: 'draft',          // free text
      placeholder: true,
    },
  ],
}
```

- Drafts with no URL are rendered as plain text rows, not dead links.
- The writing section is separate from the optional author/book section.

---

## 11. Author identity and book promotion (off by default)

Both features are off:

```js
features: {
  showAuthorIdentity: false,
  showBookPromotion: false,
}
```

While off:

- no author section or Books navigation item is created;
- no request is made for author data;
- no author details exist in `index.html`, `style.css` or `script.js`;
- `author-data.js` is excluded from the build and from git.

To enable:

1. Copy `docs/author-data.example.js` to `author-data.js` in the project root.
2. Replace the sample values with your real pen name, bio and books.
3. Set `showAuthorIdentity: true` and/or `showBookPromotion: true`.
4. Run `npm run check`; then build **with** author data:

   ```bash
   npm run build -- --base-url https://your-site --author
   ```

The build includes `author-data.js` automatically when either flag is true, and
excludes it when both are false. `--no-author` forces exclusion.

Do not add author details to `index.html` or `script.js`. Keeping them in the
separate file is what makes the "off" state private rather than merely hidden.

Full data shape and privacy notes: [PRIVACY.md](PRIVACY.md).

---

## 12. Skills and certificates (reserved)

`features.showSkills` and `features.showCertificates` exist as reserved switches,
but the sections are **not implemented** and have no data model yet. This is
intentional: the current site must not show empty skill or certificate cards.

If you add them later:

- create a real data array in `SITE_CONFIG`;
- render the section only when the flag is on **and** there is content;
- add the nav item only when the section exists;
- never show proficiency percentages or certificates you do not hold.

---

## 13. Images and media

Every image field uses the same helper:

```js
'assets/images/project.png'          // local file, recommended
'drive:1AbCdEfGhIjKlMnOpQrStUv'      // Google Drive file id
'https://drive.google.com/file/d/.../view'
'https://1drv.ms/i/s!AbCdEf...'       // OneDrive share link
'https://cdn.example.com/image.jpg'  // any public https URL
```

- Local files are the most reliable and keep the page fast. Put them in
  `assets/images/`.
- Google Drive files are converted to a `lh3.googleusercontent.com` preview URL.
  The file must be shared so anyone with the link can view it.
- OneDrive share links are converted to the anonymous content endpoint. The link
  must allow viewing without sign-in.
- A missing local image does not break the page, but it does render a broken
  image icon. Check every path.
- No image is downloaded at build time; the browser requests it at runtime.

Storage studio: [STORAGE.md](STORAGE.md).

---

## 14. Theme

The palette and spacing tokens are at the top of `style.css`:

```css
:root {
  --bg: #0a0b0a;
  --ink: #eceee6;
  --accent: #c9f24f;
  --faint: #7b8375;
  /* ... */
}
```

Changing `--accent` changes the green highlights. Keep contrast in mind: the
`--faint` value was chosen so small metadata text stays readable. If you replace
it with something darker, re-check contrast.

Typography uses system stacks (serif, sans, mono). There are no webfont requests.
You can swap the stacks in `:root`, but test the result on Windows, macOS and
Android; serif rendering varies.

---

## 15. Navigation and optional sections

- Navigation is static for the required sections (Home through Contact).
- The optional Books/author section inserts its own nav item only after it
  renders successfully.
- Section numbers are recalculated at runtime, so adding the author section does
  not leave a gap.
- If you remove a section from `index.html`, also remove its nav item and its
  `data-nav` references; the page does not generate those automatically.

---

## 16. Dev checklist

Open `?dev=1` on localhost, or use the dev panel that appears automatically in
local development. It reports:

- missing identity/headline;
- missing GitHub, LinkedIn and email;
- placeholder projects, labs and writing;
- GitHub entries without URLs;
- whether the canonical base URL is set;
- author data state (optional).

The panel is never shown to production visitors unless `features.devMode` is
explicitly set to `true`. Do not enable that on a live site.

---

## 17. Before you publish

Follow [CHECKLIST.md](CHECKLIST.md). The short version:

```bash
npm run check
npm run build -- --base-url https://your-site
npm run check
```

Then test the built site on a phone, click every link, and confirm the author
section is either fully correct or fully absent.
