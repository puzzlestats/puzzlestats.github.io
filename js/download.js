/**
 * /download — store links + ?source= traffic attribution.
 *
 * Usage: https://puzzlestats.app/download?source=instagram
 * Recommended source values: lowercase, hyphens (e.g. homepage, challenge, discord, qr-flyer).
 *
 * Attribution:
 * - Sanitized source is kept in sessionStorage
 * - Appended to App Store as ct= (Apple campaign token)
 * - Appended to Play Store as referrer utm_source=
 * - Optional window.dataLayer push for future analytics
 */
(function () {
  'use strict';

  var SOURCE_KEY = 'ps_download_source';
  var MAX_SOURCE_LEN = 64;

  function sanitizeSource(raw) {
    if (!raw || typeof raw !== 'string') return '';
    var s = raw.trim().slice(0, MAX_SOURCE_LEN);
    if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(s)) return '';
    return s.toLowerCase();
  }

  function readSource() {
    var params = new URLSearchParams(window.location.search);
    var fromQuery = sanitizeSource(params.get('source'));
    if (fromQuery) {
      try {
        sessionStorage.setItem(SOURCE_KEY, fromQuery);
      } catch (_) { /* private mode */ }
      return fromQuery;
    }
    try {
      return sanitizeSource(sessionStorage.getItem(SOURCE_KEY) || '');
    } catch (_) {
      return '';
    }
  }

  function withAppStoreCampaign(url, source) {
    if (!url || !source) return url;
    try {
      var u = new URL(url);
      u.searchParams.set('ct', source);
      u.searchParams.set('mt', '8');
      return u.toString();
    } catch (_) {
      return url;
    }
  }

  function withPlayReferrer(url, source) {
    if (!url || !source) return url;
    try {
      var u = new URL(url);
      var referrer = 'utm_source=' + encodeURIComponent(source) + '&utm_medium=download_page';
      u.searchParams.set('referrer', referrer);
      return u.toString();
    } catch (_) {
      return url;
    }
  }

  function pushAnalytics(event, payload) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: event }, payload));
  }

  function wireStoreLink(el, href, platform, source, options) {
    if (!el) return;
    options = options || {};
    if (options.comingSoon || !href) {
      el.classList.add('store-card--disabled');
      el.removeAttribute('href');
      el.setAttribute('role', 'link');
      el.setAttribute('aria-disabled', 'true');
      el.addEventListener('click', function (e) {
        e.preventDefault();
      });
      return;
    }
    el.href = href;
    el.addEventListener('click', function () {
      pushAnalytics('store_click', { platform: platform, source: source || 'direct' });
    });
  }

  function init() {
    var cfg = window.PUZZLESTATS || {};
    var source = readSource();
    var iosURL = withAppStoreCampaign(cfg.appStoreURL || '', source);
    var androidURL = cfg.playStoreURL || '';
    var androidReady = !!cfg.playStoreAvailable && !!androidURL;

    wireStoreLink(
      document.getElementById('download-ios'),
      iosURL,
      'ios',
      source
    );

    var androidEl = document.getElementById('download-android');
    if (!androidReady) {
      var label = document.getElementById('android-label');
      var name = document.getElementById('android-name');
      if (label) label.textContent = 'Coming soon on';
      if (name) name.textContent = 'Google Play';
      wireStoreLink(androidEl, '', 'android', source, { comingSoon: true });
    } else {
      wireStoreLink(
        androidEl,
        withPlayReferrer(androidURL, source),
        'android',
        source
      );
    }

    var sourceEl = document.getElementById('download-source');
    if (sourceEl && source) {
      sourceEl.hidden = false;
      sourceEl.textContent = 'Via ' + source;
    }

    pushAnalytics('download_page_view', { source: source || 'direct' });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
