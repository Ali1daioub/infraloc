"use client";

import React, { useEffect, useState, useCallback, use } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { projectsApi, activitiesApi, dependenciesApi, scheduleApi } from "@/lib/api";
import type { Project, Activity, Dependency } from "@/types/schedule";
import ActivityPanel from "@/components/diagram/ActivityPanel";
import ImportDialog from "@/components/diagram/ImportDialog";

// Konva must be loaded client-side only
const TimeDistanceDiagram = dynamic(
  () => import("@/components/diagram/TimeDistanceDiagram"),
  { ssr: false }
);

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [diagramSize, setDiagramSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    loadProject();
    loadActivities();
    loadDependencies();
  }, [projectId]);

  useEffect(() => {
    const updateSize = () => {
      // Subtract panel width (320px) and some padding
      setDiagramSize({
        width: Math.max(600, window.innerWidth - 320),
        height: Math.max(400, window.innerHeight - 64),
      });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

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
  };

  const loadDependencies = async () => {
    const res = await dependenciesApi.list(projectId);
    setDependencies(res.data);
  };

  const handleUpdateActivity = useCallback(
    async (activityId: string, data: Partial<Activity>) => {
      await activitiesApi.update(projectId, activityId, data);
      setActivities((prev) =>
        prev.map((a) => (a.id === activityId ? { ...a, ...data } : a))
      );
    },
    [projectId]
  );

  const handleCalculate = async () => {
    await scheduleApi.calculate(projectId);
    await loadActivities();
  };

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading project...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Toolbar */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <button
            className="text-sm text-gray-500 hover:text-gray-700"
            onClick={() => router.push("/")}
          >
            &larr; Projects
          </button>
          <div>
            <h1 className="text-sm font-bold text-gray-900">{project.name}</h1>
            <p className="text-[10px] text-gray-500">
              {project.start_chainage}–{project.end_chainage || "?"} {project.chainage_unit}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            onClick={() => setShowImport(true)}
          >
            Import File
          </button>
          <button
            className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={handleCalculate}
          >
            Calculate CPM
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Diagram */}
        <div className="flex-1 bg-gray-50 overflow-hidden">
          <TimeDistanceDiagram
            activities={activities}
            dependencies={dependencies}
            selectedActivityId={selectedActivityId}
            onSelectActivity={setSelectedActivityId}
            onUpdateActivity={handleUpdateActivity}
            startChainage={project.start_chainage}
            endChainage={project.end_chainage || 10000}
            chainageUnit={project.chainage_unit}
            width={diagramSize.width}
            height={diagramSize.height}
          />
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
        onImported={() => {
          loadActivities();
          loadDependencies();
        }}
      />
    </div>
  );
}
