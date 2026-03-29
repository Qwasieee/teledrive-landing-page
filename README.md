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
├── mirror-release.yml      Copy this into your PRIVATE repo's .github/workflows/
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

Open `js/config.js` and replace the three placeholders:

```js
RELEASE_REPO: "Qwasieee/teledrive-landing-page",  // this repo
GITHUB_USER:  "Qwasieee",
SOURCE_REPO:  "Qwasieee/teledrive",        // your private repo
```

### 3. Create a personal access token (PAT)

Go to GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens** → Generate new token

- Resource owner: your account
- Repository access: **Only select repositories** → pick `teledrive-landing-page`
- Permissions:
  - Contents → **Read and write**
  - Metadata → Read-only (auto-selected)
- Copy the token

### 4. Add the token as a secret in your PRIVATE repo

In your private `teledrive` repo:
**Settings → Secrets and variables → Actions → New repository secret**

- Name: `SITE_REPO_TOKEN`
- Value: the token from step 3

### 5. Add the workflow to your PRIVATE repo

Copy `mirror-release.yml` into your private repo at:

```
.github/workflows/mirror-release.yml
```

Update the `PUBLIC_REPO` line at the top:

```yaml
PUBLIC_REPO: "Qwasieee/teledrive-landing-page"
```

Commit and push.

---

## Releasing a new version (ongoing)

1. Build your binaries for each platform
2. In the **private `teledrive` repo**, go to **Releases → Draft a new release**
3. Create a tag (e.g. `v1.2.0`), write release notes, attach all binary files
4. Click **Publish release**
5. The GitHub Action runs automatically and mirrors everything here
6. The landing page shows the new version on next load ✅

That's it. You never need to touch this repo when shipping a new release.

---

## Updating the landing page

To change the text, design, or layout:

- **Content / copy:** edit `index.html`
- **Colors, fonts, spacing:** edit `css/style.css`
- **Download button logic:** edit `js/releases.js`
- **Repo configuration:** edit `js/config.js`

Commit and push — GitHub Pages deploys automatically within ~30 seconds.

---

## Manually mirroring an old release

If you published a release before setting up the workflow, mirror it manually:

```bash
# Download from private repo
gh release download v1.0.0 --repo Qwasieee/teledrive --dir /tmp/assets

# Publish to public repo
gh release create v1.0.0 /tmp/assets/* \
  --repo Qwasieee/teledrive-landing-page \
  --title "v1.0.0" \
  --notes "Initial release"
```

---

## Custom domain (optional)

1. **Settings → Pages** → enter your domain (e.g. `teledrive.yourdomain.com`)
2. Add a file called `CNAME` at the root of this repo containing just your domain
3. At your domain registrar, add a `CNAME` record pointing to `Qwasieee.github.io`

GitHub handles HTTPS automatically.
