
import { 
  signInWithPopup, 
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
  loginWithGoogle: async (): Promise<User> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      
      const user = await dbService.createProfile(
        fbUser.displayName || "Anonymous", 
        fbUser.phoneNumber || "0000000000", 
        'Other'
      );
      
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return user;
    } catch (error: any) {
      if (error.code === 'auth/unauthorized-domain') {
        throw new Error("Domain Unauthorized: Please add your Netlify URL to Firebase Console > Authentication > Settings > Authorized Domains.");
      }
      throw error;
    }
  },

  signUpWithEmail: async (email: string, pass: string, name: string, gender: Gender, phone: string): Promise<User> => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      const user = await dbService.createProfile(name, phone, gender);
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return user;
    } catch (error: any) {
      if (error.code === 'auth/unauthorized-domain') {
        throw new Error("Domain Unauthorized: Please add your Netlify URL to Firebase Console.");
      }
      throw error;
    }
  },

  signInWithEmail: async (email: string, pass: string): Promise<User> => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      const users = dbService.getAllUsers();
      const existing = users.find(u => u.name === result.user.displayName) || {
        id: result.user.uid,
        name: result.user.displayName || "User",
        phone: "0000000000",
        gender: "Other" as Gender,
        role: 'user',
        created_at: new Date().toISOString()
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(existing));
      return existing as User;
    } catch (error: any) {
      if (error.code === 'auth/unauthorized-domain') {
        throw new Error("Domain Unauthorized: Add Netlify URL in Firebase Settings.");
      }
      throw error;
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
