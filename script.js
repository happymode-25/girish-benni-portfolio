'use strict';

/* ==========================================================================
   GIRISH BENNI — PORTFOLIO
   --------------------------------------------------------------------------
   This is the only file you need to edit for content. Everything below the
   divider is rendering logic; everything above it is yours.

   Empty values are handled gracefully:
     • an empty social URL is never rendered
     • an empty email hides the mail button (and shows a setup note in dev)
     • a missing image falls back to generated artwork
     • a missing repository / article URL is rendered as plain text, not a link

   Development mode
   ----------------
   Add ?dev=1 to the URL (or open the site from localhost / file://) to see a
   pre-publication checklist and setup notes. Production visitors never see it.

   Media from Google Drive or OneDrive
   -----------------------------------
   Any image field accepts either a normal path, a Google Drive file id, or a
   Drive / OneDrive share link:
     "assets/images/shot.png"
     "drive:1AbCdEfGhIjKlMnOpQrStUv"
     "https://drive.google.com/file/d/1AbCd.../view"
     "https://1drv.ms/i/s!AbCdEf..."
   The helpers below turn those into embeddable URLs. See docs/STORAGE.md.
   ========================================================================== */

const SITE_CONFIG = {
  /* ----- Page metadata ---------------------------------------------------- */
  meta: {
    title: 'Girish Benni — portfolio',
    description:
      'Girish Benni — a working portfolio of software projects, security labs, AI experiments, open-source work, and writing.',
    // Optional. Set this (or use `node scripts/build.mjs --base-url ...`) before
    // publishing so social preview URLs resolve absolutely.
    baseUrl: '',
  },

  /* ----- Identity --------------------------------------------------------- */
  identity: {
    name: 'Girish Benni',
    firstName: 'Girish',
    lastName: 'Benni',
    initials: 'GB',
    eyebrow: 'Portfolio — selected work and notes',
    headline: 'I build small, tested things — then write down what broke.',
    intro:
      'Software, security labs run in environments I control, AI experiments, and the notes that come out of them. Some of this is finished. Some of it is a draft. Both are labelled.',
    role: 'Developer · security learner · writer',
    location: '', // e.g. "Bengaluru, India" — leave blank to show "Not listed"
    focus: 'Software · security · AI',
    status: 'Portfolio in progress',
    profileImage: '', // optional; empty shows the monogram index card
  },

  /* ----- About ------------------------------------------------------------ */
  about: {
    intro:
      'I would rather show the thing, the notes, and the rough edge than describe a version of myself that does not exist yet.',
    lede:
      'This site collects what I am actually working on: code, security labs run in isolated environments, AI experiments, and the writing that comes out of them.',
    paragraphs: [
      'Nothing here is a metric for its own sake. There are no follower counts, no invented certifications, and no statistics I cannot point at. When a project is a placeholder, it says so.',
      'I am interested in how systems fail — badly written parsers, over-permissioned APIs, models that sound confident and are not — and in building the smaller, clearer version that does not.',
    ],
    note: 'I would rather publish a small true thing than a large plausible one.',
    // Optional. Each entry becomes a line under "Currently". Leave empty to hide.
    currently: [],
    // currently: [
    //   'Rebuilding this portfolio as a static site',
    //   'Working through API authentication labs in a local VM',
    // ],
  },

  /* ----- Links ------------------------------------------------------------ */
  socials: {
    github: '', // e.g. https://github.com/your-handle
    linkedin: '',
    youtube: '',
    twitter: '', // X
    instagram: '',
  },

  contact: {
    email: '', // e.g. you@example.com — never invent one
    intro:
      'The quickest way to reach me is email. If a link is not listed here, it is not configured — nothing is hidden behind a fake form.',
    note: 'Email is the best route. There is no form here — just a working mail link.',
    // Extra contact methods. Only rendered when a URL is present.
    methods: [
      // { label: 'Signal', url: 'https://signal.me/#p/+...' },
    ],
  },

  /* ----- Feature switches -------------------------------------------------- */
  features: {
    // Author identity and book promotion are OFF by default. While they are
    // off, no author data exists in the deployed files. See docs/PRIVACY.md.
    showAuthorIdentity: false,
    showBookPromotion: false,

    // Reserved for later. When false the section stays out of the DOM.
    showCertificates: false,
    showSkills: false,

    // Optional GitHub API enhancement. Off by default: rate limited to 60
    // requests/hour per IP without a token, and the curated list below is used
    // as a fallback. See docs/GITHUB.md.
    githubLive: false,

    // Show the "placeholder" chip on template projects, labs and articles.
    // Keep this on until the real content is in.
    showPlaceholderBadges: true,

    // Show the authorised-testing notice in the security section.
    showEthicsNotice: true,

    // Force dev mode even on a production host (not recommended).
    devMode: false,
  },

  /* ----- Projects ---------------------------------------------------------- */
  projectsIntro:
    'Selected builds, with the repository or a live link where one exists. Filter by the kind of work, not by a logo wall.',
  // `category` is one of: development | ai | cybersecurity | open-source
  // `art.type` is one of: grid | terminal | orbit | signal | stack | topo
  // Omit `image` to use the generated artwork.
  projects: [
    {
      title: 'Project One',
      description:
        'Replace this with a build you can point at: the problem, what you made, and the one decision you would defend in a review.',
      category: 'development',
      tags: ['HTML', 'CSS', 'JavaScript'],
      image: '',
      imageAlt: '',
      art: { type: 'grid' },
      repo: '',
      demo: '',
      status: 'in progress',
      placeholder: true,
    },
    {
      title: 'Lab Notebook',
      description:
        'A place for lab notes: the target, the commands, the evidence, and what you concluded. Add your own write-up link when it exists.',
      category: 'cybersecurity',
      tags: ['Linux', 'Networking'],
      image: '',
      imageAlt: '',
      art: {
        type: 'terminal',
        lines: [
          '$ nmap -sV lab.local',
          '# replace with the commands you actually ran',
          '$ grep -i finding report.txt',
          'no findings yet — lab not run',
        ],
      },
      repo: '',
      demo: '',
      status: 'draft',
      placeholder: true,
    },
    {
      title: 'Model Playground',
      description:
        'A small harness for testing prompts and model behaviour. Describe what you tested, what failed, and what you would keep.',
      category: 'ai',
      tags: ['Python', 'LLM'],
      image: '',
      imageAlt: '',
      art: { type: 'orbit', accent: 'var(--cyan)' },
      repo: '',
      demo: '',
      status: 'prototype',
      placeholder: true,
    },
    {
      title: 'Open Source Scratchpad',
      description:
        'Notes, patches, and documentation from work on other people’s repositories. Link the pull requests you are proud of.',
      category: 'open-source',
      tags: ['Git', 'Docs'],
      image: '',
      imageAlt: '',
      art: { type: 'stack', accent: 'var(--violet)' },
      repo: '',
      demo: '',
      status: 'planned',
      placeholder: true,
    },
  ],

  /* ----- Cybersecurity ----------------------------------------------------- */
  security: {
    intro:
      'Hands-on work in networks, Linux, web and API security. Everything here was run in an environment I control, or one I was explicitly authorised to test.',
    ethics:
      'Security testing belongs on systems you own or have written permission to test. Nothing in these notes is an invitation to point a tool at someone else’s infrastructure.',
    entries: [
      {
        title: 'Networking lab',
        category: 'Networking',
        date: '',
        description:
          'Packet capture, service discovery, and a short write-up of what the traffic showed. Replace this with the target, the scope, and the evidence.',
        tags: ['tcpdump', 'nmap'],
        writeUp: '',
        repo: '',
        placeholder: true,
      },
      {
        title: 'Web security lab',
        category: 'Web',
        date: '',
        description:
          'Authentication, access control, and input handling tested in a local, intentionally vulnerable application. Add the findings you are comfortable publishing.',
        tags: ['Burp Suite', 'HTTP'],
        writeUp: '',
        repo: '',
        placeholder: true,
      },
      {
        title: 'Log analysis exercise',
        category: 'Defensive',
        date: '',
        description:
          'Reading a synthetic log set, separating noise from signal, and writing the timeline. Replace the description with your own process.',
        tags: ['Linux', 'logs'],
        writeUp: '',
        repo: '',
        placeholder: true,
      },
    ],
  },

  /* ----- AI projects ------------------------------------------------------- */
  ai: {
    intro:
      'Small AI tools and tests: what the model did, what it got wrong, and what I would change. No benchmarks unless I ran them.',
    entries: [
      {
        title: 'Prompt test harness',
        description:
          'A repeatable way to compare prompts against a small set of cases. Describe the cases you chose and why.',
        tags: ['Python', 'evaluation'],
        repo: '',
        demo: '',
        status: 'prototype',
        accent: 'var(--cyan)',
        placeholder: true,
      },
      {
        title: 'Retrieval experiment',
        description:
          'Chunking, embeddings, and the failure cases that only appear once the corpus is real. Add what you measured.',
        tags: ['RAG', 'embeddings'],
        repo: '',
        demo: '',
        status: 'draft',
        accent: 'var(--violet)',
        placeholder: true,
      },
      {
        title: 'Agent workflow',
        description:
          'A narrow agent that does one job with a human check before anything irreversible happens. Describe the guardrails.',
        tags: ['agents', 'tooling'],
        repo: '',
        demo: '',
        status: 'planned',
        accent: 'var(--accent)',
        placeholder: true,
      },
    ],
  },

  /* ----- GitHub ------------------------------------------------------------ */
  github: {
    username: '', // without @
    profileUrl: '', // optional; derived from username when empty
    intro:
      'Repositories I am willing to put my name on — including the unfinished ones.',
    live: false, // mirrors features.githubLive; kept here for convenience
    liveLimit: 6,
    liveIncludeForks: false,
    repos: [
      {
        name: 'your-project-name',
        description:
          'A one-line description of what it does and why it exists.',
        topics: ['replace', 'me'],
        url: '',
      },
      {
        name: 'another-repository',
        description:
          'What it is, what state it is in, and what you learned building it.',
        topics: ['notes'],
        url: '',
      },
      {
        name: 'docs-or-experiments',
        description:
          'A repository for documentation, experiments, or small tools.',
        topics: [],
        url: '',
      },
    ],
  },

  /* ----- Writing ----------------------------------------------------------- */
  writing: {
    intro:
      'Technical write-ups, lab notes, and essays. Drafts are marked as drafts; they are not links until they are published somewhere.',
    entries: [
      {
        title: 'Notes on building a small static site',
        description:
          'What I kept, what I removed, and why the page has almost no dependencies.',
        category: 'Development',
        date: '',
        url: '',
        cover: '',
        status: 'draft',
        placeholder: true,
      },
      {
        title: 'A lab notebook for API authentication tests',
        description:
          'A repeatable checklist for testing authentication in an application you are allowed to test.',
        category: 'Security',
        date: '',
        url: '',
        cover: '',
        status: 'draft',
        placeholder: true,
      },
      {
        title: 'What I learned from a failed experiment',
        description:
          'The version that did not work, the assumption that caused it, and the smaller thing built afterwards.',
        category: 'Notes',
        date: '',
        url: '',
        cover: '',
        status: 'draft',
        placeholder: true,
      },
    ],
  },

  /* ----- Author / books (only read when a feature switch is on) ------------ */
  author: {
    // The actual data is loaded from this file. If it does not exist, nothing
    // is rendered and no request is made while the features are off.
    dataFile: 'author-data.js',
    // Fallbacks when AUTHOR_DATA does not specify them.
    sectionTitle: 'Selected books.',
    intro:
      'Fiction and other writing, kept on a separate shelf from the technical work.',
  },
};

