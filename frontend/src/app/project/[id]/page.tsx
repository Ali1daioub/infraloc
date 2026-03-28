"use client";

import React, { useEffect, useState, useCallback, use } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { projectsApi, activitiesApi, dependenciesApi, scheduleApi } from "@/lib/api";
import type { Project, Activity, Dependency } from "@/types/schedule";
import { useHistoryStore } from "@/store/useHistoryStore";
import ActivityPanel from "@/components/diagram/ActivityPanel";
import ImportDialog from "@/components/diagram/ImportDialog";
import CanvasToolbar from "@/components/diagram/CanvasToolbar";

const TimeDistanceDiagram = dynamic(
  () => import("@/components/diagram/TimeDistanceDiagram"),
  { ssr: false }
);

let activityCounter = 0;

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [diagramSize, setDiagramSize] = useState({ width: 800, height: 600 });

  const history = useHistoryStore();

  useEffect(() => {
    loadProject();
    loadActivities();
    loadDependencies();
  }, [projectId]);

  useEffect(() => {
    const updateSize = () => {
      setDiagramSize({
        width: Math.max(600, window.innerWidth - 320),
        height: Math.max(400, window.innerHeight - 56),
      });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        history.undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        history.redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [history]);

  const loadProject = async () => {
    try {
      const res = await projectsApi.get(projectId);
      setProject(res.data);
    } catch {
      router.push("/");
    }
  };

  const loadActivities = async () => {
    const res = await activitiesApi.list(projectId);
    setActivities(res.data);
    activityCounter = res.data.length;
  };

  const loadDependencies = async () => {
    const res = await dependenciesApi.list(projectId);
    setDependencies(res.data);
  };

  const handleUpdateActivity = useCallback(
    async (activityId: string, data: Partial<Activity>) => {
      const original = activities.find((a) => a.id === activityId);
      if (!original) return;

      // Optimistic update
      setActivities((prev) => prev.map((a) => (a.id === activityId ? { ...a, ...data } : a)));
      await activitiesApi.update(projectId, activityId, data);

      // Build undo data
      const undoData: Partial<Activity> = {};
      for (const key of Object.keys(data) as (keyof Activity)[]) {
        (undoData as any)[key] = original[key];
      }
      history.push({
        type: "update_activity",
        description: `Update ${original.name}`,
        undo: async () => {
          await activitiesApi.update(projectId, activityId, undoData);
          setActivities((prev) => prev.map((a) => (a.id === activityId ? { ...a, ...undoData } : a)));
        },
        redo: async () => {
          await activitiesApi.update(projectId, activityId, data);
          setActivities((prev) => prev.map((a) => (a.id === activityId ? { ...a, ...data } : a)));
        },
      });
    },
    [projectId, activities, history]
  );

  const handleCreateActivity = useCallback(
    async (data: { activity_type: string; start_chainage: number; end_chainage: number; planned_start: string; planned_finish: string }) => {
      activityCounter++;
      const code = `A-${String(activityCounter).padStart(4, "0")}`;
      const payload = {
        activity_code: code,
        name: `New ${data.activity_type} activity`,
        ...data,
        color: data.activity_type === "linear" ? "#3b82f6" : data.activity_type === "block" ? "#8b5cf6" : "#f59e0b",
      };

      const res = await activitiesApi.create(projectId, payload);
      const newActivity = res.data;
      setActivities((prev) => [...prev, newActivity]);
      setSelectedActivityId(newActivity.id);

      history.push({
        type: "create_activity",
        description: `Create ${code}`,
        undo: async () => {
          await activitiesApi.delete(projectId, newActivity.id);
          setActivities((prev) => prev.filter((a) => a.id !== newActivity.id));
        },
        redo: async () => {
          const res2 = await activitiesApi.create(projectId, payload);
          setActivities((prev) => [...prev, res2.data]);
        },
      });
    },
    [projectId, history]
  );

  const handleDeleteActivity = useCallback(
    async (activityId: string) => {
      const deleted = activities.find((a) => a.id === activityId);
      if (!deleted) return;

      await activitiesApi.delete(projectId, activityId);
      setActivities((prev) => prev.filter((a) => a.id !== activityId));
      if (selectedActivityId === activityId) setSelectedActivityId(null);

      history.push({
        type: "delete_activity",
        description: `Delete ${deleted.name}`,
        undo: async () => {
          const res = await activitiesApi.create(projectId, deleted as any);
          setActivities((prev) => [...prev, res.data]);
        },
        redo: async () => {
          await activitiesApi.delete(projectId, activityId).catch(() => {});
          setActivities((prev) => prev.filter((a) => a.id !== activityId));
        },
      });
    },
    [projectId, activities, selectedActivityId, history]
  );

  const handleCreateDependency = useCallback(
    async (predecessorId: string, successorId: string) => {
      const res = await dependenciesApi.create(projectId, {
        predecessor_id: predecessorId,
        successor_id: successorId,
        dependency_type: "FS",
        lag_hours: 0,
      });
      const newDep = res.data;
      setDependencies((prev) => [...prev, newDep]);

      history.push({
        type: "create_dependency",
        description: "Create link",
        undo: async () => {
          await dependenciesApi.delete(projectId, newDep.id);
          setDependencies((prev) => prev.filter((d) => d.id !== newDep.id));
        },
        redo: async () => {
          const res2 = await dependenciesApi.create(projectId, {
            predecessor_id: predecessorId,
            successor_id: successorId,
            dependency_type: "FS",
            lag_hours: 0,
          });
          setDependencies((prev) => [...prev, res2.data]);
        },
      });
    },
    [projectId, history]
  );

  const handleDeleteDependency = useCallback(
    async (depId: string) => {
      const dep = dependencies.find((d) => d.id === depId);
      if (!dep) return;
      await dependenciesApi.delete(projectId, depId);
      setDependencies((prev) => prev.filter((d) => d.id !== depId));
    },
    [projectId, dependencies]
  );

  const handleCalculate = async () => {
    await scheduleApi.calculate(projectId);
    await loadActivities();
  };

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted text-sm">Loading project...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Toolbar */}
      <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <button className="text-sm text-muted hover:text-foreground transition-colors"
            onClick={() => router.push("/")}>
            &larr; Projects
          </button>
          <div className="h-4 w-px bg-border" />
          <div>
            <h1 className="text-sm font-semibold text-foreground">{project.name}</h1>
            <p className="text-[10px] text-muted font-mono">
              {project.start_chainage}–{project.end_chainage || "?"} {project.chainage_unit}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-xs bg-surface-2 text-foreground rounded-lg hover:bg-border transition-colors border border-border"
            onClick={() => setShowImport(true)}>
            Import
          </button>
          <button className="px-3 py-1.5 text-xs bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors font-medium"
            onClick={handleCalculate}>
            Calculate CPM
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Diagram */}
        <div className="flex-1 relative overflow-hidden bg-background">
          <TimeDistanceDiagram
            activities={activities}
            dependencies={dependencies}
            selectedActivityId={selectedActivityId}
            onSelectActivity={setSelectedActivityId}
            onUpdateActivity={handleUpdateActivity}
            onCreateActivity={handleCreateActivity}
            onCreateDependency={handleCreateDependency}
            onDeleteActivity={handleDeleteActivity}
            onDeleteDependency={handleDeleteDependency}
            startChainage={project.start_chainage}
            endChainage={project.end_chainage || 10000}
            chainageUnit={project.chainage_unit}
            width={diagramSize.width}
            height={diagramSize.height}
          />
          <CanvasToolbar />
        </div>

        {/* Side panel */}
        <ActivityPanel
          activities={activities}
          selectedActivityId={selectedActivityId}
          onSelectActivity={setSelectedActivityId}
          onUpdateActivity={handleUpdateActivity}
        />
      </div>

      {/* Import dialog */}
      <ImportDialog
        projectId={projectId}
        open={showImport}
        onClose={() => setShowImport(false)}
        onImported={() => { loadActivities(); loadDependencies(); }}
      />
    </div>
  );
}
