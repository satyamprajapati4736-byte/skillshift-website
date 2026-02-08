
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDZA0owkbbMoCS6Ls7wOA8IKn_X3ZYeZrk",
  authDomain: "skillshift-6abff.firebaseapp.com",
  projectId: "skillshift-6abff",
  storageBucket: "skillshift-6abff.firebasestorage.app",
  messagingSenderId: "753545532989",
  appId: "1:753545532989:web:c1bf27d27181ddce4a3c54"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
