import { 
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

export const authService = {
  loginWithGoogle: async (): Promise<void> => {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error: any) {
      console.error("Google Auth Request Error:", error);
      throw error;
    }
  },

  handleRedirectResult: async (): Promise<User | null> => {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        const fbUser = result.user;
        // The App.tsx listener will handle fetching/creating profile
        // but we can proactively ensure profile exists here too.
        const profile = await dbService.getUserProfile(fbUser.uid);
        const finalUser = profile || await dbService.createProfile(
          fbUser.uid,
          fbUser.displayName || "User", 
          fbUser.phoneNumber || "", 
          'Other'
        );
        localStorage.setItem(SESSION_KEY, JSON.stringify(finalUser));
        return finalUser;
      }
      return null;
    } catch (error: any) {
      console.error("Redirect handling error:", error);
      return null;
    }
  },

  signUpWithEmail: async (email: string, pass: string, name: string, gender: Gender, phone: string): Promise<User> => {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    const user = await dbService.createProfile(result.user.uid, name, phone, gender);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  },

  signInWithEmail: async (email: string, pass: string): Promise<User> => {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    const profile = await dbService.getUserProfile(result.user.uid);
    if (!profile) throw new Error("Profile document missing.");
    localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
    return profile;
  },

  logout: async () => {
    await signOut(auth);
    localStorage.removeItem(SESSION_KEY);
    // Force a small reload or state clear is often safer for complex auth apps
  },

  getCurrentUser: (): User | null => {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) return null;
    try {
      return JSON.parse(session);
    } catch {
      return null;
    }
  },

  onAuthUpdate: (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
  }
};