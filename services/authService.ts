import { 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { User, Gender } from "../types";
import { dbService } from "./dbService";

const SESSION_KEY = 'skillshift_current_user';

const handleAuthError = (error: any) => {
  console.error("Firebase Auth Error Full Object:", error);
  const errorCode = error.code || 'unknown-error';
  
  if (errorCode === 'auth/unauthorized-domain' || 
      error.message?.toLowerCase().includes('unauthorized domain')) {
    const detected = window.location.hostname;
    throw new Error(`AUTH_DOMAIN_ERROR:${detected}`);
  }
  
  // Return the specific error code to show the user
  throw new Error(`AUTH_FAILED:${errorCode}`);
};

export const authService = {
  loginWithGoogle: async (): Promise<void> => {
    try {
      // Use Redirect instead of Popup for 100% mobile success
      await signInWithRedirect(auth, googleProvider);
    } catch (error: any) {
      handleAuthError(error);
    }
  },

  handleRedirectResult: async (): Promise<User | null> => {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        const fbUser = result.user;
        const user = await dbService.createProfile(
          fbUser.uid,
          fbUser.displayName || "Anonymous", 
          fbUser.phoneNumber || "0000000000", 
          'Other'
        );
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        return user;
      }
      return null;
    } catch (error: any) {
      handleAuthError(error);
      return null;
    }
  },

  signUpWithEmail: async (email: string, pass: string, name: string, gender: Gender, phone: string): Promise<User> => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      const user = await dbService.createProfile(result.user.uid, name, phone, gender);
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return user;
    } catch (error: any) {
      return handleAuthError(error);
    }
  },

  signInWithEmail: async (email: string, pass: string): Promise<User> => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      let existing = await dbService.getUserProfile(result.user.uid);
      
      if (!existing) {
        existing = {
          id: result.user.uid,
          name: result.user.displayName || "User",
          phone: "0000000000",
          gender: "Other" as Gender,
          role: 'user',
          created_at: new Date().toISOString()
        };
      }
      
      localStorage.setItem(SESSION_KEY, JSON.stringify(existing));
      return existing as User;
    } catch (error: any) {
      return handleAuthError(error);
    }
  },

  logout: async () => {
    await signOut(auth);
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser: (): User | null => {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  },

  onAuthUpdate: (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
  }
};