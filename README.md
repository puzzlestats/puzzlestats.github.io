# Puzzle Stats Website

Marketing and legal pages for the [Puzzle Stats](https://puzzlestats.app) iOS app.

## Pages

| Page | URL | Purpose |
|------|-----|---------|
| Landing | `/` | App marketing, features, pricing |
| Privacy Policy | `/privacy.html` | Required for App Store Connect |
| Support | `/support.html` | Required for App Store Connect |

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

1. Push this repo to [github.com/puzzlestats/puzzlestats.github.io](https://github.com/puzzlestats/puzzlestats.github.io)
2. Go to **Settings → Pages**
3. Set source to **Deploy from branch** → `main` → `/ (root)`
4. Ensure the `CNAME` file is present for the custom domain `puzzlestats.app`
5. Configure DNS for `puzzlestats.app`:
   - `A` records pointing to GitHub Pages IPs, or
   - `CNAME` record for `www` pointing to `puzzlestats.github.io`

Default GitHub Pages URL (before custom domain): **https://puzzlestats.github.io/**

GitHub Pages will serve the site over HTTPS automatically once DNS propagates.

## Before Launch

- [ ] Update App Store badge links in `index.html` with your real App Store URL
- [ ] Confirm `support@puzzlestats.app` email is set up and monitored
- [ ] Verify privacy policy matches actual app behavior and App Privacy nutrition labels in App Store Connect
- [ ] Add in-app privacy policy link in the iOS app Settings screen

## SEO & Google Search

The site includes:

- **Meta tags** — titles, descriptions, robots, Open Graph, and Twitter cards on every page
- **JSON-LD structured data** — `WebSite`, `Organization`, and `SoftwareApplication` on the homepage; `FAQPage` on support (eligible for rich results); breadcrumbs on subpages
- **Sitemap** — `sitemap.xml` referenced in `robots.txt`
- **OG image** — `assets/og-image.svg` for social sharing previews

### Google Search Console setup

1. Deploy the site to `https://puzzlestats.app`
2. Go to [Google Search Console](https://search.google.com/search-console)
3. Add property for `https://puzzlestats.app`
4. Verify ownership via DNS TXT record (recommended) or HTML file upload
5. Submit sitemap: `https://puzzlestats.app/sitemap.xml`
6. Use **URL Inspection** to request indexing of the homepage

Optional: add a Google site verification meta tag to each page's `<head>`:

```html
<meta name="google-site-verification" content="YOUR_VERIFICATION_CODE">
```

For best social preview compatibility, consider exporting `assets/og-image.svg` to a 1200×630 PNG and updating `og:image` URLs.

## Structure

```
├── index.html          # Landing page
├── privacy.html        # Privacy policy
├── support.html        # Support & FAQ
├── css/styles.css      # Shared styles
├── assets/favicon.svg  # Site icon
├── CNAME               # Custom domain for GitHub Pages
├── robots.txt
└── sitemap.xml
```
