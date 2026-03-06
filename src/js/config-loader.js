// ============================================================
//  GROVITY — Config Loader
//  
//  Loads Firebase credentials from environment variables.
//  This must be loaded BEFORE firebase-init-secure.js
//
//  Development: Reads from localStorage (user configures via setup script)
//  Vercel: Credentials injected at build time via environment variables
// ============================================================

(function() {
  // In Vercel production build, use __ENV__ object injected by build script
  // In development, check localStorage for dev credentials
  
  const envConfig = window.__ENV__ || {};
  
  window.__FB_API_KEY__ = envConfig.VITE_FIREBASE_API_KEY || localStorage.getItem('fb_api_key') || '';
  window.__FB_AUTH_DOMAIN__ = envConfig.VITE_FIREBASE_AUTH_DOMAIN || localStorage.getItem('fb_auth_domain') || '';
  window.__FB_PROJECT_ID__ = envConfig.VITE_FIREBASE_PROJECT_ID || localStorage.getItem('fb_project_id') || '';
  window.__FB_STORAGE_BUCKET__ = envConfig.VITE_FIREBASE_STORAGE_BUCKET || localStorage.getItem('fb_storage_bucket') || '';
  window.__FB_MESSAGING_SENDER_ID__ = envConfig.VITE_FIREBASE_MESSAGING_SENDER_ID || localStorage.getItem('fb_messaging_sender_id') || '';
  window.__FB_APP_ID__ = envConfig.VITE_FIREBASE_APP_ID || localStorage.getItem('fb_app_id') || '';
  window.__FB_MEASUREMENT_ID__ = envConfig.VITE_FIREBASE_MEASUREMENT_ID || localStorage.getItem('fb_measurement_id') || '';
  
  console.log('✓ Firebase config loaded');
})();
