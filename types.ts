
export enum Page {
  HOME = 'home',
  MENTOR = 'mentor',
  FINDER = 'finder',
  ROADMAPS = 'roadmaps',
  BOOST = 'boost',
  PROFILE_ENTRY = 'profile_entry',
  PREPARING = 'preparing',
  ADMIN_DASHBOARD = 'admin_dashboard',
  ADMIN_REPORT = 'admin_report',
  ADMIN_WEEKLY_REPORT = 'admin_weekly_report',
  ADMIN_MONTHLY_REPORT = 'admin_monthly_report'
}

export type UserRole = 'admin' | 'user';
export type Gender = 'Male' | 'Female' | 'Other';

export interface User {
  id: string;
  name: string;
  phone: string;
  gender: Gender;
  role: UserRole;
  created_at: string;
}

export interface RoadmapRecord {
  id: string;
  user_id: string;
  skill_name: string;
  user_goal: string;
  overview: string;
  ai_json: any;
  created_at: string;
}

export interface PDFRecord {
  id: string;
  roadmap_id: string;
  file_name: string;
  file_path: string; 
  file_size: number;
  created_at: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface RoadmapStage {
  days: string;
  title: string;
  task: string;
}

export interface Skill {
  id: string;
  title: string;
  goal: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeToStart: string;
  phoneRequired: boolean;
  tools: string[];
  roadmapStages: RoadmapStage[];
}
