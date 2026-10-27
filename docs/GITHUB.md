# GitHub section

The GitHub section can work in two modes:

1. **Curated list (default)** — you write the repositories in `SITE_CONFIG`.
2. **Live API** — the page fetches your public repositories from GitHub at load
   time, with the curated list as a fallback.

The curated list is also what visitors see if the network request fails, so it
should always be complete enough to stand on its own.

---

## 1. Curated list

```js
github: {
  username: 'your-handle',
  profileUrl: '',
  intro: 'Repositories I am willing to put my name on.',
  live: false,
  liveLimit: 6,
  liveIncludeForks: false,
  repos: [
    {
      name: 'repo-name',
      description: 'What it does, what state it is in, and what you learned.',
      topics: ['javascript', 'cli'],
      url: 'https://github.com/your-handle/repo-name',
    },
  ],
},
```

- `username` builds `https://github.com/<username>` when `profileUrl` is empty.
- `profileUrl` is an optional override (for example an organisation profile).
- `topics` shows up to four. No fake star counts or language labels are invented
  in curated mode.
- A repository without a URL renders as plain text, not a dead link. The check
  script warns about these.
- Keep the list short. Three to six strong repositories is better than a wall of
  abandoned experiments.

To disable the section entirely, remove it from `index.html` and remove its nav
item, or leave the list with real entries but no profile. The required site
sections include GitHub; there is no flag to hide it by default.

---

## 2. Live mode

Set both:

```js
features: {
  githubLive: true,
  // ...
},
github: {
  username: 'your-handle',
  live: true, // kept in sync for convenience; features.githubLive is what runs
  liveLimit: 6,
  liveIncludeForks: false,
  // ...
},
```

The page requests:

```text
https://api.github.com/users/<username>/repos?per_page=100&sort=pushed
```

Then it:

- filters out forks unless `liveIncludeForks` is true;
- sorts by `pushed_at` (most recent first);
- takes `liveLimit` entries (default 6);
- shows star count and primary language for each.

If the request fails for any reason, the curated list stays on screen and the
heading changes to "Curated list". No error banner or fake data is shown.

### Rate limits

Unauthenticated GitHub API requests are limited to **60 per hour per IP
address**. On a shared network or a busy site, that can be exhausted quickly.
Every visitor makes their own request from their own IP, so the limit is per
visitor, not a global site quota — but a visitor behind a shared NAT can still hit
it.

There is currently **no token option** in the site. Adding a personal access
token to client-side JavaScript would expose it to every visitor, so don't. If
you need guaranteed live data at scale, fetch and cache it server-side or during
a scheduled build, then keep using the curated list.

### Privacy

Live mode makes a request from the visitor's browser to `api.github.com`. That
means GitHub sees the visitor's IP and user agent, as it would for any GitHub
link. If you want zero third-party requests, leave live mode off.

### Private repositories

The public API only returns repositories visible to an anonymous visitor.
Private work stays private. Do not paste private repository URLs into the
curated list.

---

## 3. What is intentionally not included

- No contribution graph or commit heatmap. A real graph requires GitHub's
  contribution API or a third-party image; a fake one would be misleading.
- No invented contribution counts, stars, followers or "open-source contributor"
  badges.
- No organisations or clients you did not work with.
- No language percentages in curated mode.

If you later add genuine contribution activity, keep a link to the evidence.

---

## 4. Filling the curated list honestly

For each repository, answer:

- What does it do?
- What state is it in — prototype, maintained, archived, learning exercise?
- What did you personally do?
- Is there a README a stranger can follow?

Write the description from that. Avoid "revolutionary", "cutting-edge" and
"production-grade" unless it is literally running in production and you can say
where.

A useful pattern:

```js
{
  name: 'log-timeline',
  description:
    'A small CLI that turns mixed nginx and auth logs into a single ordered timeline. Built to practise parsing and timezone handling; not hardened for untrusted input.',
  topics: ['python', 'logs', 'cli'],
  url: 'https://github.com/your-handle/log-timeline',
}
```

That is more credible than a vague claim, and it sets expectations correctly.

---

## 5. Testing

1. Set `features.githubLive: false` and confirm the curated list renders.
2. Set it to `true` and reload. The heading should say "Live from GitHub".
3. Break the username temporarily (or go offline) and confirm the curated list
   comes back without an error banner.
4. Check that every repository link opens in a new tab.
5. Run `npm run check`; it warns about entries with no URL.

The live request is not part of `npm run check`, because that would require
network access and a real account.