/* ==========================================================================
   END OF CONTENT CONFIG. Rendering logic starts here.
   ========================================================================== */

window.SITE_CONFIG = SITE_CONFIG;

const CATEGORY_LABELS = {
  development: 'Development',
  ai: 'AI',
  cybersecurity: 'Cybersecurity',
  'open-source': 'Open source',
};

const ICONS = {
  github:
    '<svg class="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.73.5.9 5.33.9 11.6c0 4.9 3.17 9.06 7.57 10.53.55.1.75-.24.75-.53v-1.85c-3.08.67-3.73-1.49-3.73-1.49-.5-1.28-1.23-1.62-1.23-1.62-1-.69.08-.68.08-.68 1.11.08 1.7 1.14 1.7 1.14.99 1.69 2.59 1.2 3.22.92.1-.72.39-1.2.7-1.48-2.46-.28-5.05-1.23-5.05-5.48 0-1.21.43-2.2 1.14-2.98-.11-.28-.49-1.41.11-2.94 0 0 .93-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.12-1.44 3.05-1.14 3.05-1.14.6 1.53.22 2.66.11 2.94.71.78 1.14 1.77 1.14 2.98 0 4.26-2.6 5.2-5.07 5.47.4.34.75 1.02.75 2.06v3.05c0 .3.2.64.76.53a11.1 11.1 0 0 0 7.56-10.53C23.1 5.33 18.27.5 12 .5z"/></svg>',
  linkedin:
    '<svg class="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3V9zm6.5 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.3-.02-2.97-1.81-2.97-1.82 0-2.1 1.42-2.1 2.88V21h-4V9z"/></svg>',
  youtube:
    '<svg class="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23 12s0-3.2-.4-4.7a3 3 0 0 0-2.1-2.1C18.9 4.8 12 4.8 12 4.8s-6.9 0-8.5.4a3 3 0 0 0-2.1 2.1C1 8.8 1 12 1 12s0 3.2.4 4.7a3 3 0 0 0 2.1 2.1c1.6.4 8.5.4 8.5.4s6.9 0 8.5-.4a3 3 0 0 0 2.1-2.1C23 15.2 23 12 23 12zM9.8 15.5v-7l6.1 3.5-6.1 3.5z"/></svg>',
  twitter:
    '<svg class="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 3h3.2l-7 8 8.2 10h-6.4l-5-6.1L4.7 21H1.5l7.5-8.6L1.1 3h6.6l4.5 5.6L17.5 3zm-1.1 16.1h1.8L7.3 4.8H5.4l11 14.3z"/></svg>',
  instagram:
    '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5"/><circle cx="12" cy="12" r="4.1"/><circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none"/></svg>',
  mail:
    '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="M3 6l9 7 9-7"/></svg>',
  arrow:
    '<svg class="icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12L12 4M6 4h6v6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  arrowRight:
    '<svg class="icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  copy:
    '<svg class="icon" viewBox="0 0 16 16" aria-hidden="true"><rect x="5.5" y="5.5" width="8" height="9" rx="1" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M10.5 3.5v-1h-8v9h1" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>',
  check:
    '<svg class="icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 4.8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

const SOCIAL_META = {
  github: { label: 'GitHub', icon: 'github' },
  linkedin: { label: 'LinkedIn', icon: 'linkedin' },
  youtube: { label: 'YouTube', icon: 'youtube' },
  twitter: { label: 'X', icon: 'twitter' },
  instagram: { label: 'Instagram', icon: 'instagram' },
  email: { label: 'Email', icon: 'mail' },
};

/* ----- Tiny helpers ------------------------------------------------------- */
const byId = (id) => document.getElementById(id);
const all = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (c) => ESCAPES[c]);

