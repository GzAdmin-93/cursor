// ============================
// 🔥 SHARED FIREBASE CONFIG
// ============================

// Firebase is loaded globally via script tags in the HTML
// We just need to export the initialized instances

const firebaseConfig = {
  apiKey: "AIzaSyCGCgjRdDecwdBZVai_SI-vtufFoZIMiGM",
  authDomain: "groundzy-live.firebaseapp.com",
  databaseURL: "https://groundzy-live-default-rtdb.firebaseio.com/",
  projectId: "groundzy-live",
  storageBucket: "groundzy-live.firebasestorage.app",
  messagingSenderId: "475442443428",
  appId: "1:475442443428:web:ef4f84e078e2112c452231",
  measurementId: "G-TVMP6LSH6X",
};

// Initialize Firebase if not already initialized
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const storage = firebase.storage();

// Only export db and storage - firebase is available globally
export { db, storage }; 