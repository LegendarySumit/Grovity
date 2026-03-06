// ============================================================
//  GROVITY — Firebase Initialization with Environment Variables
//  
//  This file loads Firebase config from environment variables
//  For development: Create .env.local with your firebase credentials
//  For Vercel: Set environment variables in Vercel dashboard
// ============================================================

// Load Firebase config from environment (set by build process or Vercel)
const firebaseConfig = {
  apiKey:            window.__FB_API_KEY__ || "FIREBASE_API_KEY",
  authDomain:        window.__FB_AUTH_DOMAIN__ || "FIREBASE_AUTH_DOMAIN",
  projectId:         window.__FB_PROJECT_ID__ || "FIREBASE_PROJECT_ID",
  storageBucket:     window.__FB_STORAGE_BUCKET__ || "FIREBASE_STORAGE_BUCKET",
  messagingSenderId: window.__FB_MESSAGING_SENDER_ID__ || "FIREBASE_MESSAGING_SENDER_ID",
  appId:             window.__FB_APP_ID__ || "FIREBASE_APP_ID",
  measurementId:     window.__FB_MEASUREMENT_ID__ || "FIREBASE_MEASUREMENT_ID"
};

// Verify Firebase config is properly set (warn in console if not)
const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingFields = requiredFields.filter(field => !firebaseConfig[field] || firebaseConfig[field].includes('FIREBASE_'));

if (missingFields.length > 0) {
  console.warn('⚠️  Firebase configuration incomplete. Missing: ' + missingFields.join(', '));
}

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