const reducedMotion = () =>
  window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function safeUrl(raw) {
  if (!raw) return '';
  const value = String(raw).trim();
  if (!value) return '';
  if (/^(https?:|mailto:)/i.test(value)) return value;
  if (/^(\.{0,2}\/|assets\/|#)/.test(value)) return value;
  return '';
}

function externalAttrs(url) {
  return /^https?:/i.test(url) ? ' target="_blank" rel="noopener noreferrer"' : '';
}

function isEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function humanStatus(value) {
  if (!value) return '';
  return String(value).replace(/[-_]/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}

function assetUrl(raw) {
  const value = safeUrl(raw);
  if (!value) return '';

  // "drive:<fileId>"
  if (value.startsWith('drive:')) {
    return `https://lh3.googleusercontent.com/d/${encodeURIComponent(value.slice(6).trim())}=w1600`;
  }

  // Google Drive file links → direct image host
  const drive = value.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=download&)?id=)([\w-]{10,})/);
  if (drive) return `https://lh3.googleusercontent.com/d/${drive[1]}=w1600`;

  // OneDrive / SharePoint share links → anonymous content endpoint
  if (/^https:\/\/(1drv\.ms|onedrive\.live\.com|.*\.sharepoint\.com)\//i.test(value)) {
    const b64 = btoa(unescape(encodeURIComponent(value)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return `https://api.onedrive.com/v1.0/shares/u!${b64}/root/content`;
  }

  return value;
}

function devMode() {
  if (SITE_CONFIG.features.devMode) return true;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.has('dev')) return true;
  } catch (err) {
    /* no URL API — ignore */
  }
  return /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname) ||
    window.location.protocol === 'file:';
}

let IS_DEV = false;

/* ----- Bind simple text --------------------------------------------------- */
function applyBindings() {
  const id = SITE_CONFIG.identity;
  const contact = SITE_CONFIG.contact;

  const map = {
    name: id.name,
    firstName: id.firstName,
    lastName: id.lastName,
    eyebrow: id.eyebrow,
    headline: id.headline,
    intro: id.intro,
    role: id.role,
    location: id.location,
    focus: id.focus,
    status: id.status,
    aboutIntro: SITE_CONFIG.about.intro,
    aboutLede: SITE_CONFIG.about.lede,
    projectsIntro: SITE_CONFIG.projectsIntro,
    securityIntro: SITE_CONFIG.security.intro,
    aiIntro: SITE_CONFIG.ai.intro,
    githubIntro: SITE_CONFIG.github.intro,
    writingIntro: SITE_CONFIG.writing.intro,
    contactIntro: contact.intro,
    contactNote: contact.note,
  };

  all('[data-bind]').forEach((el) => {
    const key = el.dataset.bind;
    const value = map[key];
    if (typeof value === 'string' && value.trim() !== '') {
      el.textContent = value;
    }
  });

  // Hide empty optional lines instead of leaving blanks.
  if (!contact.note) {
    const note = document.querySelector('.contact__note');
    if (note) note.hidden = true;
  }
}

function applyMeta() {
  const meta = SITE_CONFIG.meta || {};
  const id = SITE_CONFIG.identity;

  if (meta.title) {
    document.title = meta.title;
    setMetaTag('property', 'og:title', meta.title);
    setMetaTag('name', 'twitter:title', meta.title);
  }
  if (meta.description) {
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', meta.description);
    setMetaTag('property', 'og:description', meta.description);
    setMetaTag('name', 'twitter:description', meta.description);
  }
  setMetaTag('property', 'og:site_name', id.name);

  if (meta.baseUrl) {
    const base = meta.baseUrl.replace(/\/+$/, '');

    // Reuse a canonical link injected by scripts/build.mjs instead of appending
    // a second one, which would give search engines two conflicting signals.
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = base + '/';

    // Only resolve the OG image when it is still a relative path. A build that
    // already wrote an absolute URL must not get the base prefixed twice.
    const ogImage = document.querySelector('meta[property="og:image"]');
    const ogImageContent = ogImage ? ogImage.getAttribute('content') || '' : '';
    if (ogImage && ogImageContent && !/^https?:\/\//i.test(ogImageContent)) {
      ogImage.setAttribute('content', base + '/' + ogImageContent.replace(/^\/+/, ''));
    }

    setMetaTag('property', 'og:url', base + '/');
  }

  // Keep Twitter's image in sync with whatever the OG image ended up being.
  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage) setMetaTag('name', 'twitter:image', ogImage.getAttribute('content'));

  const ld = document.querySelector('script[type="application/ld+json"]');
  if (ld) {
    const sameAs = Object.entries(SITE_CONFIG.socials)
      .map(([, url]) => safeUrl(url))
      .filter(Boolean);
    try {
      const data = JSON.parse(ld.textContent);
      data.name = id.name;
      if (sameAs.length) data.sameAs = sameAs;
      ld.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
      /* leave the static JSON-LD alone */
    }
  }
}

