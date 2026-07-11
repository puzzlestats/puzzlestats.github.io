/** Site-wide config — update App Store URL when the app is live. */
window.PUZZLESTATS = {
  bundleID: 'app.puzzlestats.puzzlestats',
  /** Apple Developer Team ID — used in apple-app-site-association (replace when known). */
  appleTeamID: 'QNLTJP653X',
  /** App Store link for "Get the app" buttons. */
  appStoreURL: 'https://apps.apple.com/app/puzzle-stats/id0000000000',
};

window.CHALLENGE_APP_STORE_URL = window.PUZZLESTATS.appStoreURL;
