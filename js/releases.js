/* =========================================================
   TeleDrive — releases.js
   Fetches the latest GitHub release and renders download buttons.
   Assets are attached directly to the release in this repo.
   ========================================================= */

(function () {
  /* ── Config (set in index.html via window.TELEDRIVE_CONFIG) ── */
  const CFG = window.TELEDRIVE_CONFIG || {};
  const RELEASE_REPO = CFG.RELEASE_REPO || "";
  const SOURCE_REPO = CFG.SOURCE_REPO || "";

  /* ── Platform detection ──────────────────────────────────── */
  const ua = navigator.userAgent.toLowerCase();

  function detectOS() {
    if (/android/.test(ua)) return "android";
    if (/iphone|ipad|ipod/.test(ua)) return "ios";
    if (/win/.test(ua)) return "windows";
    if (/mac/.test(ua)) return "macos";
    if (/linux/.test(ua)) return "linux";
    return "unknown";
  }

  /* Map asset filename → platform info */
  const PLATFORMS = [
    {
      id: "windows",
      label: "Windows",
      icon: "windows",
      match: (name) => /\.(exe|msix|msi)$/i.test(name),
    },
    {
      id: "macos",
      label: "macOS",
      icon: "apple",
      match: (name) => /\.(dmg|pkg)$/i.test(name),
    },
    {
      id: "linux",
      label: "Linux",
      icon: "linux",
      match: (name) =>
        /\.(appimage|deb|rpm)$/i.test(name) || /linux.*\.tar\.gz$/i.test(name),
    },
    {
      id: "android",
      label: "Android",
      icon: "android",
      match: (name) => /\.apk$/i.test(name),
    },
    {
      id: "ios",
      label: "iOS",
      icon: "apple",
      match: (name) => /\.ipa$/i.test(name),
    },
  ];

  function matchPlatform(assetName) {
    return PLATFORMS.find((p) => p.match(assetName)) || null;
  }

  /* ── SVG icon sprites ────────────────────────────────────── */
  const ICONS = {
    windows: `<svg class="btn-dl__icon" viewBox="0 0 20 20" fill="currentColor">
      <path d="M2 3.5L9 2.4v6.4H2V3.5zm7.7-1.2L18 1v7.8H9.7V2.3zM2 9.6h7v6.4L2 14.7V9.6zm7.7 0H18V18l-8.3-1.4V9.6z"/>
    </svg>`,

    apple: `<svg class="btn-dl__icon" viewBox="0 0 20 20" fill="currentColor">
      <path d="M13.8 1c.1 1.3-.4 2.6-1.2 3.5-.8.9-2 1.5-3.2 1.4-.1-1.3.5-2.6 1.2-3.4.8-.9 2.1-1.5 3.2-1.5zm3 7c-.7.5-2.3 1.7-2.3 3.7 0 2.4 1.9 3.2 2.3 3.4-.1.3-.4 1-.9 1.8-.6 1-1.2 2-2.3 2s-1.4-.6-2.7-.6c-1.2 0-1.7.6-2.7.6S6.1 18 5.5 17c-1.4-1.7-2.2-4-2.2-6.2 0-3.5 2.3-5.4 4.5-5.4 1.1 0 2.1.7 2.8.7.6 0 1.8-.7 3-.7.7 0 2 .2 2.7 2z"/>
    </svg>`,

    linux: `<svg class="btn-dl__icon" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 1C6.7 1 5.5 4.2 5.5 6.2c0 1.2.3 2.3.9 3.2-.6 1.4-1 2.9-1 4.4 0 2.6 1.7 5.2 4.6 5.2s4.6-2.6 4.6-5.2c0-1.5-.4-3-.9-4.4.6-.9.9-2 .9-3.2C14.5 4.2 13.3 1 10 1zm0 1.8c2.2 0 2.7 2 2.7 3.4 0 .9-.2 1.8-.6 2.5-1-.6-2.2-.9-3.6-.9-1.3 0-2.6.3-3.6.9-.4-.7-.6-1.6-.6-2.5 0-1.4.5-3.4 2.7-3.4zm-.1 8.4c2.7 0 3.7 1.2 3.7 2.2 0 1-.6 1.8-1.2 1.8-.5 0-1.1-.4-2.5-.4s-2 .4-2.5.4c-.6 0-1.1-.8-1.1-1.8 0-1 1-2.2 3.6-2.2z"/>
    </svg>`,

    android: `<svg class="btn-dl__icon" viewBox="0 0 20 20" fill="currentColor">
      <path d="M6.2 3.2L4.5 1.5M13.8 3.2L15.5 1.5M3 7h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7zm0 3.5H1.5v3h1.5m14-3h1.5v3H17M7 16v2.5M13 16v2.5"/>
    </svg>`,

    download: `<svg class="btn-dl__icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10 3v10M6 9l4 4 4-4M4 16h12"/>
    </svg>`,
  };

  /* ── DOM helpers ─────────────────────────────────────────── */
  function qs(sel) {
    return document.querySelector(sel);
  }

  function setLoading(msg) {
    const el = qs("#dl-buttons-container");
    if (el) el.innerHTML = `<span class="download__state">${msg}</span>`;
  }

  function setError(msg) {
    const el = qs("#dl-buttons-container");
    if (el)
      el.innerHTML = `<span class="download__state download__state--error">${msg}</span>`;
  }

  function setMeta(html) {
    const el = qs("#dl-meta");
    if (el) el.innerHTML = html;
  }

  /* ── Button renderer ─────────────────────────────────────── */
  function renderButtons(assets, tagName, publishedAt, releaseUrl) {
    const container = qs("#dl-buttons-container");
    if (!container) return;
    container.innerHTML = "";

    const detectedOS = detectOS();

    /* Group assets by platform */
    const groups = {};
    assets.forEach((asset) => {
      const pl = matchPlatform(asset.name);
      if (!pl) return;
      if (!groups[pl.id]) groups[pl.id] = { platform: pl, assets: [] };
      groups[pl.id].assets.push(asset);
    });

    const platformList = Object.values(groups);

    // Mark unavailable platforms in the UI panel
    document.querySelectorAll(".platform").forEach((el) => {
      const os = el.getAttribute("data-os");
      if (!groups[os]) {
        el.classList.add("platform--unavailable");
        el.title = "Unavailable";
      }
    });

    if (platformList.length === 0) {
      setError(
        'No downloads found yet. <a href="https://github.com/' +
          RELEASE_REPO +
          '/releases" target="_blank" rel="noopener">Check releases →</a>',
      );
      return;
    }

    /* Sort: detected platform first, then by PLATFORMS order */
    platformList.sort((a, b) => {
      const aMatch = a.platform.id === detectedOS;
      const bMatch = b.platform.id === detectedOS;
      if (aMatch && !bMatch) return -1;
      if (bMatch && !aMatch) return 1;
      const ai = PLATFORMS.findIndex((p) => p.id === a.platform.id);
      const bi = PLATFORMS.findIndex((p) => p.id === b.platform.id);
      return ai - bi;
    });

    /* Render a button per platform (use first asset if multiple) */
    platformList.forEach((group, i) => {
      const asset = group.assets[0];
      const pl = group.platform;
      const isPrimary = i === 0;

      const btn = document.createElement("a");
      btn.href = asset.browser_download_url;
      btn.className =
        "btn-dl " + (isPrimary ? "btn-dl--primary" : "btn-dl--secondary");
      btn.innerHTML = (ICONS[pl.icon] || ICONS.download) + pl.label;

      container.appendChild(btn);
    });

    /* Meta line below buttons */
    const date = new Date(publishedAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    setMeta(
      `${tagName}&nbsp;<span class="download__meta-sep">·</span>&nbsp;${date}&nbsp;` +
        `<span class="download__meta-sep">·</span>&nbsp;` +
        `<a href="${releaseUrl}" target="_blank" rel="noopener">What's new →</a>`,
    );
  }

  /* ── Fetch from GitHub API ───────────────────────────────── */
  async function loadRelease() {
    if (!RELEASE_REPO) {
      setError("RELEASE_REPO not configured.");
      return;
    }

    setLoading("Finding the latest version…");

    try {
      const res = await fetch(
        `https://api.github.com/repos/${RELEASE_REPO}/releases/latest`,
        { headers: { Accept: "application/vnd.github+json" } },
      );

      if (res.status === 404) {
        setError("No release available yet. Check back soon.");
        return;
      }

      if (!res.ok) {
        throw new Error(`GitHub API returned ${res.status}`);
      }

      const data = await res.json();

      renderButtons(
        data.assets,
        data.tag_name,
        data.published_at,
        data.html_url,
      );
    } catch (err) {
      console.error("TeleDrive release fetch failed:", err);
      setError(
        `Couldn't load download info. ` +
          `<a href="https://github.com/${RELEASE_REPO}/releases" target="_blank" rel="noopener">` +
          `See all releases →</a>`,
      );
    }
  }

  /* ── Init ────────────────────────────────────────────────── */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadRelease);
  } else {
    loadRelease();
  }
})();