function setMetaTag(attr, key, value) {
  if (!value) return;
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

/* ----- About -------------------------------------------------------------- */
function renderAbout() {
  const body = byId('about-body');
  if (body && SITE_CONFIG.about.paragraphs && SITE_CONFIG.about.paragraphs.length) {
    body.innerHTML =
      `<p class="about__lede">${esc(SITE_CONFIG.about.lede)}</p>` +
      SITE_CONFIG.about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('');
  }

  const list = byId('currently-list');
  const wrap = byId('currently');
  const items = SITE_CONFIG.about.currently || [];
  if (wrap) wrap.hidden = items.length === 0;
  if (list) {
    list.innerHTML = items.map((item) => `<li>${esc(item)}</li>`).join('');
  }

  if (SITE_CONFIG.about.note) {
    const aside = document.querySelector('.about__aside');
    if (aside && !document.querySelector('.about__note')) {
      const quote = document.createElement('p');
      quote.className = 'about__note';
      quote.innerHTML = `<span aria-hidden="true">“</span>${esc(SITE_CONFIG.about.note)}<span aria-hidden="true">”</span>`;
      aside.appendChild(quote);
    }
  }
}

/* ----- Social links ------------------------------------------------------- */
function socialEntries() {
  const entries = [];
  Object.entries(SITE_CONFIG.socials).forEach(([key, value]) => {
    const url = safeUrl(value);
    if (url) entries.push({ key, label: SOCIAL_META[key].label, icon: SOCIAL_META[key].icon, url });
  });
  const email = SITE_CONFIG.contact.email;
  if (isEmail(email)) {
    entries.push({ key: 'email', label: 'Email', icon: 'mail', url: `mailto:${email.trim()}` });
  }
  (SITE_CONFIG.contact.methods || []).forEach((method) => {
    const url = safeUrl(method.url);
    if (url && method.label) {
      entries.push({ key: method.label, label: method.label, icon: 'arrowRight', url });
    }
  });
  return entries;
}

function renderSocials() {
  const entries = socialEntries();
  const targets = [
    { el: byId('hero-socials'), limit: 5 },
    { el: byId('contact-links'), limit: 99 },
    { el: byId('footer-links'), limit: 99 },
  ];

  targets.forEach(({ el, limit }) => {
    if (!el) return;
    const items = entries.slice(0, limit);
    el.hidden = items.length === 0;
    el.innerHTML = items
      .map(
        (item) => `<li><a class="social-link" href="${esc(item.url)}"${externalAttrs(item.url)}>
          ${ICONS[item.icon] || ICONS.arrowRight}<span>${esc(item.label)}</span>
        </a></li>`
      )
      .join('');
  });

  const contactSide = document.querySelector('.contact__side');
  if (contactSide && entries.length === 0) {
    const label = contactSide.querySelector('.contact__label');
    if (label) label.hidden = true;
  }
}

/* ----- Hero index --------------------------------------------------------- */
function renderHeroIndex() {
  const el = byId('hero-index');
  if (!el) return;

  const sections = [
    { id: 'projects', label: 'Projects', count: SITE_CONFIG.projects.length },
    { id: 'cybersecurity', label: 'Security', count: SITE_CONFIG.security.entries.length },
    { id: 'ai', label: 'AI', count: SITE_CONFIG.ai.entries.length },
    { id: 'github', label: 'GitHub', count: SITE_CONFIG.github.repos.length },
    { id: 'writing', label: 'Writing', count: SITE_CONFIG.writing.entries.length },
    { id: 'author', label: 'Books', count: 0 },
  ];

  const authorData = window.AUTHOR_DATA;
  if (SITE_CONFIG.features.showBookPromotion && authorData && authorData.books) {
    sections[5].count = authorData.books.length;
  }

  el.innerHTML = sections
    .filter((section) => {
      if (section.id === 'author') return section.count > 0;
      const node = byId(section.id);
      return node && !node.hidden && section.count > 0;
    })
    .map(
      (section) => `<li><a href="#${section.id}">
        <span>${esc(section.label)}</span>
        <span class="count">${String(section.count).padStart(2, '0')}</span>
      </a></li>`
    )
    .join('');
}

/* ----- Section visibility & numbering ------------------------------------- */
function sectionIsConfigured(id) {
  const cfg = SITE_CONFIG;
  switch (id) {
    case 'projects':
      return cfg.projects.length > 0;
    case 'cybersecurity':
      return cfg.security.entries.length > 0;
    case 'ai':
      return cfg.ai.entries.length > 0;
    case 'github':
      return Boolean(safeUrl(cfg.github.profileUrl) || cfg.github.username || cfg.github.repos.length);
    case 'writing':
      return cfg.writing.entries.length > 0;
    case 'contact':
      return true;
    default:
      return true;
  }
}

function applySectionVisibility() {
  ['projects', 'cybersecurity', 'ai', 'github', 'writing', 'contact', 'about'].forEach((id) => {
    const visible = sectionIsConfigured(id);
    const section = byId(id);
    if (section) section.hidden = !visible;
    const link = document.querySelector(`[data-nav="${id}"]`);
    if (link && link.closest('li')) link.closest('li').hidden = !visible;
  });

  const ethics = byId('ethics-notice');
  if (ethics) ethics.hidden = !SITE_CONFIG.features.showEthicsNotice;
}

function numberSections() {
  all('[data-nav]').forEach((link) => {
    const li = link.closest('li');
    const num = link.querySelector('.nav__num');
    if (!li || li.hidden) return;
    if (num) num.textContent = '';
  });

  const visibleLinks = all('.nav__list a').filter((a) => !a.closest('li').hidden);
  visibleLinks.forEach((link, index) => {
    const num = link.querySelector('.nav__num');
    if (num) num.textContent = String(index + 1).padStart(2, '0');
    const section = byId(link.dataset.nav);
    if (section) {
      const label = section.querySelector('.s-index__num');
      if (label) label.textContent = String(index + 1).padStart(2, '0');
    }
  });
}

/* ----- Artwork ------------------------------------------------------------ */
function artMarkup(project, index) {
  const image = assetUrl(project.image);
  const label = CATEGORY_LABELS[(project.categories || [project.category])[0]] || '';
  const alt = project.imageAlt || project.title;

  if (image) {
    return `<div class="art art--image">
      <img class="project__img" src="${esc(image)}" alt="${esc(alt)}" loading="lazy" decoding="async">
      <span class="art__label">${esc(label)}</span>
      <span class="art__index">${String(index + 1).padStart(2, '0')}</span>
    </div>`;
  }

  const art = project.art || { type: 'grid' };
  const accent = art.accent || 'var(--accent)';
  let shape = '<span class="art__shape"></span>';

  if (art.type === 'terminal') {
    const lines = (art.lines || ['$ # add your own command output']).map((line) => {
      const text = esc(line);
      if (text.startsWith('$ ')) return `<span class="p">$</span> ${text.slice(2)}`;
      if (text.startsWith('# ')) return `<span class="c">${text}</span>`;
      return text;
    });
    shape = `<pre class="art__term">${lines.join('\n')}</pre>`;
  } else if (art.type === 'signal') {
    const bars = [22, 44, 31, 68, 51, 84, 37, 59, 92, 46, 28, 73, 55, 39, 88, 61, 34, 76, 48, 66, 30, 58, 81, 42, 70, 36, 54, 90];
    shape = `<span class="art__shape">${bars
      .map((height) => `<i style="height:${height}%"></i>`)
      .join('')}</span>`;
  } else if (art.type === 'stack') {
    shape = '<span class="art__shape"><i></i><i></i><i></i></span>';
  }

  return `<div class="art art--${esc(art.type || 'grid')}" style="--accent:${accent}">
    <span class="art__glow"></span>
    <span class="art__grid"></span>
    ${shape}
    <span class="art__index">${String(index + 1).padStart(2, '0')}</span>
    <span class="art__label">${esc(label)}</span>
    <span class="art__corner"></span>
  </div>`;
}

/* ----- Projects ----------------------------------------------------------- */
function renderProjects() {
  const list = byId('project-list');
  if (!list) return;

  if (!SITE_CONFIG.projects.length) {
    list.innerHTML = '';
    const empty = byId('projects-empty');
    if (empty) {
      empty.hidden = false;
      empty.textContent = 'No projects configured yet. Add one in script.js → projects.';
    }
    return;
  }

  list.innerHTML = SITE_CONFIG.projects
    .map((project, index) => {
      const categories = project.categories || [project.category];
      const label = CATEGORY_LABELS[categories[0]] || categories[0] || '';
      const links = [];

      const repo = safeUrl(project.repo);
      const demo = safeUrl(project.demo);
      if (repo) links.push(linkArrow('Repository', repo, 'github'));
      if (demo) links.push(linkArrow('Live / demo', demo, 'arrow'));
      if (!repo && !demo && IS_DEV) {
        links.push('<span class="project__nolink">No link configured</span>');
      }

      const showPlaceholder = SITE_CONFIG.features.showPlaceholderBadges && project.placeholder;

      return `<article class="project" data-categories="${esc(categories.join(' '))}">
        <div class="project__media">${artMarkup(project, index)}</div>
        <div class="project__body">
          <p class="project__meta">
            <span class="tag">${esc(label)}</span>
            ${project.status ? `<span class="project__status" data-status="${esc(project.status)}">${esc(humanStatus(project.status))}</span>` : ''}
            ${showPlaceholder ? '<span class="placeholder-badge">Placeholder</span>' : ''}
          </p>
          <h3 class="project__title">${esc(project.title)}</h3>
          <p class="project__desc">${esc(project.description)}</p>
          ${
            project.tags && project.tags.length
              ? `<ul class="project__tags">${project.tags.map((tag) => `<li class="tag">${esc(tag)}</li>`).join('')}</ul>`
              : ''
          }
          ${links.length ? `<div class="project__links">${links.join('')}</div>` : ''}
        </div>
      </article>`;
    })
    .join('');

  initFilters();
  markAltProjects();
}

function linkArrow(label, url, icon) {
  const safe = safeUrl(url);
  if (!safe) return '';
  return `<a class="link-arrow" href="${esc(safe)}"${externalAttrs(safe)}>
    ${ICONS[icon] || ICONS.arrowRight}<span>${esc(label)}</span>
    <span class="sr-only"> (opens in a new tab)</span>
  </a>`;
}

function markAltProjects() {
  all('.project', byId('project-list')).forEach((card, index) => {
    card.classList.toggle('is-alt', index % 2 === 1);
  });
}

function initFilters() {
  const container = byId('project-filters');
  const status = byId('filter-status');
  const empty = byId('projects-empty');
  if (!container) return;

  const projects = SITE_CONFIG.projects;
  const counts = { all: projects.length };
  projects.forEach((project) => {
    (project.categories || [project.category]).forEach((category) => {
      counts[category] = (counts[category] || 0) + 1;
    });
  });

  const order = ['all', 'development', 'ai', 'cybersecurity', 'open-source'];
  const available = order.filter((category) => counts[category]);

  container.innerHTML = available
    .map((category) => {
      const label = category === 'all' ? 'All projects' : CATEGORY_LABELS[category] || category;
      const count = counts[category];
      return `<button class="filter" type="button" data-filter="${esc(category)}" aria-pressed="${category === 'all'}" aria-label="${esc(label)}, ${count} ${count === 1 ? 'project' : 'projects'}">
        <span>${esc(label)}</span><span class="filter__count" aria-hidden="true">${String(count).padStart(2, '0')}</span>
      </button>`;
    })
    .join('');

  const apply = (category) => {
    let shown = 0;
    all('.project', byId('project-list')).forEach((card, index) => {
      const categories = (card.dataset.categories || '').split(' ');
      const match = category === 'all' || categories.includes(category);
      card.classList.toggle('is-hidden', !match);
      if (match) {
        card.classList.toggle('is-alt', shown % 2 === 1);
        shown += 1;
      }
    });

    all('.filter', container).forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.filter === category));
    });

    if (empty) empty.hidden = shown !== 0;
    if (status) {
      const label = category === 'all' ? 'all categories' : CATEGORY_LABELS[category] || category;
      status.textContent = `${shown} ${shown === 1 ? 'project' : 'projects'} · ${label}`;
    }
  };

  container.addEventListener('click', (event) => {
    const button = event.target.closest('.filter');
    if (!button) return;
    apply(button.dataset.filter);
  });

  apply('all');
}

