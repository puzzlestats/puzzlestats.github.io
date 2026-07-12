/**
 * Challenge Share Protocol v1 — puzzlestats.app
 * Parses query-string and compact /c/v1/{base64url} URLs.
 */
(function (global) {
  'use strict';

  const LIMITS = {
    from: 40,
    title: 120,
    maker: 60,
    piecesMin: 1,
    piecesMax: 50000,
    msMin: 100,
  };

  /** @typedef {{ v: number, from: string, upc?: string, title: string, maker: string, pieces: number, ms: number, mode: string, people: number }} ChallengePayload */

  function trim(s) {
    return (s ?? '').trim();
  }

  function base64UrlToJson(segment) {
    let b64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const binary = atob(b64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const json = new TextDecoder('utf-8').decode(bytes);
    return JSON.parse(json);
  }

  function normalizeMode(raw) {
    const m = trim(raw).toLowerCase();
    if (m === 'group') return 'team';
    if (m === 'pairs') return 'pair';
    return m;
  }

  function parseQuery(search) {
    const params = new URLSearchParams(search.startsWith('?') ? search : '?' + search);
    const v = params.get('v');
    if (v !== '1') return null;

    return {
      v: 1,
      from: params.get('from') ?? '',
      upc: params.get('upc') ?? undefined,
      title: params.get('title') ?? '',
      maker: params.get('maker') ?? '',
      pieces: params.get('pieces') ?? '',
      ms: params.get('ms') ?? '',
      mode: params.get('mode') ?? '',
      people: params.get('people') ?? '',
    };
  }

  function parseCompactPath(pathname) {
    const match = pathname.match(/^\/c\/v1\/([^/?#]+)/);
    if (!match) return null;
    try {
      const obj = base64UrlToJson(decodeURIComponent(match[1]));
      return {
        v: obj.v,
        from: obj.from ?? '',
        upc: obj.upc,
        title: obj.title ?? '',
        maker: obj.maker ?? '',
        pieces: obj.pieces,
        ms: obj.ms,
        mode: obj.mode ?? '',
        people: obj.people,
      };
    } catch {
      return null;
    }
  }

  function validate(raw) {
    if (!raw || Number(raw.v) !== 1) {
      return { ok: false, error: 'This challenge link uses an unsupported version.' };
    }

    const from = trim(String(raw.from ?? ''));
    if (!from) return { ok: false, error: 'Missing challenger name.' };
    if (from.length > LIMITS.from) {
      return { ok: false, error: 'Challenger name is too long.' };
    }

    const upcRaw = raw.upc != null && String(raw.upc).trim() !== '' ? String(raw.upc).trim() : undefined;
    let upc;
    if (upcRaw) {
      const digits = upcRaw.replace(/\D/g, '');
      if (digits.length < 8 || digits.length > 14) {
        return { ok: false, error: 'Invalid puzzle barcode (UPC must be 8–14 digits).' };
      }
      upc = digits;
    }

    const title = trim(String(raw.title ?? ''));
    const maker = trim(String(raw.maker ?? ''));

    if (!title && !upc) {
      return { ok: false, error: 'Missing puzzle title or UPC.' };
    }
    if (title && title.length > LIMITS.title) {
      return { ok: false, error: 'Puzzle title is too long.' };
    }
    if (!maker) return { ok: false, error: 'Missing manufacturer.' };
    if (maker.length > LIMITS.maker) {
      return { ok: false, error: 'Manufacturer name is too long.' };
    }

    const pieces = parseInt(String(raw.pieces), 10);
    if (!Number.isFinite(pieces) || pieces < LIMITS.piecesMin || pieces > LIMITS.piecesMax) {
      return { ok: false, error: 'Invalid piece count.' };
    }

    const ms = parseInt(String(raw.ms), 10);
    if (!Number.isFinite(ms) || ms < LIMITS.msMin) {
      return { ok: false, error: 'Invalid solve time.' };
    }

    const mode = normalizeMode(raw.mode);
    if (!['solo', 'pair', 'team'].includes(mode)) {
      return { ok: false, error: 'Invalid solve mode.' };
    }

    const people = parseInt(String(raw.people), 10);
    if (!Number.isFinite(people)) {
      return { ok: false, error: 'Invalid participant count.' };
    }

    if (mode === 'solo' && people !== 1) {
      return { ok: false, error: 'Solo challenges must have exactly 1 puzzler.' };
    }
    if (mode === 'pair' && people !== 2) {
      return { ok: false, error: 'Pairs challenges must have exactly 2 puzzlers.' };
    }
    if (mode === 'team' && people < 2) {
      return { ok: false, error: 'Team challenges need at least 2 puzzlers.' };
    }

    /** @type {ChallengePayload} */
    const payload = {
      v: 1,
      from,
      title: title || 'Unknown puzzle',
      maker,
      pieces,
      ms,
      mode,
      people,
    };
    if (upc) payload.upc = upc;

    return { ok: true, payload };
  }

  function formatTime(ms) {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const t = Math.floor((ms % 1000) / 100);
    if (h > 0) {
      return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${t}`;
    }
    return `${m}:${String(s).padStart(2, '0')}.${t}`;
  }

  function modeLabel(mode, people) {
    if (mode === 'solo') return 'solo';
    if (mode === 'pair') return 'pairs';
    return `team of ${people}`;
  }

  function summaryLine(payload) {
    const time = formatTime(payload.ms);
    const mode = modeLabel(payload.mode, payload.people);
    return `${payload.from} solved ${payload.maker} ${payload.pieces.toLocaleString()}-piece ${payload.title} in ${time} (${mode}). Can you beat it?`;
  }

  function puzzleLine(payload) {
    return `${payload.maker} · ${payload.pieces.toLocaleString()} pieces`;
  }

  function parseFromLocation(loc) {
    const compact = parseCompactPath(loc.pathname);
    if (compact) return compact;
    if (loc.pathname.replace(/\/$/, '') === '/challenge') {
      return parseQuery(loc.search);
    }
    return null;
  }

  function setMeta(payload) {
    const summary = summaryLine(payload);
    const pageUrl = global.location.href;
    document.title = `${payload.from}'s challenge — Puzzle Stats`;

    function setMetaTag(attr, key, content) {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    }

    setMetaTag('name', 'description', summary);
    setMetaTag('property', 'og:title', `${payload.from}'s jigsaw challenge`);
    setMetaTag('property', 'og:description', summary);
    setMetaTag('property', 'og:url', pageUrl);
    setMetaTag('name', 'twitter:title', `${payload.from}'s jigsaw challenge`);
    setMetaTag('name', 'twitter:description', summary);
  }

  function renderChallenge(root, payload) {
    setMeta(payload);
    const time = formatTime(payload.ms);
    const mode = modeLabel(payload.mode, payload.people);
    const upcHtml = payload.upc
      ? `<dt>UPC</dt><dd>${escapeHtml(payload.upc)}</dd>`
      : '';

    root.innerHTML = `
      <div class="challenge-card">
        <p class="challenge-eyebrow">Speed puzzle challenge</p>
        <h1 class="challenge-title">${escapeHtml(payload.title)}</h1>
        <p class="challenge-sub">${escapeHtml(puzzleLine(payload))}</p>
        <p class="challenge-time" aria-label="Solve time">${escapeHtml(time)}</p>
        <dl class="challenge-meta">
          <dt>Challenger</dt><dd>${escapeHtml(payload.from)}</dd>
          <dt>Mode</dt><dd>${escapeHtml(mode)}</dd>
          ${upcHtml}
        </dl>
        <p class="challenge-copy">${escapeHtml(summaryLine(payload))}</p>
        <div class="challenge-actions">
          <a href="${escapeAttr(toAppDeepLink(global.location.href))}" class="app-store-btn challenge-open" id="challenge-open-app">Open in Puzzle Stats</a>
          <a href="#" class="app-store-btn app-store-btn--secondary" id="challenge-app-store">Get the app</a>
        </div>
        <p class="challenge-note">Opens this challenge in Puzzle Stats on iOS. No account required.</p>
      </div>
    `;

    const storeBtn = root.querySelector('#challenge-app-store');
    const storeURL = global.CHALLENGE_APP_STORE_URL || '#';
    if (storeBtn) {
      storeBtn.href = storeURL;
    }

    const openBtn = root.querySelector('#challenge-open-app');
    if (openBtn) {
      openBtn.addEventListener('click', function (event) {
        // Safari does not open Universal Links for same-domain taps.
        // Use the custom scheme, then fall back to the App Store if the app is not installed.
        event.preventDefault();
        const deepLink = toAppDeepLink(global.location.href);
        const started = Date.now();
        global.location.href = deepLink;

        const placeholderStore = !storeURL || storeURL === '#' || /id0{5,}/.test(storeURL);
        if (placeholderStore) return;

        setTimeout(function () {
          if (document.hidden || document.webkitHidden) return;
          if (Date.now() - started < 2500) {
            global.location.href = storeURL;
          }
        }, 1600);
      });
    }
  }

  /** Convert https://puzzlestats.app/... → puzzlestats://puzzlestats.app/... */
  function toAppDeepLink(href) {
    try {
      const url = new URL(href);
      url.protocol = 'puzzlestats:';
      return url.toString();
    } catch {
      return href;
    }
  }

  function renderError(root, message) {
    document.title = 'Invalid challenge — Puzzle Stats';
    root.innerHTML = `
      <div class="challenge-card challenge-card--error">
        <p class="challenge-eyebrow">Challenge link</p>
        <h1 class="challenge-title">Couldn&rsquo;t read this challenge</h1>
        <p class="challenge-copy">${escapeHtml(message)}</p>
        <p class="challenge-copy">Ask your friend to share the link again from Puzzle Stats after finishing a timed solve.</p>
        <div class="challenge-actions">
          <a href="/" class="app-store-btn app-store-btn--secondary">Back to Puzzle Stats</a>
        </div>
      </div>
    `;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, '&#39;');
  }

  function bootstrap(options) {
    const root = document.getElementById('challenge-root');
    if (!root) return false;

    const raw = options.raw ?? parseFromLocation(global.location);

    if (!raw) {
      if (options.show404) return false;
      renderError(root, 'No challenge data found in this link.');
      return true;
    }

    const result = validate(raw);
    if (!result.ok) {
      renderError(root, result.error);
      return true;
    }

    renderChallenge(root, result.payload);
    return true;
  }

  global.ChallengeShare = {
    parseQuery,
    parseCompactPath,
    parseFromLocation,
    validate,
    formatTime,
    modeLabel,
    summaryLine,
    bootstrap,
  };
})(typeof window !== 'undefined' ? window : globalThis);
