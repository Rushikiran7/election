import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

export const sendVoiceCommand = async (transcript: string, language: string = "en") => {
  const res = await api.post("/api/ai/command", { transcript, language });
  return res.data;
};

// Fetch all constituency names for autocomplete
export const getConstituencies = async (): Promise<string[]> => {
  try {
    const res = await api.get("/api/constituencies");
    return res.data.constituencies;
  } catch {
    return [];
  }
};

// Fetch all candidates for a given constituency name
export const getCandidatesByArea = async (constituency: string) => {
  try {
    const res = await api.get(`/api/candidates/${encodeURIComponent(constituency)}`);
    return res.data;
  } catch {
    return null;
  }
};
