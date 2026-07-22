# Puzzle Stats Website

Marketing and legal pages for the [Puzzle Stats](https://puzzlestats.app) iOS app.

## Pages

| Page | URL | Purpose |
|------|-----|---------|
| Landing | `/` | App marketing, features, pricing |
| Privacy Policy | `/privacy.html` | Required for App Store Connect |
| Support | `/support.html` | Required for App Store Connect |
| Terms | `/terms.html` | Terms of service |
| Challenge | `/challenge` | Deep-link landing (`noindex`; not in sitemap) |
| Download | `/download` | Store redirect / landing; optional `?source=qrcode` (`noindex`; not in sitemap) |

## App Store Connect URLs

When submitting to the App Store, use these URLs:

- **Privacy Policy URL:** `https://puzzlestats.app/privacy.html`
- **Support URL:** `https://puzzlestats.app/support.html`
- **Marketing URL:** `https://puzzlestats.app/`

Also add a link to the privacy policy inside the app (Settings or About screen) — Apple requires both the App Store metadata URL and an in-app link.

## Local Preview

Open `index.html` in a browser, or serve locally:

```bash
npx serve .
```

## Deployment (GitHub Pages)

Repo: [github.com/puzzlestats/puzzlestats.github.io](https://github.com/puzzlestats/puzzlestats.github.io)

### One-time setup in GitHub

1. Open **Settings → Pages**
2. Under **Build and deployment**, set **Source** to **GitHub Actions** (not "Deploy from a branch")
3. Push to `main` — the workflow in `.github/workflows/pages.yml` deploys automatically
4. Under **Custom domain**, enter `puzzlestats.app` and save
5. Enable **Enforce HTTPS** once DNS is verified

Default GitHub Pages URL: **https://puzzlestats.github.io/**

If you see "There isn't a GitHub Pages site here", Pages is not enabled yet — complete step 2 above, then check **Actions** for a green deploy run.

## Before Launch

- [ ] Update App Store badge links in `index.html` with your real App Store URL
- [ ] Confirm `puzzlestatsapp@gmail.com` email is set up and monitored
- [ ] Verify privacy policy matches actual app behavior and App Privacy nutrition labels in App Store Connect
- [ ] Add in-app privacy policy link in the iOS app Settings screen

## SEO & Google Search

The site includes:

- **Meta tags** — titles, descriptions, robots, Open Graph (`og:url`), canonicals, and Twitter cards (HTTPS `https://puzzlestats.app/...`)
- **JSON-LD structured data** — `WebSite`, `Organization`, and `SoftwareApplication` on the homepage; `FAQPage` on support (eligible for rich results); breadcrumbs on subpages
- **Sitemap** — `https://puzzlestats.app/sitemap.xml` (home, privacy, support, terms). `/challenge` and `/download` are `noindex` and omitted on purpose.
- **robots.txt** — allows crawl and declares the sitemap URL above
- **CNAME** — `puzzlestats.app` for GitHub Pages custom domain
- **OG image** — `assets/og-image.svg` for social sharing previews

No Google verification token is checked into this repo (and none should be invented). Paste the real code from Search Console when you verify.

### Google Search Console setup

1. Deploy / confirm the live site at `https://puzzlestats.app` (GitHub Pages + Enforce HTTPS).
2. Open [Google Search Console](https://search.google.com/search-console) → **Add property**.

#### Choose property type

| Type | What to enter | Pros |
|------|---------------|------|
| **Domain** (recommended) | `puzzlestats.app` | Covers `https://`, `http://`, `www`, and apex. **DNS TXT only.** |
| **URL-prefix** | `https://puzzlestats.app/` | Can verify with HTML meta tag, HTML file upload, or DNS. Only covers that exact prefix. |

#### Verify ownership (pick one)

**A. DNS TXT (best with Domain property)**  
Search Console shows a TXT record like `google-site-verification=...`. Add it at your DNS host for `puzzlestats.app`, wait for propagation, then click **Verify**.

**B. HTML meta tag (URL-prefix only)**  
Search Console shows a tag such as:

```html
<meta name="google-site-verification" content="PASTE_CODE_FROM_GOOGLE">
```

Paste **that exact tag** into `index.html` `<head>` where the placeholder comment is (replace `PASTE_CODE_FROM_GOOGLE` with Google’s value — do not invent one). Commit, deploy, then **Verify**.

**C. HTML file upload (URL-prefix only)**  
Download `googleXXXX.html` from Search Console, place it in the **site root** next to `index.html`, commit, deploy, then **Verify**. Do not invent a filename/token.

3. After verification: **Sitemaps** → submit `https://puzzlestats.app/sitemap.xml`
4. **URL Inspection** → inspect `https://puzzlestats.app/` → **Request indexing**

For best social preview compatibility, consider exporting `assets/og-image.svg` to a 1200×630 PNG and updating `og:image` URLs.

## Structure

```
├── index.html          # Landing page (+ GSC meta placeholder comment)
├── privacy.html        # Privacy policy
├── support.html        # Support & FAQ
├── terms.html          # Terms of service
├── challenge/          # Challenge deep links (noindex)
├── download/           # Store redirect / campaign landing (noindex)
├── css/styles.css      # Shared styles
├── assets/favicon.svg  # Site icon
├── CNAME               # Custom domain for GitHub Pages
├── robots.txt
└── sitemap.xml
```