/* ----- Security ----------------------------------------------------------- */
function renderSecurity() {
  const list = byId('security-list');
  if (!list) return;

  const entries = SITE_CONFIG.security.entries || [];
  const count = byId('security-count');
  if (count) {
    count.textContent = entries.length
      ? `${String(entries.length).padStart(2, '0')} entries · local labs & authorised targets`
      : 'No entries configured';
  }

  const ethicsText = document.querySelector('.ethics__text');
  if (ethicsText && SITE_CONFIG.security.ethics) ethicsText.textContent = SITE_CONFIG.security.ethics;

  list.innerHTML = entries
    .map((entry, index) => {
      const links = [];
      const writeUp = safeUrl(entry.writeUp);
      const repo = safeUrl(entry.repo);
      if (writeUp) links.push(linkArrow('Write-up', writeUp, 'arrow'));
      if (repo) links.push(linkArrow('Repository', repo, 'github'));
      const showPlaceholder = SITE_CONFIG.features.showPlaceholderBadges && entry.placeholder;

      return `<li class="lab">
        <div class="lab__meta">
          <span>${entry.date ? esc(entry.date) : String(index + 1).padStart(2, '0')}</span>
          <span class="lab__cat">${esc(entry.category || 'Lab')}</span>
        </div>
        <div class="lab__main">
          <h3 class="lab__title">${esc(entry.title)}</h3>
          <p class="lab__desc">${esc(entry.description)}</p>
          <ul class="lab__tags">
            ${(entry.tags || []).map((tag) => `<li class="tag">${esc(tag)}</li>`).join('')}
            ${showPlaceholder ? '<li class="placeholder-badge">Placeholder</li>' : ''}
          </ul>
        </div>
        <div class="lab__links">${links.join('')}</div>
      </li>`;
    })
    .join('');
}

