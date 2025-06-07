import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyA_d54znicJChDZkypDWUeSiyF7YZ_4kh8",
  authDomain: "estatexd4p.firebaseapp.com",
  projectId: "estatexd4p",
  storageBucket: "estatexd4p.firebasestorage.app",
  messagingSenderId: "798515867658",
  appId: "1:798515867658:web:163b9527971326a771eff3",
  measurementId: "G-W79NXY0F0K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

/* Disable offline persistence to avoid multiple tabs and IndexedDB version issues */
// Commenting out persistence enablement to prevent errors
/*
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one tab at a time.
    console.warn('Firestore persistence failed: Multiple tabs open');
  } else if (err.code === 'unimplemented') {
    // The browser does not support all features required to enable persistence
    console.warn('Firestore persistence is not available in this browser');
  } else {
    console.error('Error enabling Firestore persistence:', err);
  }
});
*/

export default app;
