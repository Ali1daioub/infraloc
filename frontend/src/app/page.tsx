"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi, projectsApi } from "@/lib/api";
import type { Project } from "@/types/schedule";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [authForm, setAuthForm] = useState({ email: "", password: "", full_name: "", org_name: "" });
  const [newProject, setNewProject] = useState({ name: "", description: "", end_chainage: "" });
  const [showNewProject, setShowNewProject] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("infraloc_token");
    if (token) {
      authApi.me().then((res) => {
        setUser(res.data);
        loadProjects();
      }).catch(() => {
        localStorage.removeItem("infraloc_token");
        setShowAuth(true);
      });
    } else {
      setShowAuth(true);
    }
  }, []);

  const loadProjects = async () => {
    const res = await projectsApi.list();
    setProjects(res.data);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = isLogin
        ? await authApi.login({ email: authForm.email, password: authForm.password })
        : await authApi.register(authForm);
      localStorage.setItem("infraloc_token", res.data.access_token);
      const me = await authApi.me();
      setUser(me.data);
      setShowAuth(false);
      loadProjects();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Authentication failed");
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await projectsApi.create({
        name: newProject.name,
        description: newProject.description || undefined,
        end_chainage: newProject.end_chainage ? Number(newProject.end_chainage) : undefined,
      });
      setShowNewProject(false);
      setNewProject({ name: "", description: "", end_chainage: "" });
      router.push(`/project/${res.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create project");
    }
  };

  if (showAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-[420px]">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">InfraLoc</h1>
            <p className="text-sm text-gray-500 mt-1">Cloud-native linear scheduling</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <>
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
                  placeholder="Full name"
                  value={authForm.full_name}
                  onChange={(e) => setAuthForm({ ...authForm, full_name: e.target.value })}
                  required
                />
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
                  placeholder="Organization name (optional)"
                  value={authForm.org_name}
                  onChange={(e) => setAuthForm({ ...authForm, org_name: e.target.value })}
                />
              </>
            )}
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
              type="email"
              placeholder="Email"
              value={authForm.email}
              onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              required
            />
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
              type="password"
              placeholder="Password"
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              required
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700">
              {isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            {isLogin ? "No account?" : "Already have an account?"}{" "}
            <button className="text-blue-600 font-medium" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">InfraLoc</h1>
            <p className="text-xs text-gray-500">Linear Scheduling Platform</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.full_name}</span>
            <button
              className="text-sm text-gray-500 hover:text-gray-700"
              onClick={() => {
                localStorage.removeItem("infraloc_token");
                setUser(null);
                setShowAuth(true);
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
          <button
            className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700"
            onClick={() => setShowNewProject(true)}
          >
            + New Project
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="text-4xl mb-3">~</div>
            <h3 className="text-lg font-semibold text-gray-900">No projects yet</h3>
            <p className="text-sm text-gray-500 mt-1">
              Create your first project or import a schedule from P6, MS Project, or TILOS.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/project/${project.id}`)}
              >
                <h3 className="font-semibold text-gray-900">{project.name}</h3>
                {project.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{project.description}</p>
                )}
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                  <span>
                    {project.start_chainage}–{project.end_chainage || "?"} {project.chainage_unit}
                  </span>
                  <span>{new Date(project.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* New project dialog */}
        {showNewProject && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-[450px]">
              <h3 className="text-lg font-bold text-gray-900 mb-4">New Project</h3>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
                  placeholder="Project name (e.g., Highway A1 Expansion)"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  required
                />
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
                  placeholder="Description (optional)"
                  rows={2}
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
                  type="number"
                  placeholder="Total length / end chainage (meters)"
                  value={newProject.end_chainage}
                  onChange={(e) => setNewProject({ ...newProject, end_chainage: e.target.value })}
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                    onClick={() => setShowNewProject(false)}
                  >
                    Cancel
                  </button>
                  <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
