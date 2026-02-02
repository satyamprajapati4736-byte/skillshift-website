
import { User, Gender } from "../types";
import { dbService } from "./dbService";

const SESSION_KEY = 'skillshift_current_user';

export const authService = {
  // Simplified entry instead of auth
  saveProfile: async (name: string, phone: string, gender: Gender): Promise<User> => {
    // Artificial delay for feedback
    await new Promise(r => setTimeout(r, 600));
    
    const user = await dbService.createProfile(name, phone, gender);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser: (): User | null => {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  }
};
