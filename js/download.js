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

  function track(event, payload) {
    var cfg = window.PUZZLESTATS || {};
    if (typeof cfg.track === 'function') cfg.track(event, payload);
  }

  function campaign(fn, url, source) {
    var cfg = window.PUZZLESTATS || {};
    return typeof cfg[fn] === 'function' ? cfg[fn](url, source) : url;
  }

  function bootstrap() {
    var cfg = window.PUZZLESTATS || {};
    var source = readSource();
    var platform = detectPlatform();
    var appURL = campaign('withAppStoreCampaign', cfg.appStoreURL || null, source);
    var playURL = campaign('withPlayCampaign', cfg.playStoreURL || null, source);

    track('download_page_view', { source: source || 'direct', platform: platform });

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
      track('store_redirect', { platform: 'ios', source: source || 'direct' });
      window.location.replace(appURL);
      return;
    }
    if (platform === 'android' && playURL) {
      track('store_redirect', { platform: 'android', source: source || 'direct' });
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

    (landing || document).querySelectorAll('a[data-store]').forEach(function (el) {
      el.addEventListener('click', function () {
        track('store_click', {
          platform: el.getAttribute('data-store') === 'play' ? 'android' : 'ios',
          source: source || 'direct',
        });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
