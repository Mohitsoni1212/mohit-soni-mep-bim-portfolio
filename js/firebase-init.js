/* ========================================================
   Firebase init (compat SDK) — shared by every page.
   Loaded AFTER the firebase-*-compat.js CDN scripts.
   ======================================================== */
(function () {
  const firebaseConfig = {
    apiKey: "AIzaSyBYiNbrnKzRGkiW9BewYu_eWXp7s6N0RJI",
    authDomain: "mohit-soni-portflio.firebaseapp.com",
    projectId: "mohit-soni-portflio",
    storageBucket: "mohit-soni-portflio.firebasestorage.app",
    messagingSenderId: "866490712333",
    appId: "1:866490712333:web:8566dd191b9b1cb103f044",
    measurementId: "G-586F80QJN0",
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  window.FB = {};
  if (firebase.auth) {
    FB.auth = firebase.auth();
    FB.googleProvider = new firebase.auth.GoogleAuthProvider();
  }
  if (firebase.firestore) {
    FB.db = firebase.firestore();
  }
  if (firebase.storage) {
    FB.storage = firebase.storage();
  }

  // ============================================
  // Sirf ye email(s) hi admin panel me login kar payengi.
  // Firebase Console -> Authentication -> Users me add ki hui
  // email(s) yaha bhi honi chahiye.
  // ============================================
  FB.ADMIN_EMAILS = ["mohitsoni2241@gmail.com"];
})();
