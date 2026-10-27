# Drive / OneDrive storage studio

`studio.html` is a local-only upload tool for portfolio images. You connect a
Google Drive or OneDrive account, drop files in, and copy a value into
`SITE_CONFIG`. Nothing about the studio is deployed.

- Server: `tools/storage-server.mjs` (Node, no dependencies)
- UI: `studio.html`
- URL: <http://127.0.0.1:8787/studio.html>
- Credentials: `storage.config.json` (gitignored)
- Tokens: `.storage-token.json` (gitignored, written with mode `600` where the OS supports it)

The browser never receives your client secret or refresh token. OAuth exchange
happens on the local server; the browser gets only a device code and the
resulting file metadata.

> This flow was verified end-to-end against a local mock of the Drive API. It
> has **not** been tested against live Google or Microsoft accounts, because that
> requires your OAuth client credentials. The setup below is the part you must
> verify yourself.

---

## 1. Start it

```bash
cp storage.config.example.json storage.config.json
npm run studio
```

Open <http://127.0.0.1:8787/studio.html>.

Without a config file the server still starts and the studio shows a setup
banner. You can inspect the UI, but Connect and Upload stay disabled.

You only need to configure the provider you intend to use. You can leave the
other provider's placeholders in place.

The server binds to `127.0.0.1` only. It rejects requests whose `Host` header is
not `127.0.0.1:<port>` or `localhost:<port>`, and mutating API calls require an
`X-Studio: 1` header. That is deliberate: it stops a random website in your
browser from driving the local uploader.

---

## 2. Google Drive setup

### 2.1 Create a Google Cloud project

1. Open <https://console.cloud.google.com/>.
2. Create a project (for example `portfolio-storage`) and select it.
3. Go to **APIs & Services → Library**, search for **Google Drive API**, and
   enable it.

### 2.2 Configure the OAuth consent screen

1. **APIs & Services → OAuth consent screen**.
2. User type: **External** (unless you have a Workspace organisation and prefer
   Internal).
3. Fill in the app name and your support email. You do not need a logo.
4. Scopes: add
   - `https://www.googleapis.com/auth/drive.file`
   - `openid`
   - `email`
5. While the app is in **Testing**, add your own Google account under **Test
   users**. Otherwise Google returns `access_denied`.

`drive.file` is intentionally narrow: the app can manage only files it creates
(or files you explicitly open with it). It cannot browse your whole Drive.

### 2.3 Create the OAuth client

1. **APIs & Services → Credentials → Create credentials → OAuth client ID**.
2. Application type: **TVs and Limited Input devices**.
3. Name it and create it.
4. Copy the **Client ID** and **Client secret** into `storage.config.json`.

Do **not** choose "Web application" — it does not support the device-code flow
used here and will produce `redirect_uri_mismatch` or an unsupported-flow error.

```json
{
  "provider": "google",
  "port": 8787,
  "google": {
    "clientId": "1234567890-abc.apps.googleusercontent.com",
    "clientSecret": "GOCSPX-...",
    "folderId": ""
  }
}
```

### 2.4 About `folderId`

Leave it empty for the first run. Uploads go to **My Drive**.

If you set a folder ID, the app uploads into that folder. With the `drive.file`
scope, an arbitrary folder created outside the app may not be accessible; the
upload will fail. Only set this after you have confirmed the folder is visible
to the app. Copy the ID from the folder URL:
`https://drive.google.com/drive/folders/<THIS_PART>`.

### 2.5 Connect

1. Restart `npm run studio` after editing the config (it is read at startup).
2. Reload the studio. The Google card should say **Configured**.
3. Click **Connect Google Drive**.
4. A code and a link appear. Open <https://www.google.com/device>, enter the
   code, and approve access.
5. The studio polls until the account is connected and shows the account email.

The refresh token is stored in `.storage-token.json`. In Testing mode Google
may expire refresh tokens after about seven days; reconnect when that happens.
Publishing the OAuth app (or using an Internal Workspace app) avoids that.

---

## 3. OneDrive setup

### 3.1 Register an app

1. Open <https://portal.azure.com/> → **Microsoft Entra ID** (Azure AD) →
   **App registrations** → **New registration**.
2. Name: `portfolio-storage`.
3. Supported account types:
   - **Personal Microsoft accounts only** for a personal OneDrive;
   - **Accounts in any organizational directory and personal Microsoft accounts**
     if you need both;
   - single-tenant if you only use a work account.
4. Redirect URI: leave blank. Device-code flow does not need one.
5. Register, then copy the **Application (client) ID**.

### 3.2 Allow public client flows

1. Open the app → **Authentication**.
2. Under **Advanced settings**, set **Allow public client flows** to **Yes**.
3. Save.

Without this, the device-code request fails with `AADSTS7000218` or a similar
"public client" error.

### 3.3 API permissions

1. **API permissions → Add a permission → Microsoft Graph → Delegated
   permissions**.
2. Add:
   - `Files.ReadWrite`
   - `offline_access`
3. Grant consent if your tenant requires it. Personal accounts usually consent
   on first sign-in.

`Files.ReadWrite` is broad. The studio only creates, lists and deletes files in
the app's own folder (`special/approot`), but the token itself can write to the
drive. Treat `.storage-token.json` as a credential.

### 3.4 Configure

```json
{
  "provider": "onedrive",
  "port": 8787,
  "onedrive": {
    "clientId": "00000000-0000-0000-0000-000000000000",
    "tenant": "common",
    "folder": "portfolio"
  }
}
```

