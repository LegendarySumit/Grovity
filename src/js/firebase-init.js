// ============================================================
//  GROVITY — Firebase Initialization
//  Fill in your config from Firebase Console:
//  Project Settings → Your apps → SDK setup and configuration
// ============================================================

const firebaseConfig = {
  apiKey:            "",
  authDomain:        "grovity-6082a.firebaseapp.com",
  projectId:         "grovity-6082a",
  storageBucket:     "grovity-6082a.firebasestorage.app",
  messagingSenderId: "395240545634",
  appId:             "1:395240545634:web:838ce79996fb9683ad603b",
  measurementId:     "G-P18QT7DTMQ"
};

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
