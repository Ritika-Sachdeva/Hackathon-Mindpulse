import type { User } from '../types';

const getApiUrl = () => {
  // Safe access using optional chaining
  return import.meta.env?.VITE_API_URL || 'http://localhost:3001';
};

const BASE_URL = getApiUrl();
const API_URL = `${BASE_URL}/api`;
const STORAGE_KEY_SESSION = 'mindpulse_session';

export const apiLogin = async (email: string, password: string): Promise<User> => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const data = await response.json();
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(data.user));
    return data.user;
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

export const apiSignup = async (name: string, email: string, role: 'member' | 'admin', groupCode: string, password: string): Promise<User> => {
  try {
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, role, groupCode, password }) 
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Signup failed');
    }

    const data = await response.json();
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(data.user));
    return data.user;
  } catch (error) {
    console.error("Signup Error:", error);
    throw error;
  }
};

export const apiLogout = async () => {
  localStorage.removeItem(STORAGE_KEY_SESSION);
};

export const getSession = (): User | null => {
  const stored = localStorage.getItem(STORAGE_KEY_SESSION);
  return stored ? JSON.parse(stored) : null;
};

export const getGroupMembers = async (groupId: string): Promise<User[]> => {
  try {
    const response = await fetch(`${API_URL}/users?groupId=${groupId}`);
    if (!response.ok) return [];
    return await response.json();
  } catch (e) {
    console.error("Failed to fetch members", e);
    return [];
  }
};