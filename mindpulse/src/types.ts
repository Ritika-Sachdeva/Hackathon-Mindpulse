export const Mood = {
  Great: 'Great',
  Good: 'Good',
  Neutral: 'Neutral',
  Bad: 'Bad',
  Awful: 'Awful'
} as const;
export type Mood = (typeof Mood)[keyof typeof Mood];
export interface MoodEntry {
  id: string;
  userId: string;
  timestamp: string; // ISO String
  mood: Mood;
  stressLevel: number; // 1-10
  energyLevel: number; // 1-10
  sleepQuality: number; // 1-10
  note: string;
  // AI Analyzed fields
  sentimentScore?: number; // -1 to 1
  burnoutRisk?: boolean;
  aiIntervention?: string;
  tags?: string[];
}

export interface User {
  id: string;
  name: string;
  email: string; // Added for auth
  groupId: string; // Added for team management
  role: 'member' | 'admin'; // 'member' = employee/family member, 'admin' = HR/Parent
  avatar: string;
}

export interface GroupAnalysis {
  overallWellnessScore: number;
  burnoutRiskLevel: 'Low' | 'Medium' | 'High';
  summary: string;
  recommendations: string[];
  lastUpdated: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}