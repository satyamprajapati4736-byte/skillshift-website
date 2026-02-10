
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  getRedirectResult,
  signInWithPopup,
  User as FirebaseUser
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { User, Gender } from "../types";
import { dbService } from "./dbService";

// Map phone number to a virtual email for Firebase Auth
const getVirtualEmail = (phone: string) => `${phone.trim()}@skillshift.internal`;

export const authService = {
  loginWithGoogle: async (): Promise<User> => {
    try {
      // Using Popup for that "Login Panel" experience
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      
      // Check if user already has a profile
      let profile = await dbService.getUserProfile(fbUser.uid);
      
      if (!profile) {
        // Create new profile if it doesn't exist
        profile = await dbService.createProfile(
          fbUser.uid,
          fbUser.displayName || "User",
          "", // Phone unknown from Google usually
          'Other',
          fbUser.email || ""
        );
      }
      
      localStorage.setItem('skillshift_current_user', JSON.stringify(profile));
      return profile;
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
          profile = await dbService.createProfile(fbUser.uid, fbUser.displayName || "User", "", 'Other', fbUser.email || "");
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
    const email = getVirtualEmail(phone);
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = await dbService.createProfile(result.user.uid, name, phone, gender, recoveryEmail);
    localStorage.setItem('skillshift_current_user', JSON.stringify(user));
    return user;
  },

  signInWithPhone: async (phone: string, password: string): Promise<User> => {
    const email = getVirtualEmail(phone);
    const result = await signInWithEmailAndPassword(auth, email, password);
    const profile = await dbService.getUserProfile(result.user.uid);
    if (!profile) throw new Error("Profile creation skipped? Please contact support.");
    localStorage.setItem('skillshift_current_user', JSON.stringify(profile));
    return profile;
  },

  resetPassword: async (phone: string): Promise<void> => {
    const profile = await dbService.getProfileByPhone(phone);
    if (!profile || !profile.recoveryEmail) {
      throw new Error("Is number ke liye koi recovery email nahi mili.");
    }
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