- `tenant`:
  - `common` — work/school + personal
  - `consumers` — personal Microsoft accounts only
  - `organizations` — work/school only
  - a tenant ID or domain — one organisation
- `folder`: a subfolder under the app's private folder. Use `""` to upload
  directly to the app root. Nested paths such as `portfolio/2026` are created
  automatically.

### 3.5 Where the files go

OneDrive's `special/approot` is the app's dedicated folder, usually
`Apps/<app name>` in your OneDrive. It is not the same as the top-level
`/Pictures` folder. Open **OneDrive → Apps → portfolio-storage** (or the app
name you chose) to see uploads.

### 3.6 Anonymous links

After upload the server asks Microsoft Graph for an anonymous **view** link. If
your tenant disables anonymous sharing, the file still uploads but:

- `public` is `false` in the result;
- the direct URL may require sign-in and will not render in the portfolio.

In that case, either enable anonymous links for the app's folder, or host
portfolio images locally / on another public host. Do not weaken tenant-wide
sharing policy just for this site without understanding the consequences.

---

## 4. Using the studio

1. Pick **Google Drive** or **OneDrive**.
2. Connect and complete the device-code flow.
3. Drag files onto the drop zone, or choose them. Multiple files are queued;
   each has its own progress and error state.
4. When an upload finishes, the result row offers:
   - **Copy config value** — paste this into an image field.
   - **Copy direct URL** — the public image URL.
   - **Copy Markdown** — a ready `![alt](url)` snippet.
5. The media library lists the 30 most recent files for the current provider.
   Delete is two-step (click once, confirm) and removes the file from the
   provider. Google moves it to trash; OneDrive deletes it. There is no undo in
   the studio.

Limits:

- Maximum upload: **100 MB** per file.
- JSON request limit: 1 MB.
- Provider list limit: 30 recent files.

### Pasting into the portfolio

For Google, the config value looks like:

```js
image: 'drive:1AbCdEfGhIjKlMnOpQrStUv'
```

For OneDrive, it is the share URL:

```js
image: 'https://1drv.ms/i/s!AbCdEf...'
```

Both are accepted by `assetUrl()` in `script.js`. Any normal local path or public
HTTPS URL also works.

For a book cover, use the same value in `author-data.js` as `cover`.

### Image size guidance

- Social preview: 1200×630 (replace `assets/images/og.png` if you prefer).
- Project / AI / writing images: 1600 px on the long edge is plenty.
- Compress before upload. Drive/OneDrive are storage, not image CDNs; a 12 MB
  phone photo will make the page slow.
- Prefer JPEG/WebP/PNG. SVG is fine only for your own artwork.

---

## 5. Security notes

- `storage.config.json` and `.storage-token.json` are gitignored. Keep them that
  way. Never paste the client secret into `studio.html` or `script.js`.
- The build excludes these files, but do not rely on that alone: never deploy the
  project root.
- The studio is local. There is no authentication layer beyond the device flow,
  no remote access, and no multi-user support. Do not expose port 8787.
- Signing out in the studio removes the stored token for that provider. If you
  used a broad scope, also revoke access in your Google/Microsoft account
  security settings.
- If you suspect a token leaked, revoke it at the provider, delete
  `.storage-token.json`, and reconnect.
- The server will not serve `storage.config.json`, `.storage-token.json`,
  `.env*` or `author-data.js`.

---

## 6. Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Studio says config missing | File has the wrong name or is in the wrong folder | Use `storage.config.json` in the project root; restart the server |
| `invalid_client` (Google) | Wrong client type, or secret copied incorrectly | Create/use a **TVs and Limited Input devices** client |
| `redirect_uri_mismatch` (Google) | A Web application client was used | Recreate the client with the TV/limited-input type |
| Google `access_denied` | Account not added as a test user, or consent declined | Add the account under OAuth consent screen → Test users |
| Google refresh token expires repeatedly | App is still in Testing | Publish the app, use an Internal app, or reconnect as needed |
| Google upload cannot find folder | `folderId` not visible to `drive.file` | Clear `folderId` and upload to My Drive |
| `AADSTS7000218` / public client error | Public client flows disabled | Authentication → Allow public client flows → Yes |
| OneDrive `invalid tenant` | Wrong `tenant` value | Use `common`, `consumers`, `organizations`, or the tenant ID |
| OneDrive needs admin approval | Tenant consent policy | Ask an admin, or use a personal account |
| Upload works but image is broken | File is not publicly viewable | Enable anonymous view links, or use a local image |
| 403 from the studio API | Missing CSRF header, or wrong Host | Use the studio UI at `127.0.0.1`; do not call the API from another origin |
| Port 8787 already in use | Another server is running | Stop it, or change `port` in the config and restart |
| Changes to config do nothing | Config is read at startup | Restart `npm run studio` |
| Large file rejected | Over 100 MB | Compress or resize first |

To check the server without the UI:

```bash
curl http://127.0.0.1:8787/api/health
```

A healthy response lists both providers, whether each is configured, and whether
a token is present. It never returns the secret or token values.

---

## 7. Removing the studio from a copy

The studio is not part of the published site. If you want to remove it entirely
from your working copy:

- delete `studio.html`, `tools/storage-server.mjs`, `storage.config.example.json`
  and the `studio` script in `package.json`;
- keep the build whitelist as it is — it already excludes those files;
- delete local `storage.config.json` and `.storage-token.json` after revoking
  access.

The portfolio itself has no dependency on the studio.
