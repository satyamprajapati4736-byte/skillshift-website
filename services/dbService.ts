
import { RoadmapRecord, PDFRecord, User, Gender } from "../types";

const TABLES = {
  USERS: 'skillshift_users',
  ROADMAPS: 'skillshift_roadmaps',
  PDF_FILES: 'skillshift_pdf_files'
};

// Admin Whitelist (Optional reference)
// NOTE: Change these numbers to your own phone numbers to test admin access
const ADMIN_PHONES = ["9991234567", "8881234567", "9876543210"];

// Simulated DB Utility
const getTable = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');
const saveToTable = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

export const dbService = {
  // Simple Profile Creation
  createProfile: async (name: string, phone: string, gender: Gender): Promise<User> => {
    const users = getTable(TABLES.USERS);
    
    // Check if user already exists with this phone
    let existingUser = users.find((u: any) => u.phone === phone);
    
    if (existingUser) {
      // Update existing user with new name/gender if needed
      existingUser.name = name;
      existingUser.gender = gender;
      saveToTable(TABLES.USERS, users);
      return existingUser;
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      phone,
      gender,
      role: ADMIN_PHONES.includes(phone) ? 'admin' : 'user',
      created_at: new Date().toISOString()
    };
    
    users.push(newUser);
    saveToTable(TABLES.USERS, users);
    return newUser;
  },

  getAllUsers: (): User[] => {
    return getTable(TABLES.USERS);
  },

  getAllRoadmaps: (): RoadmapRecord[] => {
    return getTable(TABLES.ROADMAPS);
  },

  // Roadmaps Table Operations
  saveRoadmap: async (user_id: string, roadmapData: any): Promise<RoadmapRecord> => {
    const roadmaps = getTable(TABLES.ROADMAPS);
    const newRecord: RoadmapRecord = {
      id: `rm_${Math.random().toString(36).substr(2, 9)}`,
      user_id,
      skill_name: roadmapData.skillName,
      user_goal: roadmapData.userGoal,
      overview: roadmapData.overview || '',
      ai_json: roadmapData,
      created_at: new Date().toISOString()
    };
    roadmaps.push(newRecord);
    saveToTable(TABLES.ROADMAPS, roadmaps);
    return newRecord;
  },

  getRoadmapsByUserId: (user_id: string): RoadmapRecord[] => {
    return getTable(TABLES.ROADMAPS).filter((rm: RoadmapRecord) => rm.user_id === user_id);
  },

  // PDF Files Table Operations
  savePDFMetadata: async (roadmap_id: string, fileName: string, size: number, path: string): Promise<PDFRecord> => {
    const pdfs = getTable(TABLES.PDF_FILES);
    const newRecord: PDFRecord = {
      id: `pdf_${Math.random().toString(36).substr(2, 9)}`,
      roadmap_id,
      file_name: fileName,
      file_path: path,
      file_size: size,
      created_at: new Date().toISOString()
    };
    pdfs.push(newRecord);
    saveToTable(TABLES.PDF_FILES, pdfs);
    return newRecord;
  }
};
