# Box QR code

| | |
|---|---|
| **Encoded URL** | `https://puzzlestats.app/download?source=boxqr` |
| **ECC level** | **H** (~30% recovery) |
| **Files** | `boxqr.png`, `boxqr.svg` |

## Why this URL

- Site canonical and GitHub Pages `CNAME` use the apex host `puzzlestats.app`.
- `https://www.puzzlestats.app/...` **301** redirects to the apex equivalent (query string preserved).
- Apex `/download?source=boxqr` returns **200** (via a trailing-slash redirect to `/download/?source=boxqr`).
- Full HTTPS URL only — no third-party shortener that could expire.

`source=boxqr` is accepted by `/js/download.js` (`source` / `utm_source` / `ref`, alphanumeric + `_`/`-`, max 40 chars).
