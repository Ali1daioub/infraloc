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
      authApi.me().then((res) => { setUser(res.data); loadProjects(); })
        .catch(() => { localStorage.removeItem("infraloc_token"); setShowAuth(true); });
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-surface rounded-2xl border border-border shadow-2xl p-8 w-[420px]">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground">InfraLoc</h1>
            <p className="text-sm text-muted mt-1">Cloud-native linear scheduling</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-3">
            {!isLogin && (
              <>
                <input className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
                  placeholder="Full name" value={authForm.full_name}
                  onChange={(e) => setAuthForm({ ...authForm, full_name: e.target.value })} required />
                <input className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
                  placeholder="Organization name (optional)" value={authForm.org_name}
                  onChange={(e) => setAuthForm({ ...authForm, org_name: e.target.value })} />
              </>
            )}
            <input className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
              type="email" placeholder="Email" value={authForm.email}
              onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} required />
            <input className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
              type="password" placeholder="Password" value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} required />
            {error && <p className="text-sm text-critical">{error}</p>}
            <button className="w-full bg-accent text-white rounded-lg py-2.5 text-sm font-medium hover:bg-accent-hover transition-colors">
              {isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-muted mt-4">
            {isLogin ? "No account?" : "Already have an account?"}{" "}
            <button className="text-accent font-medium hover:underline" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">InfraLoc</h1>
            <p className="text-[10px] text-muted uppercase tracking-wider">Linear Scheduling Platform</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted">{user?.full_name}</span>
            <button className="text-xs text-muted hover:text-foreground transition-colors"
              onClick={() => { localStorage.removeItem("infraloc_token"); setUser(null); setShowAuth(true); }}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Projects</h2>
          <button className="bg-accent text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-accent-hover transition-colors"
            onClick={() => setShowNewProject(true)}>
            + New Project
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="bg-surface rounded-xl border border-border p-12 text-center">
            <h3 className="text-lg font-semibold text-foreground">No projects yet</h3>
            <p className="text-sm text-muted mt-1">
              Create your first project or import a schedule from P6, MS Project, or TILOS.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div key={project.id}
                className="bg-surface rounded-xl border border-border p-5 hover:border-accent/50 transition-all cursor-pointer group"
                onClick={() => router.push(`/project/${project.id}`)}>
                <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">{project.name}</h3>
                {project.description && (
                  <p className="text-sm text-muted mt-1 line-clamp-2">{project.description}</p>
                )}
                <div className="flex items-center gap-4 mt-3 text-[10px] text-muted font-mono">
                  <span>{project.start_chainage}–{project.end_chainage || "?"} {project.chainage_unit}</span>
                  <span>{new Date(project.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* New project dialog */}
        {showNewProject && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-surface rounded-xl border border-border shadow-2xl p-6 w-[450px]">
              <h3 className="text-lg font-bold text-foreground mb-4">New Project</h3>
              <form onSubmit={handleCreateProject} className="space-y-3">
                <input className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
                  placeholder="Project name (e.g., Highway A1 Expansion)" value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} required />
                <textarea className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
                  placeholder="Description (optional)" rows={2} value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} />
                <input className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
                  type="number" placeholder="Total length / end chainage (meters)" value={newProject.end_chainage}
                  onChange={(e) => setNewProject({ ...newProject, end_chainage: e.target.value })} />
                {error && <p className="text-sm text-critical">{error}</p>}
                <div className="flex gap-3 justify-end pt-1">
                  <button type="button" className="px-4 py-2 text-sm text-muted hover:text-foreground rounded-lg hover:bg-surface-2 transition-colors"
                    onClick={() => setShowNewProject(false)}>Cancel</button>
                  <button className="px-4 py-2 text-sm bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors font-medium">
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
