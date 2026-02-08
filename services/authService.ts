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
      if (result && result.user) {
        const fbUser = result.user;
        const profile = await dbService.getUserProfile(fbUser.uid);
        if (profile) return profile;
        
        return await dbService.createProfile(
          fbUser.uid,
          fbUser.displayName || "User", 
          fbUser.phoneNumber || "", 
          'Other'
        );
      }
      return null;
    } catch (error: any) {
      console.error("Redirect handling error:", error);
      return null;
    }
  },

  signUpWithEmail: async (email: string, pass: string, name: string, gender: Gender, phone: string): Promise<User> => {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    return await dbService.createProfile(result.user.uid, name, phone, gender);
  },

  signInWithEmail: async (email: string, pass: string): Promise<User> => {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    const profile = await dbService.getUserProfile(result.user.uid);
    if (!profile) throw new Error("Profile document not found.");
    return profile;
  },

  logout: async () => {
    await signOut(auth);
    localStorage.removeItem('skillshift_current_user');
  },

  onAuthUpdate: (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
  }
};