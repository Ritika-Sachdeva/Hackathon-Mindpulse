import type { MoodEntry, GroupAnalysis } from "../types";

const getApiUrl = () => {
  return import.meta.env?.VITE_API_URL || 'http://localhost:3001';
};

const API_URL = getApiUrl();
const API_BASE_URL = `${API_URL}/api/ai`;

/**
 * Analyzes a single mood entry by calling the backend AI service.
 */
export const analyzeMoodEntry = async (note: string, stressLevel: number): Promise<{ sentimentScore: number; burnoutRisk: boolean; aiIntervention: string; tags: string[] }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note, stressLevel })
    });

    if (!response.ok) {
      throw new Error(`Backend Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Analysis failed", error);
    return {
      sentimentScore: 0,
      burnoutRisk: stressLevel > 7,
      aiIntervention: "Take a deep breath and stay hydrated. (Offline/Demo Mode)",
      tags: ["Offline Mode"]
    };
  }
};

/**
 * Generates an aggregated group report by calling the backend AI service.
 */
export const generateGroupReport = async (entries: MoodEntry[]): Promise<GroupAnalysis> => {
  try {
    const response = await fetch(`${API_BASE_URL}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries })
    });

    if (!response.ok) {
        // Try to get the actual error text from the server
        const errText = await response.text();
        throw new Error(errText || 'Group Report Service Failed');
    }

    return await response.json();
  } catch (error: any) {
    console.error("Group report failed", error);
    // Return a visible error state in the UI object
    return {
      overallWellnessScore: 0,
      burnoutRiskLevel: 'Low',
      summary: `Report Generation Failed: ${error.message || "Unknown Error"}`,
      recommendations: ["Ensure server is running", "Check server/.env API_KEY", "Check Server Console Logs"],
      lastUpdated: new Date().toISOString()
    };
  }
};

/**
 * Chatbot functionality routing through backend.
 */
export const getChatResponse = async (history: { role: string, parts: { text: string }[] }[], newMessage: string) => {
    try {
      // Send history as-is; Backend will handle role mapping (model -> assistant)
      // We pass the structure: { role: 'user'|'model', parts: [{text: '...'}] }
      
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history, message: newMessage })
      });

      if (!response.ok) {
        if (response.status === 503) throw new Error("MISSING_API_KEY");
        const errText = await response.text();
        throw new Error(errText || "Network Error");
      }

      const data = await response.json();
      return data.text;
    } catch (error: any) {
       console.error("Chat Error", error);
       if (error.message.includes("MISSING_API_KEY")) {
         throw new Error("MISSING_API_KEY");
       }
       throw error;
    }
}