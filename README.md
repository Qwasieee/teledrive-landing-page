# teledrive-landing-page

Landing page for TeleDrive, served via GitHub Pages.

**Live URL:** https://Qwasieee.github.io/teledrive-landing-page

---

## Folder structure

```
teledrive-landing-page/
├── index.html              Main page
├── css/
│   └── style.css           All styles
├── js/
│   ├── config.js           ← Edit this to configure repos
│   └── releases.js         Fetches download buttons from GitHub API
├── assets/                 Screenshots, images (add as needed)
└── README.md               This file
```

---

## First-time setup

### 1. Create this repo on GitHub and enable Pages

- Create a new **public** repo called `teledrive-landing-page`
- Go to **Settings → Pages**
- Source: **Deploy from a branch** → `main` → `/ (root)`
- Save

### 2. Edit `js/config.js`

Open `js/config.js` and replace the placeholders:

```js
RELEASE_REPO: "Qwasieee/teledrive-landing-page",  // this repo — releases live here
GITHUB_USER:  "Qwasieee",
SOURCE_REPO:  "Qwasieee/teledrive",               // private repo, used for issue links only
```

---

## Releasing a new version

Releases are published **directly in this repo** — no mirroring needed.

1. Build your binaries for each platform
2. In **this repo** (`teledrive-landing-page`), go to **Releases → Draft a new release**
3. Create a tag (e.g. `v1.2.0`), write release notes, attach all binary files
4. Click **Publish release**
5. The landing page shows the new version on next load ✅

---

## Updating the landing page

To change the text, design, or layout:

- **Content / copy:** edit `index.html`
- **Colors, fonts, spacing:** edit `css/style.css`
- **Download button logic:** edit `js/releases.js`
- **Repo configuration:** edit `js/config.js`

Commit and push — GitHub Pages deploys automatically within ~30 seconds.

---

## Custom domain (optional)

1. **Settings → Pages** → enter your domain (e.g. `teledrive.yourdomain.com`)
2. Add a file called `CNAME` at the root of this repo containing just your domain
3. At your domain registrar, add a `CNAME` record pointing to `Qwasieee.github.io`

GitHub handles HTTPS automatically.
