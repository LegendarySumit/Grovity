// ============================================================
//  GROVITY — Firebase Initialization (EXAMPLE)
//
//  1. Copy this file and rename to: firebase-init.js
//  2. Fill in your values from Firebase Console:
//     Project Settings → Your apps → SDK setup and configuration
//  3. firebase-init.js is in .gitignore and will NOT be committed
// ============================================================

const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId:             "YOUR_APP_ID",
  measurementId:     "YOUR_MEASUREMENT_ID"
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