/* ----- AI ----------------------------------------------------------------- */
function renderAI() {
  const grid = byId('ai-grid');
  if (!grid) return;

  const entries = SITE_CONFIG.ai.entries || [];
  grid.innerHTML = entries
    .map((entry, index) => {
      const links = [];
      const repo = safeUrl(entry.repo);
      const demo = safeUrl(entry.demo);
      const showPlaceholder = SITE_CONFIG.features.showPlaceholderBadges && entry.placeholder;
      const image = assetUrl(entry.image);
      const imageAlt = entry.imageAlt || entry.title;
      if (repo) links.push(linkArrow('Repository', repo, 'github'));
      if (demo) links.push(linkArrow('Demo', demo, 'arrow'));

      return `<article class="ai-card" style="--accent:${entry.accent || 'var(--accent)'}">
        ${image ? `<div class="ai-card__media"><img src="${esc(image)}" alt="${esc(imageAlt)}" loading="lazy" decoding="async"></div>` : ''}
        <div class="ai-card__head">
          <span class="ai-card__num">${String(index + 1).padStart(2, '0')} / AI</span>
          ${entry.status ? `<span class="ai-card__status"><i></i>${esc(humanStatus(entry.status))}</span>` : ''}
        </div>
        <h3 class="ai-card__title">${esc(entry.title)}</h3>
        <p class="ai-card__desc">${esc(entry.description)}</p>
        <div class="ai-card__foot">
          <ul class="ai-card__tags">${(entry.tags || []).map((tag) => `<li class="tag">${esc(tag)}</li>`).join('')}</ul>
          ${links.length ? `<div class="project__links">${links.join('')}</div>` : ''}
        </div>
        ${showPlaceholder ? '<span class="placeholder-badge ai-card__badge">Placeholder</span>' : ''}
      </article>`;
    })
    .join('');
}

/* ----- GitHub ------------------------------------------------------------- */
function githubProfileUrl() {
  const configured = safeUrl(SITE_CONFIG.github.profileUrl);
  if (configured) return configured;
  const username = String(SITE_CONFIG.github.username || '').trim().replace(/^@/, '');
  return username ? `https://github.com/${encodeURIComponent(username)}` : '';
}

function renderGithub(repos, options = {}) {
  const body = byId('github-body');
  if (!body) return;

  const profile = githubProfileUrl();
  const username = String(SITE_CONFIG.github.username || '').replace(/^@/, '');
  const list = repos || SITE_CONFIG.github.repos || [];
  const live = Boolean(options.live);
  const hasPlaceholderRepos = list.some((repo) => !safeUrl(repo.url));

  const profileHtml = profile
    ? `<div class="gh-profile">
        <div class="gh-profile__icon">${ICONS.github}</div>
        <p class="gh-profile__eyebrow">GitHub profile</p>
        <p class="gh-profile__handle">${esc(username ? `@${username}` : 'Open profile')}</p>
        <p class="gh-profile__desc">${esc(
          'Repositories, commits, and the parts that are still a work in progress.'
        )}</p>
        <a class="btn btn--primary" href="${esc(profile)}"${externalAttrs(profile)}>
          View profile ${ICONS.arrow}
        </a>
      </div>`
    : `<div class="gh-profile gh-profile--empty">
        <div class="gh-profile__icon">${ICONS.github}</div>
        <p class="gh-profile__eyebrow">GitHub profile</p>
        <p class="gh-profile__handle">Not configured</p>
        <p class="gh-profile__desc">Add <code>socials.github</code> in <code>script.js</code> to show the profile link.</p>
      </div>`;

  body.innerHTML = `${profileHtml}
    <div class="gh-repos">
      <div class="gh-repos__head">
        <span>Selected repositories</span>
        ${live ? '<span class="gh-live">Live from GitHub</span>' : options.liveFailed ? '<span>Curated list</span>' : hasPlaceholderRepos && SITE_CONFIG.features.showPlaceholderBadges ? '<span>Placeholder entries</span>' : '<span>Curated list</span>'}
      </div>
      <ul class="repo-list">
        ${list
          .map((repo) => {
            const url = safeUrl(repo.url);
            const meta = [
              live && typeof repo.stars === 'number' ? `★ ${repo.stars}` : '',
              live && repo.language ? esc(repo.language) : '',
            ]
              .filter(Boolean)
              .join(' · ');

            const inner = `<span class="repo__name">${esc(repo.name)}</span>
              <span class="repo__desc">${esc(repo.description || '')}</span>
              <span class="repo__meta">${meta}</span>
              ${
                repo.topics && repo.topics.length
                  ? `<span class="repo__topics">${repo.topics
                      .slice(0, 4)
                      .map((topic) => `<span>${esc(topic)}</span>`)
                      .join('')}</span>`
                  : ''
              }`;

            return `<li class="repo">${
              url
                ? `<a href="${esc(url)}"${externalAttrs(url)}>${inner}</a>`
                : `<div class="repo__row">${inner}</div>`
            }</li>`;
          })
          .join('')}
      </ul>
    </div>`;
}

