import { 
  collection, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  setDoc,
  doc,
  getDoc,
  orderBy, 
  limit
} from "firebase/firestore";
import { db } from "../firebase";
import { RoadmapRecord, User, Gender } from "../types";

const ADMIN_PHONES = ["7991500823", "9991234567", "9876543210"];

export const dbService = {
  getUserProfile: async (uid: string): Promise<User | null> => {
    try {
      if (!uid) return null;
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { ...docSnap.data(), id: docSnap.id } as User;
      }
      return null;
    } catch (error) {
      console.error("Firestore: getUserProfile failed:", error);
      return null;
    }
  },

  createProfile: async (uid: string, name: string, phone: string, gender: Gender): Promise<User> => {
    try {
      // Check if profile exists already to avoid unnecessary writes
      const existing = await dbService.getUserProfile(uid);
      if (existing) return existing;

      const newUser: any = {
        name: name || "User",
        phone: phone || "0000000000",
        gender: gender || "Other",
        role: (phone && ADMIN_PHONES.includes(phone)) ? 'admin' : 'user',
        created_at: new Date().toISOString()
      };
      
      // Use setDoc with merge to be extra safe
      await setDoc(doc(db, "users", uid), newUser, { merge: true });
      return { ...newUser, id: uid };
    } catch (error) {
      console.error("Firestore: createProfile failed:", error);
      // Fallback for UI continuity
      return {
        id: uid,
        name: name || "User",
        phone: phone || "0000000000",
        gender: gender || "Other",
        role: 'user',
        created_at: new Date().toISOString()
      };
    }
  },

  getGlobalStats: async () => {
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const roadmapsSnap = await getDocs(collection(db, "roadmaps"));
      return {
        totalUsers: usersSnap.size,
        totalRoadmaps: roadmapsSnap.size,
        recentUsers: usersSnap.docs.slice(0, 10).map(d => ({ ...d.data(), id: d.id } as User)),
        recentRoadmaps: roadmapsSnap.docs.slice(0, 10).map(d => ({ ...d.data(), id: d.id } as RoadmapRecord))
      };
    } catch (e) {
      return { totalUsers: 0, totalRoadmaps: 0, recentUsers: [], recentRoadmaps: [] };
    }
  },

  getRecentActivity: async (days: number = 1): Promise<{users: User[], roadmaps: RoadmapRecord[]}> => {
    try {
      const timeLimit = new Date();
      timeLimit.setDate(timeLimit.getDate() - days);
      const uSnap = await getDocs(query(collection(db, "users"), where("created_at", ">=", timeLimit.toISOString())));
      const rSnap = await getDocs(query(collection(db, "roadmaps"), where("created_at", ">=", timeLimit.toISOString())));
      return {
        users: uSnap.docs.map(d => ({ ...d.data(), id: d.id } as User)),
        roadmaps: rSnap.docs.map(d => ({ ...d.data(), id: d.id } as RoadmapRecord))
      };
    } catch (e) {
      return { users: [], roadmaps: [] };
    }
  },

  getAllUsers: async (): Promise<User[]> => {
    try {
      const snap = await getDocs(collection(db, "users"));
      return snap.docs.map(d => ({ ...d.data(), id: d.id } as User));
    } catch (e) { return []; }
  },

  getAllRoadmaps: async (): Promise<RoadmapRecord[]> => {
    try {
      const snap = await getDocs(collection(db, "roadmaps"));
      return snap.docs.map(d => ({ ...d.data(), id: d.id } as RoadmapRecord));
    } catch (e) { return []; }
  },

  saveRoadmap: async (user_id: string, roadmapData: any): Promise<RoadmapRecord> => {
    const newRecord = {
      user_id,
      skill_name: roadmapData.skillName,
      user_goal: roadmapData.userGoal,
      overview: roadmapData.overview || '',
      ai_json: roadmapData,
      created_at: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, "roadmaps"), newRecord);
    return { ...newRecord, id: docRef.id };
  },

  getRoadmapsByUserId: async (user_id: string): Promise<RoadmapRecord[]> => {
    try {
      const q = query(collection(db, "roadmaps"), where("user_id", "==", user_id), orderBy("created_at", "desc"), limit(10));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ ...d.data(), id: d.id } as RoadmapRecord));
    } catch (e) { return []; }
  }
};