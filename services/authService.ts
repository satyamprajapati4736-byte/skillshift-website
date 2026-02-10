import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  User as FirebaseUser
} from "firebase/auth";
import { auth } from "../firebase";
import { User, Gender } from "../types";
import { dbService } from "./dbService";

// Map phone number to a virtual email for Firebase Auth
const getVirtualEmail = (phone: string) => `${phone.trim()}@skillshift.internal`;

export const authService = {
  signUpWithPhone: async (name: string, phone: string, gender: Gender, password: string, recoveryEmail: string): Promise<User> => {
    const email = getVirtualEmail(phone);
    const result = await createUserWithEmailAndPassword(auth, email, password);
    // After Auth success, create the Firestore profile
    const user = await dbService.createProfile(result.user.uid, name, phone, gender, recoveryEmail);
    localStorage.setItem('skillshift_current_user', JSON.stringify(user));
    return user;
  },

  signInWithPhone: async (phone: string, password: string): Promise<User> => {
    const email = getVirtualEmail(phone);
    const result = await signInWithEmailAndPassword(auth, email, password);
    const profile = await dbService.getUserProfile(result.user.uid);
    if (!profile) throw new Error("Database profile found nahi hua. Admin se contact karein.");
    localStorage.setItem('skillshift_current_user', JSON.stringify(profile));
    return profile;
  },

  resetPassword: async (phone: string): Promise<void> => {
    const profile = await dbService.getProfileByPhone(phone);
    if (!profile || !profile.recoveryEmail) {
      throw new Error("Is number ke liye recovery email set nahi hai.");
    }
    
    if (profile.role === 'admin') {
      throw new Error("Admin password reset restricted.");
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