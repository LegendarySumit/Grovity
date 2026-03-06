// ============================================================
//  GROVITY — Firebase Initialization
//  Firebase web API keys are designed to be public (client-side).
//  Real security = Firebase Security Rules + API key domain restrictions.
//  Restrict this API key to your domains in Google Cloud Console:
//  console.cloud.google.com → APIs & Services → Credentials
// ============================================================

const firebaseConfig = {
  apiKey:            "AIzaSyDTgnJSXasDvz3qI491vR_GbphQmd254lQ",
  authDomain:        "grovity-6082a.firebaseapp.com",
  projectId:         "grovity-6082a",
  storageBucket:     "grovity-6082a.firebasestorage.app",
  messagingSenderId: "395240545634",
  appId:             "1:395240545634:web:838ce79996fb9683ad603b",
  measurementId:     "G-P18QT7DTMQ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const _fbAuth = firebase.auth();

// Persist session across tabs
_fbAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

// Global helpers used by all pages
window.__fbAuth     = _fbAuth;
window.__fbProvider = new firebase.auth.GoogleAuthProvider();

window.__fbSignOut = function () {
  return _fbAuth.signOut();
};