async function loadGithubLive() {
  const username = String(SITE_CONFIG.github.username || '').replace(/^@/, '');
  if (!SITE_CONFIG.features.githubLive || !username) return;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 9000);
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed`,
      { headers: { Accept: 'application/vnd.github+json' }, signal: controller.signal }
    );
    clearTimeout(timer);
    if (!response.ok) throw new Error(`GitHub API ${response.status}`);

    const data = await response.json();
    const repos = data
      .filter((repo) => SITE_CONFIG.github.liveIncludeForks || !repo.fork)
      .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
      .slice(0, SITE_CONFIG.github.liveLimit || 6)
      .map((repo) => ({
        name: repo.name,
        description: repo.description || '',
        topics: repo.topics || [],
        url: repo.html_url,
        stars: repo.stargazers_count,
        language: repo.language,
      }));

    if (repos.length) renderGithub(repos, { live: true });
  } catch (err) {
    // The curated list stays in place. No fabricated numbers, no error banner.
    console.warn('[portfolio] GitHub live data unavailable:', err.message);
    renderGithub(null, { liveFailed: true });
  }
}

/* ----- Writing ------------------------------------------------------------ */
function renderWriting() {
  const list = byId('writing-list');
  if (!list) return;

  list.innerHTML = (SITE_CONFIG.writing.entries || [])
    .map((entry, index) => {
      const url = safeUrl(entry.url);
      const showPlaceholder = SITE_CONFIG.features.showPlaceholderBadges && entry.placeholder;
      const cover = assetUrl(entry.cover);
      const coverAlt = entry.coverAlt || `Cover for ${entry.title}`;
      const metaBits = [
        entry.category ? `<span class="tag">${esc(entry.category)}</span>` : '',
        entry.date ? `<span class="writing-item__date">${esc(entry.date)}</span>` : '',
        entry.status ? `<span class="writing-item__date">${esc(humanStatus(entry.status))}</span>` : '',
        showPlaceholder ? '<span class="placeholder-badge">Placeholder</span>' : '',
        url ? `<span class="writing-item__arrow">${ICONS.arrow}</span>` : '',
      ]
        .filter(Boolean)
        .join('');

      const inner = `<span class="writing-item__num">${String(index + 1).padStart(2, '0')}</span>
        ${cover ? `<span class="writing-item__thumb"><img src="${esc(cover)}" alt="${esc(coverAlt)}" loading="lazy" decoding="async"></span>` : ''}
        <span class="writing-item__main">
          <span class="writing-item__title">${esc(entry.title)}</span>
          <span class="writing-item__desc">${esc(entry.description || '')}</span>
        </span>
        <span class="writing-item__meta">${metaBits}</span>`;

      return `<li class="writing-item">${
        url
          ? `<a class="writing-item__link${cover ? ' has-cover' : ''}" href="${esc(url)}"${externalAttrs(url)}>${inner}</a>`
          : `<div class="writing-item__link${cover ? ' has-cover' : ''} is-static">${inner}</div>`
      }</li>`;
    })
    .join('');
}

/* ----- Contact ------------------------------------------------------------ */
function renderContact() {
  const primary = byId('contact-primary');
  if (!primary) return;

  const email = SITE_CONFIG.contact.email;

  if (isEmail(email)) {
    const clean = email.trim();
    primary.innerHTML = `
      <p class="contact__label">Email</p>
      <a class="contact__email" href="mailto:${esc(clean)}">
        ${esc(clean)}${ICONS.arrow}
      </a>
      <div class="contact__actions">
        <button class="copy-btn" type="button" id="copy-email" data-email="${esc(clean)}">
          ${ICONS.copy}<span>Copy address</span>
        </button>
        <a class="link-arrow" href="mailto:${esc(clean)}">Open mail app ${ICONS.arrowRight}</a>
      </div>`;

    const copyBtn = byId('copy-email');
    if (copyBtn) copyBtn.addEventListener('click', () => copyEmail(copyBtn, clean));
  } else {
    const message = IS_DEV
      ? 'Email is not configured yet. Add it in script.js → contact.email.'
      : 'Email is not listed here yet.';
    primary.innerHTML = `
      <p class="contact__label">Email</p>
      <p class="contact__empty">${esc(message)}</p>`;
  }
}

function copyEmail(button, email) {
  const done = () => {
    const label = button.querySelector('span');
    button.classList.add('is-copied');
    button.innerHTML = `${ICONS.check}<span>Copied</span>`;
    if (label) label.textContent = 'Copied';
    setTimeout(() => {
      button.classList.remove('is-copied');
      button.innerHTML = `${ICONS.copy}<span>Copy address</span>`;
    }, 2200);
  };

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(email).then(done).catch(() => fallbackCopy(email, done));
  } else {
    fallbackCopy(email, done);
  }
}

function fallbackCopy(text, done) {
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.appendChild(field);
  field.select();
  try {
    document.execCommand('copy');
    done();
  } catch (err) {
    console.warn('[portfolio] Could not copy the email address.');
  }
  document.body.removeChild(field);
}

/* ----- Author / books (opt-in, loaded only when enabled) ------------------ */
function initAuthor() {
  const features = SITE_CONFIG.features;
  if (!features.showAuthorIdentity && !features.showBookPromotion) return;

  const script = document.createElement('script');
  script.src = SITE_CONFIG.author.dataFile || 'author-data.js';
  script.async = true;
  script.onload = () => renderAuthor(window.AUTHOR_DATA);
  script.onerror = () => {
    console.warn('[portfolio] author-data.js was not found. Add it, or turn the author features off.');
  };
  document.body.appendChild(script);
}

function renderAuthor(data) {
  const features = SITE_CONFIG.features;
  if (!data) return;

  const showIdentity = features.showAuthorIdentity;
  const showBooks = features.showBookPromotion;
  const books = showBooks ? data.books || [] : [];

  if (!showIdentity && !books.length) return;
  if (showIdentity && !data.penName && !data.bio && !books.length) return;

  const section = document.createElement('section');
  section.className = 'section section--author';
  section.id = 'author';
  section.setAttribute('aria-labelledby', 'author-title');

  const title = data.sectionTitle || SITE_CONFIG.author.sectionTitle;
  const intro = showIdentity ? data.bio || SITE_CONFIG.author.intro : SITE_CONFIG.author.intro;

  const ctaUrl = safeUrl(data.cta && data.cta.url);
  const ctaLabel = data.cta && data.cta.label;

  const introHtml = `<div class="author__intro">
    ${showIdentity && data.penName ? `<p class="author__pen">${esc(data.penName)}</p>` : ''}
    <p class="author__bio">${esc(intro)}</p>
    ${ctaUrl && ctaLabel ? `<p class="author__cta"><a class="btn btn--ghost" href="${esc(ctaUrl)}"${externalAttrs(ctaUrl)}>${esc(ctaLabel)} ${ICONS.arrow}</a></p>` : ''}
  </div>`;

  const bookHtml = books.length
    ? `<div class="book-grid">${books
        .map((book) => {
          const cover = assetUrl(book.cover);
          const sample = safeUrl(book.sampleUrl);
          const purchase = safeUrl(book.purchaseUrl);
          const publisher = safeUrl(book.publisherUrl);
          return `<article class="book">
            <div class="book__cover">
              ${
                cover
                  ? `<img class="book__cover-img" src="${esc(cover)}" alt="Cover of ${esc(book.title)}" loading="lazy" decoding="async">`
                  : `<span class="book__cover-genre">${esc(book.genre || 'Fiction')}</span>
                     <span class="book__cover-title">${esc(book.title)}</span>`
              }
            </div>
            <h3 class="book__title">${esc(book.title)}</h3>
            <p class="book__desc">${esc(book.description || '')}</p>
            <div class="book__links">
              ${sample ? linkArrow('Read a sample', sample, 'arrow') : ''}
              ${purchase ? linkArrow('Buy', purchase, 'arrow') : ''}
              ${publisher ? linkArrow('Publisher', publisher, 'arrow') : ''}
            </div>
          </article>`;
        })
        .join('')}</div>`
    : '';

  section.innerHTML = `<div class="wrap">
    <header class="s-head">
      <p class="s-index"><span class="s-index__num">--</span> Books</p>
      <h2 class="s-title" id="author-title">${esc(title)}</h2>
      <p class="s-intro">${esc(SITE_CONFIG.author.intro)}</p>
    </header>
    <div class="author__grid${books.length ? '' : ' author__grid--solo'}">${introHtml}${bookHtml}</div>
  </div>`;

  const contact = byId('contact');
  if (contact) contact.parentNode.insertBefore(section, contact);

  // Add the navigation entry only now that the section exists and is public.
  const navList = document.querySelector('.nav__list');
  const contactLi = navList ? navList.querySelector('[data-nav="contact"]')?.closest('li') : null;
  if (navList && contactLi && !navList.querySelector('[data-nav="author"]')) {
    const li = document.createElement('li');
    li.innerHTML = '<a href="#author" data-nav="author"><span class="nav__num"></span>Books</a>';
    navList.insertBefore(li, contactLi);
  }

  numberSections();
  renderHeroIndex();
  initReveal();
  initYear();

  if (!reducedMotion()) section.classList.add('reveal');
  requestAnimationFrame(() => section.classList.add('is-in'));
}

/* ----- Navigation, scroll, reveal ---------------------------------------- */
function initNav() {
  const toggle = byId('nav-toggle');
  const nav = byId('primary-nav');
  if (!toggle || !nav) return;

  nav.setAttribute('tabindex', '-1');

  const focusables = () =>
    all('a[href], button:not([disabled])', nav).filter((el) => el.offsetParent !== null);

  const open = () => {
    nav.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    requestAnimationFrame(() => {
      const first = nav.querySelector('a[href]');
      if (first) first.focus({ preventScroll: true });
      else nav.focus({ preventScroll: true });
    });
  };

  const close = (returnFocus) => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    if (returnFocus) toggle.focus({ preventScroll: true });
  };

  toggle.addEventListener('click', () => {
    if (nav.classList.contains('is-open')) close(true);
    else open();
  });

  nav.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;
    const targetId = (link.getAttribute('href') || '').replace('#', '');
    const keyboard = event.detail === 0;
    close(false);
    if (keyboard && targetId) {
      const target = byId(targetId);
      if (target) {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    }
  });

  document.addEventListener('keydown', (event) => {
    if (!nav.classList.contains('is-open')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close(true);
      return;
    }
    if (event.key === 'Tab') {
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === nav)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 960 && nav.classList.contains('is-open')) close(false);
  });

  // Active section, computed from scroll position (stable for tall sections).
  const links = all('[data-nav]');
  let ticking = false;

  const update = () => {
    const marker = window.scrollY + (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--head-h'), 10) || 68) + 110;
    let current = 'home';

    all('main section[id]').forEach((section) => {
      if (section.hidden) return;
      if (section.offsetTop <= marker) current = section.id;
    });

    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60) {
      const visible = all('main section[id]').filter((s) => !s.hidden);
      if (visible.length) current = visible[visible.length - 1].id;
    }

    links.forEach((link) => {
      if (link.dataset.nav === current) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    const bar = byId('scroll-progress-bar');
    if (bar) {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = height > 0 ? Math.min(1, window.scrollY / height) : 0;
      bar.style.width = `${(progress * 100).toFixed(2)}%`;
    }

    const head = byId('site-head');
    if (head) head.classList.toggle('is-scrolled', window.scrollY > 8);

    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true }
  );

  window.addEventListener('resize', update);
  update();
}

let revealObserver = null;

function initReveal() {
  if (reducedMotion()) return;

  if (!('IntersectionObserver' in window)) {
    all('.reveal').forEach((el) => el.classList.add('is-in'));
    return;
  }

  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.06, rootMargin: '0px 0px -6% 0px' }
    );
  }

  const targets = all(
    '.s-head, .project, .lab, .ai-card, .writing-item, .about__body, .about__aside, .gh-profile, .gh-repos, .contact__body, .book'
  );

  targets.forEach((el) => {
    if (el.dataset.revealBound === '1') return;
    el.dataset.revealBound = '1';
    el.classList.add('reveal');
    revealObserver.observe(el);
  });
}

/* ----- Development panel -------------------------------------------------- */
function initDevPanel() {
  IS_DEV = devMode();
  if (!IS_DEV) return;

  document.body.classList.add('is-dev');
  all('[data-dev-only]').forEach((el) => {
    el.hidden = false;
  });

  const panel = byId('dev-checklist');
  const list = byId('dev-checklist-list');
  if (!panel || !list) return;

  const cfg = SITE_CONFIG;
  const placeholderProjects = cfg.projects.filter((p) => p.placeholder).length;
  const placeholderLabs = cfg.security.entries.filter((e) => e.placeholder).length;
  const placeholderWriting = cfg.writing.entries.filter((e) => e.placeholder).length;
  const linklessRepos = cfg.github.repos.filter((r) => !safeUrl(r.url)).length;

  const checks = [
    { ok: Boolean(cfg.identity.name && cfg.identity.headline), text: 'Name and headline are set.' },
    { ok: Boolean(safeUrl(cfg.socials.github)), text: 'GitHub profile URL (socials.github).' },
    { ok: Boolean(safeUrl(cfg.socials.linkedin)), text: 'LinkedIn URL (socials.linkedin).' },
    { ok: isEmail(cfg.contact.email), text: 'A real contact email (contact.email).' },
    { ok: placeholderProjects === 0, text: `${placeholderProjects} placeholder project(s) to replace.` },
    { ok: placeholderLabs === 0, text: `${placeholderLabs} placeholder lab note(s) to replace.` },
    { ok: placeholderWriting === 0, text: `${placeholderWriting} placeholder writing entry(ies) to replace.` },
    { ok: linklessRepos === 0, text: `${linklessRepos} repository entry(ies) without a URL.` },
    { ok: cfg.features.showAuthorIdentity || cfg.features.showBookPromotion, text: 'Author / book section is off (expected unless you are publishing it).', optional: true },
    { ok: Boolean(cfg.meta.baseUrl), text: 'Canonical base URL (meta.baseUrl) for social previews.' },
  ];

  const stillTodo = checks.filter((check) => !check.ok && !check.optional).length;
  panel.hidden = false;
  panel.querySelector('.dev-panel__title').textContent = stillTodo
    ? `Pre-publication checklist — ${stillTodo} open item${stillTodo === 1 ? '' : 's'}`
    : 'Pre-publication checklist — all clear';

  list.innerHTML = checks
    .map(
      (check) =>
        `<li class="${check.ok ? 'is-done' : ''}">${esc(check.text)}${check.optional ? ' <em>(optional)</em>' : ''}</li>`
    )
    .join('');
}

function initYear() {
  const year = byId('year');
  if (year) year.textContent = String(new Date().getFullYear());
}

/* ----- Boot --------------------------------------------------------------- */
function boot() {
  IS_DEV = devMode();

  applyBindings();
  applyMeta();
  applySectionVisibility();

  renderAbout();
  renderSocials();
  renderProjects();
  renderSecurity();
  renderAI();
  renderGithub();
  renderWriting();
  renderContact();

  numberSections();
  renderHeroIndex();

  initNav();
  initYear();
  initDevPanel();
  initReveal();

  initAuthor();
  loadGithubLive();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
