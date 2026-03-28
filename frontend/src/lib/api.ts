import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  headers: { "Content-Type": "application/json" },
});

// Attach auth token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("infraloc_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auth
export const authApi = {
  register: (data: { email: string; password: string; full_name: string; org_name?: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
};

// Projects
export const projectsApi = {
  list: () => api.get("/projects/"),
  get: (id: string) => api.get(`/projects/${id}`),
  create: (data: { name: string; description?: string; total_length?: number; start_chainage?: number; end_chainage?: number }) =>
    api.post("/projects/", data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

// Activities
export const activitiesApi = {
  list: (projectId: string) => api.get(`/projects/${projectId}/activities`),
  create: (projectId: string, data: Record<string, unknown>) =>
    api.post(`/projects/${projectId}/activities`, data),
  update: (projectId: string, activityId: string, data: Record<string, unknown>) =>
    api.patch(`/projects/${projectId}/activities/${activityId}`, data),
  delete: (projectId: string, activityId: string) =>
    api.delete(`/projects/${projectId}/activities/${activityId}`),
};

// Dependencies
export const dependenciesApi = {
  list: (projectId: string) => api.get(`/projects/${projectId}/dependencies`),
  create: (projectId: string, data: Record<string, unknown>) =>
    api.post(`/projects/${projectId}/dependencies`, data),
};

// Import
export const importApi = {
  upload: (projectId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`/projects/${projectId}/import/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// Schedule
export const scheduleApi = {
  calculate: (projectId: string) => api.post(`/projects/${projectId}/schedule/calculate`),
};

export default api;
