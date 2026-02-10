import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  getRedirectResult,
  signInWithRedirect,
  User as FirebaseUser
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { User, Gender } from "../types";
import { dbService } from "./dbService";

// Map phone number to a virtual email for Firebase Auth
const getVirtualEmail = (phone: string) => `${phone.trim()}@skillshift.internal`;

export const authService = {
  loginWithGoogle: async (): Promise<void> => {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error: any) {
      console.error("Google Login Error:", error);
      throw error;
    }
  },

  handleRedirectResult: async (): Promise<User | null> => {
    try {
      const result = await getRedirectResult(auth);
      if (result?.user) {
        const fbUser = result.user;
        let profile = await dbService.getUserProfile(fbUser.uid);
        
        if (!profile) {
          // If no profile exists, create one using Google info
          profile = await dbService.createProfile(
            fbUser.uid,
            fbUser.displayName || "User",
            fbUser.phoneNumber || "", // Google might not provide this
            'Other',
            fbUser.email || ""
          );
        }
        
        localStorage.setItem('skillshift_current_user', JSON.stringify(profile));
        return profile;
      }
      return null;
    } catch (error: any) {
      console.error("Redirect Error:", error);
      return null;
    }
  },

  signUpWithPhone: async (name: string, phone: string, gender: Gender, password: string, recoveryEmail: string): Promise<User> => {
    try {
      const email = getVirtualEmail(phone);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = await dbService.createProfile(result.user.uid, name, phone, gender, recoveryEmail);
      localStorage.setItem('skillshift_current_user', JSON.stringify(user));
      return user;
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error("Is number se account pehle se bana hai.");
      }
      throw error;
    }
  },

  signInWithPhone: async (phone: string, password: string): Promise<User> => {
    try {
      const email = getVirtualEmail(phone);
      const result = await signInWithEmailAndPassword(auth, email, password);
      const profile = await dbService.getUserProfile(result.user.uid);
      if (!profile) throw new Error("Profile found nahi hua.");
      localStorage.setItem('skillshift_current_user', JSON.stringify(profile));
      return profile;
    } catch (error: any) {
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        throw new Error("Phone ya password galat hai.");
      }
      throw error;
    }
  },

  resetPassword: async (phone: string): Promise<void> => {
    const profile = await dbService.getProfileByPhone(phone);
    if (!profile || !profile.recoveryEmail) {
      throw new Error("Is number ke liye recovery email set nahi hai.");
    }
    if (profile.role === 'admin') throw new Error("Admin password reset restricted.");
    await sendPasswordResetEmail(auth, profile.recoveryEmail);
  },

  logout: async () => {
    await signOut(auth);
    localStorage.removeItem('skillshift_current_user');
  },

  onAuthUpdate: (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
  }
};
