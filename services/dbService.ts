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
  // Get profile by UID - much faster and more reliable
  getUserProfile: async (uid: string): Promise<User | null> => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { ...docSnap.data(), id: docSnap.id } as User;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  },

  createProfile: async (uid: string, name: string, phone: string, gender: Gender): Promise<User> => {
    // 1. Check if user already exists by UID
    const existing = await dbService.getUserProfile(uid);
    if (existing) return existing;

    // 2. Create new profile using UID as Document ID
    const newUser: any = {
      name,
      phone: phone || "0000000000",
      gender,
      role: (phone && ADMIN_PHONES.includes(phone)) ? 'admin' : 'user',
      created_at: new Date().toISOString()
    };
    
    await setDoc(doc(db, "users", uid), newUser);
    return { ...newUser, id: uid };
  },

  getGlobalStats: async () => {
    const usersSnap = await getDocs(collection(db, "users"));
    const roadmapsSnap = await getDocs(collection(db, "roadmaps"));
    
    const users = usersSnap.docs.map(d => ({ ...d.data(), id: d.id } as User));
    const roadmaps = roadmapsSnap.docs.map(d => ({ ...d.data(), id: d.id } as RoadmapRecord));

    return {
      totalUsers: users.length,
      totalRoadmaps: roadmaps.length,
      recentUsers: users.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 50),
      recentRoadmaps: roadmaps.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 50)
    };
  },

  getRecentActivity: async (days: number = 1): Promise<{users: User[], roadmaps: RoadmapRecord[]}> => {
    const timeLimit = new Date();
    timeLimit.setDate(timeLimit.getDate() - days);
    const timeStr = timeLimit.toISOString();
    
    const uSnap = await getDocs(query(collection(db, "users"), where("created_at", ">=", timeStr)));
    const rSnap = await getDocs(query(collection(db, "roadmaps"), where("created_at", ">=", timeStr)));
    
    return {
      users: uSnap.docs.map(d => ({ ...d.data(), id: d.id } as User)),
      roadmaps: rSnap.docs.map(d => ({ ...d.data(), id: d.id } as RoadmapRecord))
    };
  },

  getAllUsers: async (): Promise<User[]> => {
    const usersSnap = await getDocs(query(collection(db, "users"), orderBy("created_at", "desc")));
    return usersSnap.docs.map(d => ({ ...d.data(), id: d.id } as User));
  },

  getAllRoadmaps: async (): Promise<RoadmapRecord[]> => {
    const roadmapsSnap = await getDocs(query(collection(db, "roadmaps"), orderBy("created_at", "desc")));
    return roadmapsSnap.docs.map(d => ({ ...d.data(), id: d.id } as RoadmapRecord));
  },

  saveRoadmap: async (user_id: string, roadmapData: any): Promise<RoadmapRecord> => {
    const newRecord: any = {
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
    const q = query(collection(db, "roadmaps"), where("user_id", "==", user_id), orderBy("created_at", "desc"), limit(10));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as RoadmapRecord));
  }
};