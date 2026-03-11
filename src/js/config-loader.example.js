// ============================================================
//  GROVITY — Config Loader (EXAMPLE)
//  
//  IMPORTANT: Copy this to config-loader.js and fill in your
//  Firebase credentials from Firebase Console
//
//  DO NOT COMMIT config-loader.js to GitHub (it contains secrets!)
//  This file is .gitignored
// ============================================================

(function() {
  // Firebase credentials for Grovity
  // Get these from: Firebase Console → Project Settings
  const firebaseConfig = {
    'fb_api_key': 'YOUR_API_KEY_HERE',
    'fb_auth_domain': 'YOUR_PROJECT.firebaseapp.com',
    'fb_project_id': 'YOUR_PROJECT_ID',
    'fb_storage_bucket': 'YOUR_PROJECT.firebasestorage.app',
    'fb_messaging_sender_id': 'YOUR_SENDER_ID',
    'fb_app_id': 'YOUR_APP_ID',
    'fb_measurement_id': 'YOUR_MEASUREMENT_ID'
  };

  // Set window variables for Firebase initialization
  window.__FB_API_KEY__ = firebaseConfig.fb_api_key;
  window.__FB_AUTH_DOMAIN__ = firebaseConfig.fb_auth_domain;
  window.__FB_PROJECT_ID__ = firebaseConfig.fb_project_id;
  window.__FB_STORAGE_BUCKET__ = firebaseConfig.fb_storage_bucket;
  window.__FB_MESSAGING_SENDER_ID__ = firebaseConfig.fb_messaging_sender_id;
  window.__FB_APP_ID__ = firebaseConfig.fb_app_id;
  window.__FB_MEASUREMENT_ID__ = firebaseConfig.fb_measurement_id;
  
  console.log('✓ Firebase config loaded');
})();
