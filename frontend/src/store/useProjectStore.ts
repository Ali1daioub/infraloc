import { create } from "zustand";
import type { Project, Activity, Dependency } from "@/types/schedule";
import { projectsApi, activitiesApi, dependenciesApi } from "@/lib/api";

interface ProjectStore {
  // Projects
  projects: Project[];
  currentProject: Project | null;
  loadProjects: () => Promise<void>;
  setCurrentProject: (project: Project | null) => void;

  // Activities
  activities: Activity[];
  selectedActivityId: string | null;
  loadActivities: (projectId: string) => Promise<void>;
  selectActivity: (id: string | null) => void;
  updateActivity: (projectId: string, activityId: string, data: Partial<Activity>) => Promise<void>;

  // Dependencies
  dependencies: Dependency[];
  loadDependencies: (projectId: string) => Promise<void>;

  // UI state
  loading: boolean;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  currentProject: null,
  activities: [],
  selectedActivityId: null,
  dependencies: [],
  loading: false,

  loadProjects: async () => {
    set({ loading: true });
    try {
      const res = await projectsApi.list();
      set({ projects: res.data });
    } finally {
      set({ loading: false });
    }
  },

  setCurrentProject: (project) => set({ currentProject: project }),

  loadActivities: async (projectId) => {
    const res = await activitiesApi.list(projectId);
    set({ activities: res.data });
  },

  selectActivity: (id) => set({ selectedActivityId: id }),

  updateActivity: async (projectId, activityId, data) => {
    await activitiesApi.update(projectId, activityId, data);
    const activities = get().activities.map((a) =>
      a.id === activityId ? { ...a, ...data } : a
    );
    set({ activities });
  },

  loadDependencies: async (projectId) => {
    const res = await dependenciesApi.list(projectId);
    set({ dependencies: res.data });
  },
}));
