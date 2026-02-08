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
      console.error("Google Auth Error:", error);
      throw error;
    }
  },

  handleRedirectResult: async (): Promise<User | null> => {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        const fbUser = result.user;
        const user = await dbService.createProfile(
          fbUser.uid,
          fbUser.displayName || "User", 
          fbUser.phoneNumber || "", 
          'Other'
        );
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        return user;
      }
      return null;
    } catch (error: any) {
      console.error("Redirect Error:", error);
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
    if (!profile) throw new Error("Profile not found in database.");
    localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
    return profile;
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