// ============================================================
//  GROVITY — Firebase Initialization
//  Firebase web API keys are designed to be public (client-side).
//  Real security = Firebase Security Rules + API key domain restrictions.
//  Restrict this API key to your domains in Google Cloud Console:
//  console.cloud.google.com → APIs & Services → Credentials
// ============================================================

const firebaseConfig = {
  apiKey:            window.__FB_API_KEY__,
  authDomain:        window.__FB_AUTH_DOMAIN__,
  projectId:         window.__FB_PROJECT_ID__,
  storageBucket:     window.__FB_STORAGE_BUCKET__,
  messagingSenderId: window.__FB_MESSAGING_SENDER_ID__,
  appId:             window.__FB_APP_ID__,
  measurementId:     window.__FB_MEASUREMENT_ID__
};

const appCheckSiteKey = (window.__FB_APPCHECK_SITE_KEY__ || '').trim();
const host = (window.location && window.location.hostname) || '';
const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === '[::1]';

function showBootstrapError(message) {
  window.__grovityBootError = message;
  console.error('Grovity bootstrap error:', message);

  const renderError = function () {
    if (!document.body) {
      return;
    }

    document.body.innerHTML =
      '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#050816;color:#e2e8f0;font-family:Segoe UI,Arial,sans-serif;padding:24px;">' +
      '<div style="max-width:640px;width:100%;border:1px solid #334155;border-radius:14px;background:#0f172a;padding:20px 22px;">' +
      '<h1 style="margin:0 0 10px;font-size:22px;color:#f8fafc;">Configuration Error</h1>' +
      '<p style="margin:0 0 6px;line-height:1.5;color:#cbd5e1;">Unable to start this app because Firebase configuration is missing or invalid.</p>' +
      '<p style="margin:0;line-height:1.5;color:#94a3b8;">If you are the site owner, regenerate and deploy client config before making this build public.</p>' +
      '</div>' +
      '</div>';
  };

  if (document.body) {
    renderError();
  } else {
    document.addEventListener('DOMContentLoaded', renderError, { once: true });
  }
}

const requiredFirebaseFields = [
  'apiKey',
  'authDomain',
  'projectId',
  'appId'
];

const missingFields = requiredFirebaseFields.filter((field) => {
  const value = firebaseConfig[field];
  return typeof value !== 'string' || value.trim().length === 0;
});

if (missingFields.length > 0) {
  showBootstrapError('Missing Firebase fields: ' + missingFields.join(', '));
} else {
  // Initialize Firebase only when required config is present.
  firebase.initializeApp(firebaseConfig);

  if (!appCheckSiteKey && !isLocalHost) {
    showBootstrapError('Missing Firebase App Check site key on non-localhost host.');
    throw new Error('Missing App Check site key for production host.');
  }

  if (firebase.appCheck && typeof firebase.appCheck === 'function' && appCheckSiteKey) {
    const debugToken = (localStorage.getItem('grovity_appcheck_debug_token') || '').trim();
    if (debugToken) {
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken;
    }

    const _fbAppCheck = firebase.appCheck();
    _fbAppCheck.activate(appCheckSiteKey, true);
    window.__fbAppCheck = _fbAppCheck;
  } else if (!isLocalHost) {
    showBootstrapError('Firebase App Check SDK missing or not initialized on non-localhost host.');
    throw new Error('App Check SDK missing for production host.');
  } else {
    console.warn('App Check is not active. Local development fallback is enabled.');
  }

  const _fbAuth = firebase.auth();
  const _fbDb = firebase.firestore();

  // Persist session across tabs
  _fbAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

  // Global helpers used by all pages
  window.__fbAuth = _fbAuth;
  window.__fbDb = _fbDb;
  window.__fbProvider = new firebase.auth.GoogleAuthProvider();

  window.__fbSignOut = function () {
    return _fbAuth.signOut();
  };
}
