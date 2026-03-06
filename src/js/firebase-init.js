// ============================================================
//  GROVITY — Firebase Initialization (DEPRECATED)
//  ⚠️  USE firebase-init-secure.js INSTEAD
//  This file is kept for backward compatibility only
//  
//  Load environment variables securely:
//  1. Copy .env.example to .env.local
//  2. Fill in your Firebase credentials from Firebase Console
//  3. Reference firebase-init-secure.js in your HTML files
// ============================================================

// Redirect to secure version
console.warn('❌ firebase-init.js is deprecated! Use firebase-init-secure.js instead.');
console.warn('📖 See SETUP_GUIDE.md for secure setup instructions.');

// Load from environment variables set by config-loader.js
const firebaseConfig = {
  apiKey:            window.__FB_API_KEY__ || "",
  authDomain:        window.__FB_AUTH_DOMAIN__ || "",
  projectId:         window.__FB_PROJECT_ID__ || "",
  storageBucket:     window.__FB_STORAGE_BUCKET__ || "",
  messagingSenderId: window.__FB_MESSAGING_SENDER_ID__ || "",
  appId:             window.__FB_APP_ID__ || "",
  measurementId:     window.__FB_MEASUREMENT_ID__ || ""
};

if (firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('FIREBASE_')) {
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
} else {
  console.error('❌ Firebase config not properly loaded. Please set up .env.local file.');
}
