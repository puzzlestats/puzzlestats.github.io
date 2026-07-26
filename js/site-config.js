/** Site-wide config — set store URLs when the app is live. */
window.PUZZLESTATS = {
  bundleID: 'app.puzzlestats.puzzlestats',
  /** Apple Developer Team ID — used in apple-app-site-association (replace when known). */
  appleTeamID: 'QNLTJP653X',
  /**
   * App Store / Play Store links for download CTAs.
   * Leave null until the listing is live — UI shows “Coming soon” placeholders.
   * Do not use fake or placeholder store IDs.
   */
  appStoreURL: 'https://apps.apple.com/app/puzzle-stats/id6787608046',
  playStoreURL: null,
};

window.CHALLENGE_APP_STORE_URL = window.PUZZLESTATS.appStoreURL;

/**
 * Campaign attribution. `source` is a short token (homepage, challenge, qrcode…)
 * appended to store URLs so installs can be traced back to where the link ran.
 * Apple reads `ct=`; Play only reads campaign data from its `referrer` payload.
 */
window.PUZZLESTATS.withAppStoreCampaign = function (url, source) {
  if (!url || !source) return url;
  try {
    const u = new URL(url);
    u.searchParams.set('ct', source);
    u.searchParams.set('mt', '8');
    return u.toString();
  } catch (e) {
    return url;
  }
};

window.PUZZLESTATS.withPlayCampaign = function (url, source) {
  if (!url || !source) return url;
  try {
    const u = new URL(url);
    u.searchParams.set('referrer', 'utm_source=' + source + '&utm_medium=download_page');
    return u.toString();
  } catch (e) {
    return url;
  }
};

/** Analytics sink — stays a no-op queue until a tag manager is installed. */
window.PUZZLESTATS.track = function (event, payload) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(Object.assign({ event: event }, payload || {}));
};

/**
 * Wire store CTAs: turn Coming soon placeholders into live links when URLs are set.
 * Targets [data-store="app"] and [data-store="play"].
 * Already-live <a> tags are synced to the configured URL; placeholders are upgraded.
 * Pass `source` to tag the resulting links with a campaign token.
 */
window.PUZZLESTATS.hydrateStoreBadges = function (root, source) {
  const cfg = window.PUZZLESTATS;
  const scope = root || document;
  const map = {
    app: cfg.withAppStoreCampaign(cfg.appStoreURL, source),
    play: cfg.withPlayCampaign(cfg.playStoreURL, source),
  };
  const liveLabel = { app: 'Download on the', play: 'Get it on' };

  Object.keys(map).forEach(function (key) {
    const url = map[key];
    if (!url) return;

    scope.querySelectorAll('[data-store="' + key + '"]').forEach(function (el) {
      if (el.tagName === 'A') {
        el.href = url;
        el.target = '_blank';
        el.rel = 'noopener noreferrer';
        el.className = el.className.replace(/\bstore-badge--soon\b/g, '').trim();
        el.removeAttribute('aria-disabled');
        const label = el.querySelector('.store-badge-label');
        if (label) label.textContent = liveLabel[key];
        return;
      }

      const link = document.createElement('a');
      link.href = url;
      link.className = el.className.replace(/\bstore-badge--soon\b/g, '').trim();
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('data-store', key);
      link.innerHTML = el.innerHTML;
      const label = link.querySelector('.store-badge-label');
      if (label) label.textContent = liveLabel[key];
      el.replaceWith(link);
    });
  });

  const barLabel = scope.querySelector('.mobile-store-bar-label');
  if (barLabel && cfg.appStoreURL) {
    barLabel.textContent = cfg.playStoreURL
      ? 'Puzzle Stats · Get the app'
      : 'Puzzle Stats · Available on iOS';
  }
};
