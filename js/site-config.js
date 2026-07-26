/** Site-wide config — update store URLs when apps are live. */
window.PUZZLESTATS = {
  bundleID: 'app.puzzlestats.puzzlestats',
  /** Apple Developer Team ID — used in apple-app-site-association. */
  appleTeamID: 'QNLTJP653X',
  /** App Store link for "Get the app" / download buttons. */
  appStoreURL: 'https://apps.apple.com/app/puzzle-stats/id0000000000',
  /**
   * Google Play link (set when Android ships).
   * Leave empty and playStoreAvailable false until published.
   */
  playStoreURL: '',
  playStoreAvailable: false,
  /** Canonical download landing page (supports ?source= for attribution). */
  downloadURL: 'https://puzzlestats.app/download',
};

window.CHALLENGE_APP_STORE_URL = window.PUZZLESTATS.appStoreURL;
