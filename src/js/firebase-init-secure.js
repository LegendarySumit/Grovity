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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const _fbAuth = firebase.auth();
const _fbDb = firebase.firestore();

// Persist session across tabs
_fbAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

// Global helpers used by all pages
window.__fbAuth     = _fbAuth;
window.__fbDb       = _fbDb;
window.__fbProvider = new firebase.auth.GoogleAuthProvider();

window.__fbSignOut = function () {
  return _fbAuth.signOut();
};
