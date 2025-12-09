import type { MoodEntry } from '../types';

const BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001';
const API_URL = `${BASE_URL}/api`;

export const fetchEntries = async (): Promise<MoodEntry[]> => {
  try {
    const response = await fetch(`${API_URL}/entries`);
    if (!response.ok) throw new Error("Failed to fetch entries");
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
};

export const createEntry = async (entry: MoodEntry): Promise<MoodEntry | null> => {
  try {
    const response = await fetch(`${API_URL}/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    
    if (!response.ok) throw new Error("Failed to save entry");
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
};

export const fetchGroupAnnouncement = async (groupId: string, userId: string): Promise<{announcement: string, vibes: number, userVibedToday: boolean}> => {
  try {
    const response = await fetch(`${API_URL}/groups/${groupId}?userId=${userId}`);
    if (!response.ok) return { announcement: '', vibes: 0, userVibedToday: false };
    const data = await response.json();
    return { 
      announcement: data.announcement || '', 
      vibes: data.vibes || 0,
      userVibedToday: data.userVibedToday || false
    };
  } catch (error) {
    console.error("Failed to fetch announcement", error);
    return { announcement: '', vibes: 0, userVibedToday: false };
  }
};

export const updateGroupAnnouncement = async (groupId: string, announcement: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/groups/${groupId}/announcement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ announcement })
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to update announcement", error);
    return false;
  }
};

export const sendGroupVibe = async (groupId: string, userId: string): Promise<number | null> => {
  try {
    const response = await fetch(`${API_URL}/groups/${groupId}/vibes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.vibes;
  } catch (error) {
    console.error("Failed to send vibe", error);
    return null;
  }
}