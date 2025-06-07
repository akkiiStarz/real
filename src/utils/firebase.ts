import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
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

// Ensure persistent login
setPersistence(auth, browserLocalPersistence);

export default app;
