import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBsb5CVctqMfWffxhtVZ2GQAIhptKZ4Od8",
  authDomain: "foodshare-jscorp.firebaseapp.com",
  projectId: "foodshare-jscorp",
  storageBucket: "foodshare-jscorp.firebasestorage.app",
  messagingSenderId: "603029864068",
  appId: "1:603029864068:web:5ef613425f7d3e67e3ccd1",
  measurementId: "G-N3F98S9NEB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
