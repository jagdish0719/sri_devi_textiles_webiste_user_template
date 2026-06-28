/**
 * Firebase + Firestore initialization (compat SDK).
 * Exposes window.sdFirestore for script.js product operations.
 */
(function () {
  const config = window.FIREBASE_CONFIG;
  if (!config || !config.projectId || config.apiKey === 'YOUR_API_KEY') {
    console.warn('[Sri Devi] Firebase config missing — set firebase-config.js. Products will fall back to localStorage.');
    return;
  }

  if (typeof firebase === 'undefined') {
    console.error('[Sri Devi] Firebase SDK not loaded. Add firebase-app-compat and firebase-firestore-compat scripts before firebase.js.');
    return;
  }

  firebase.initializeApp(config);
  window.sdFirestore = firebase.firestore();
  window.SD_FIRESTORE_COLLECTIONS = { products: 'products' };
})();
