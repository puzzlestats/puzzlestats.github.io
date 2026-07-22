/**
 * /download — platform-aware store redirect / soft landing.
 * Query params (all optional): source | utm_source | ref
 */
(function () {
  'use strict';

  var SOURCE_MAX = 40;
  var SOURCE_RE = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,39}$/;

  function readSource(search) {
    var params = new URLSearchParams(search || window.location.search);
    var raw = params.get('source') || params.get('utm_source') || params.get('ref') || '';
    raw = String(raw).trim();
    if (!raw) return null;
    if (!SOURCE_RE.test(raw)) {
      // Soft-sanitize: keep safe chars only
      raw = raw.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, SOURCE_MAX);
      if (!raw || !SOURCE_RE.test(raw)) return null;
    }
    return raw.slice(0, SOURCE_MAX);
  }

  function detectPlatform(ua) {
    ua = ua || navigator.userAgent || '';
    if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
    // iPadOS 13+ desktop UA — treat as iOS when touch + Mac
    if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) return 'ios';
    if (/Android/i.test(ua)) return 'android';
    return 'desktop';
  }

  function withAppStoreCampaign(url, source) {
    if (!url || !source) return url;
    try {
      var u = new URL(url);
      u.searchParams.set('ct', source);
      u.searchParams.set('mt', '8');
      return u.toString();
    } catch (e) {
      return url;
    }
  }

  function withPlayCampaign(url, source) {
    if (!url || !source) return url;
    try {
      var u = new URL(url);
      u.searchParams.set('utm_source', source);
      return u.toString();
    } catch (e) {
      return url;
    }
  }

  function bootstrap() {
    var cfg = window.PUZZLESTATS || {};
    var source = readSource();
    var platform = detectPlatform();
    var appURL = withAppStoreCampaign(cfg.appStoreURL || null, source);
    var playURL = withPlayCampaign(cfg.playStoreURL || null, source);

    var root = document.getElementById('download-root');
    if (root) {
      if (source) root.setAttribute('data-source', source);
      else root.removeAttribute('data-source');
      root.setAttribute('data-platform', platform);
    }

    var sourceEl = document.getElementById('download-source');
    if (sourceEl) {
      if (source) {
        sourceEl.hidden = false;
        sourceEl.textContent = 'Via ' + source;
      } else {
        sourceEl.hidden = true;
        sourceEl.textContent = '';
      }
    }

    // Fast redirect when a matching store URL exists
    if (platform === 'ios' && appURL) {
      window.location.replace(appURL);
      return;
    }
    if (platform === 'android' && playURL) {
      window.location.replace(playURL);
      return;
    }

    // Soft landing: desktop, or mobile with missing store URL
    var status = document.getElementById('download-status');
    var landing = document.getElementById('download-landing');
    if (status) status.hidden = true;
    if (landing) landing.hidden = false;

    if (appURL) cfg.appStoreURL = appURL;
    if (playURL) cfg.playStoreURL = playURL;
    if (typeof cfg.hydrateStoreBadges === 'function') {
      cfg.hydrateStoreBadges(landing || document);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
