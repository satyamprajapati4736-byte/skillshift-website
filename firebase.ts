import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDZA0owkbbMoCS6Ls7wOA8IKn_X3ZYeZrk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "skillshift-6abff.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "skillshift-6abff",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "skillshift-6abff.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "753545532989",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:753545532989:web:c1bf27d27181ddce4a3c54"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
