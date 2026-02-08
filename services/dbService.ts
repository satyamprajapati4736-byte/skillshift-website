
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  orderBy, 
  limit, 
  Timestamp,
  serverTimestamp,
  getCountFromServer
} from "firebase/firestore";
import { db } from "../firebase";
import { RoadmapRecord, User, Gender } from "../types";

const ADMIN_PHONES = ["7991500823", "9991234567", "9876543210"];

export const dbService = {
  // Cloud Profile Creation/Sync
  createProfile: async (name: string, phone: string, gender: Gender): Promise<User> => {
    const usersRef = collection(db, "users");
    // Optimized search by phone with limit 1
    const q = query(usersRef, where("phone", "==", phone), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const existingData = querySnapshot.docs[0].data() as User;
      return { ...existingData, id: querySnapshot.docs[0].id };
    }

    const newUser: any = {
      name,
      phone,
      gender,
      role: ADMIN_PHONES.includes(phone) ? 'admin' : 'user',
      created_at: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, "users"), newUser);
    return { ...newUser, id: docRef.id };
  },

  // HIGH SCALE OPTIMIZATION: Use getCountFromServer instead of fetching all docs
  getGlobalStats: async () => {
    const usersColl = collection(db, "users");
    const roadmapsColl = collection(db, "roadmaps");
    
    // Aggregation queries are extremely efficient for 100k+ records
    const [usersCount, roadmapsCount] = await Promise.all([
      getCountFromServer(usersColl),
      getCountFromServer(roadmapsColl)
    ]);

    // Fetch only the most recent 50 for the activity stream
    const recentUsersQuery = query(usersColl, orderBy("created_at", "desc"), limit(50));
    const recentRoadmapsQuery = query(roadmapsColl, orderBy("created_at", "desc"), limit(50));
    
    const [usersSnap, roadmapsSnap] = await Promise.all([
      getDocs(recentUsersQuery),
      getDocs(recentRoadmapsQuery)
    ]);
    
    return {
      totalUsers: usersCount.data().count,
      totalRoadmaps: roadmapsCount.data().count,
      recentUsers: usersSnap.docs.map(d => ({ ...d.data(), id: d.id } as User)),
      recentRoadmaps: roadmapsSnap.docs.map(d => ({ ...d.data(), id: d.id } as RoadmapRecord)),
      isScaling: true
    };
  },

  // Optimized report fetch - filters server-side by date
  getRecentActivity: async (days: number = 1): Promise<{users: User[], roadmaps: RoadmapRecord[]}> => {
    const timeLimit = new Date();
    timeLimit.setDate(timeLimit.getDate() - days);
    const timeStr = timeLimit.toISOString();
    
    const uQuery = query(
      collection(db, "users"), 
      where("created_at", ">=", timeStr),
      limit(500) // Cap for safety
    );
    const rQuery = query(
      collection(db, "roadmaps"), 
      where("created_at", ">=", timeStr),
      limit(500)
    );
    
    const [uSnap, rSnap] = await Promise.all([getDocs(uQuery), getDocs(rQuery)]);
    
    return {
      users: uSnap.docs.map(d => ({ ...d.data(), id: d.id } as User)),
      roadmaps: rSnap.docs.map(d => ({ ...d.data(), id: d.id } as RoadmapRecord))
    };
  },

  // Never fetch everything. Always limit for 100k user support.
  getAllUsers: async (limitCount: number = 50): Promise<User[]> => {
    const q = query(collection(db, "users"), orderBy("created_at", "desc"), limit(limitCount));
    const usersSnap = await getDocs(q);
    return usersSnap.docs.map(d => ({ ...d.data(), id: d.id } as User));
  },

  getAllRoadmaps: async (limitCount: number = 50): Promise<RoadmapRecord[]> => {
    const q = query(collection(db, "roadmaps"), orderBy("created_at", "desc"), limit(limitCount));
    const roadmapsSnap = await getDocs(q);
    return roadmapsSnap.docs.map(d => ({ ...d.data(), id: d.id } as RoadmapRecord));
  },

  // Save Roadmap to Cloud
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

  // Get User's Roadmaps (limited to 10 most recent)
  getRoadmapsByUserId: async (user_id: string): Promise<RoadmapRecord[]> => {
    const q = query(collection(db, "roadmaps"), where("user_id", "==", user_id), orderBy("created_at", "desc"), limit(10));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as RoadmapRecord));
  }
};
